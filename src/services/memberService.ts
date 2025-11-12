import type { Member } from "../types/member";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";
import type { ApiUser } from "../types/api";
import {
  apiUserToMember,
  memberToUserCreateRequest,
  memberToUserUpdateRequest,
} from "../types/mappers";

// Funções para consumir a API de usuários (members)

/**
 * GET /api/v1/users/listarTudo (Admin) ou /api/v1/equipes/{equipe_id}/membros (Líder/Membro)
 * Lista todos os usuários ou apenas da equipe do usuário logado
 * Se for Admin: busca todos
 * Se for Líder/Membro: busca apenas da sua equipe
 */
export const getMembers = async (userEquipeId?: number): Promise<Member[]> => {
  try {
    let response;

    // Se tem equipeId, busca membros da equipe específica
    if (userEquipeId) {
      response = await fetch(
        `${API_BASE_URL}/equipes/${userEquipeId}/membros`,
        {
          headers: getAuthHeaders(),
        }
      );
    } else {
      // Admin busca todos
      response = await fetch(
        `${API_BASE_URL}/users/listarTudo?skip=0&limit=1000`,
        {
          headers: getAuthHeaders(),
        }
      );
    }

    await handleApiError(response);
    const apiUsers: ApiUser[] = await response.json();
    // Converte cada ApiUser para Member
    return apiUsers.map(apiUserToMember);
  } catch (error) {
    console.error("Erro ao buscar membros:", error);
    throw error;
  }
};

/**
 * GET /api/v1/users/listar/{user_id}
 * Busca um usuário específico por ID
 * Regras de acesso:
 * - Admin: qualquer usuário
 * - Líder: apenas sua equipe
 * - Membro: apenas próprio
 */
export const getMemberById = async (
  id: string
): Promise<Member | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/listar/${id}`, {
      headers: getAuthHeaders(),
    });
    await handleApiError(response);
    const apiUser: ApiUser = await response.json();
    return apiUserToMember(apiUser);
  } catch (error) {
    console.error("Erro ao buscar membro:", error);
    return undefined;
  }
};

/**
 * POST /api/v1/users/criar
 * Cria um novo usuário (requer permissão de Admin ou Líder)
 * Campos obrigatórios: nomeCompleto, matricula, email, curso, tipoAcesso, password, dataInicio
 */
export const createMember = async (
  member: Omit<Member, "id">
): Promise<Member> => {
  const createRequest = memberToUserCreateRequest(member);

  const response = await fetch(`${API_BASE_URL}/users/criar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(createRequest),
  });
  await handleApiError(response);
  const apiUser: ApiUser = await response.json();
  return apiUserToMember(apiUser);
};

/**
 * PUT /api/v1/users/atualizar/{user_id}
 * Atualiza um usuário existente
 * Regras de acesso:
 * - Admin: todos os campos, qualquer usuário
 * - Líder: todos os campos, apenas sua equipe
 * - Membro: apenas email e password, apenas próprio
 */
export const updateMember = async (
  id: string,
  data: Partial<Member>
): Promise<Member> => {
  const updateRequest = memberToUserUpdateRequest(data);

  const response = await fetch(`${API_BASE_URL}/users/atualizar/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateRequest),
  });
  await handleApiError(response);
  const apiUser: ApiUser = await response.json();
  return apiUserToMember(apiUser);
};

/**
 * DELETE /api/v1/users/deletar/{user_id}
 * Desativa um usuário (soft delete - muda ativo para false)
 * Requer permissão de Admin ou Líder
 * Regras:
 * - Admin: qualquer usuário
 * - Líder: apenas sua equipe
 */
export const deleteMember = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/deletar/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
};

/**
 * Filtra membros localmente (a API não tem endpoint de busca)
 * TODO: Adicionar filtros na API para melhor performance
 */
export const filterMembers = async (filters: {
  searchTerm?: string;
  equipe?: string;
  status?: string;
}): Promise<Member[]> => {
  // Por enquanto, busca todos e filtra localmente
  const allMembers = await getMembers();

  return allMembers.filter((member) => {
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesSearch =
        member.nome.toLowerCase().includes(term) ||
        member.matricula.includes(term) ||
        member.email.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    if (filters.equipe && member.equipe !== filters.equipe) {
      return false;
    }

    if (filters.status && member.status !== filters.status) {
      return false;
    }

    return true;
  });
};
