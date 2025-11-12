import type { Team } from "../types/admin";
import type { Member } from "../types/member";
import type { ApiUser } from "../types/api";
import { apiUserToMember } from "../types/mappers";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

// Funções para gerenciar equipes/times
export const getTeams = async (_userRole?: string, userEquipeId?: string): Promise<Team[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/equipes/listAll`, {
      headers: getAuthHeaders(),
    });
    
    // Se funcionar, retorna todas as equipes
    if (response.ok) {
      return response.json();
    }
    
    // Se der 403, significa que o usuário não tem permissão para /listAll
    // Vamos tentar buscar equipes de forma alternativa
    if (response.status === 403) {
      console.log("⚠️ Sem permissão para listar todas as equipes, tentando alternativa...");
      
      // Para membros e líderes sem permissão: tenta buscar IDs conhecidos
      // Isso é um workaround até o backend fornecer um endpoint público
      const teams: Team[] = [];
      
      // Se tiver a própria equipe, busca ela primeiro
      if (userEquipeId) {
        try {
          const ownTeam = await getTeamById(userEquipeId);
          if (ownTeam) {
            teams.push(ownTeam);
          }
        } catch (error) {
          console.error("Erro ao buscar própria equipe:", error);
        }
      }
      
      // Tenta buscar outras equipes por IDs conhecidos (1 a 10)
      // Isso é um hack temporário - o ideal seria o backend ter um endpoint público
      const teamIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      const fetchPromises = teamIds.map(async (id) => {
        // Pula se já buscou a própria equipe
        if (userEquipeId && id.toString() === userEquipeId) return null;
        
        try {
          const teamResponse = await fetch(`${API_BASE_URL}/equipes/listar/${id}`, {
            headers: getAuthHeaders(),
          });
          
          // Se for 200 OK, retorna a equipe
          if (teamResponse.ok) {
            return await teamResponse.json();
          }
          
          // Se for 403 ou 404, ignora silenciosamente
          return null;
        } catch (error) {
          // Ignora erros silenciosamente
          return null;
        }
      });
      
      // Aguarda todas as requisições
      const results = await Promise.all(fetchPromises);
      
      // Adiciona apenas as equipes válidas que não são duplicadas
      results.forEach(team => {
        if (team && !teams.find(t => t.id === team.id)) {
          teams.push(team);
        }
      });
      
      console.log(`✅ Encontradas ${teams.length} equipes via método alternativo`);
      return teams;
    }
    
    // Para outros erros
    await handleApiError(response);
    return [];
  } catch (error) {
    console.error("Erro ao buscar equipes:", error);
    
    // Fallback: se tiver equipeId, retorna só sua equipe
    if (userEquipeId) {
      try {
        const team = await getTeamById(userEquipeId);
        return team ? [team] : [];
      } catch {
        return [];
      }
    }
    
    return [];
  }
};

export const getTeamById = async (id: string): Promise<Team | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/equipes/listar/${id}`, {
      headers: getAuthHeaders(),
    });
    await handleApiError(response);
    return response.json();
  } catch (error) {
    console.error("Erro ao buscar equipe:", error);
    return undefined;
  }
};

export const createTeam = async (
  team: Omit<Team, "id" | "membros">
): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/equipes/criar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(team),
  });
  await handleApiError(response);
  return response.json();
};

export const updateTeam = async (
  id: string,
  data: Partial<Team>
): Promise<Team> => {
  const response = await fetch(`${API_BASE_URL}/equipes/atualizar/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  await handleApiError(response);
  return response.json();
};

export const deleteTeam = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/equipes/deletar/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
};

export const getTeamMembers = async (teamId: string): Promise<Member[]> => {
  const response = await fetch(`${API_BASE_URL}/equipes/${teamId}/membros`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  const apiUsers: ApiUser[] = await response.json();
  // Converte ApiUsers para Members
  return apiUsers.map(apiUserToMember);
};

export const filterTeams = async (searchTerm: string): Promise<Team[]> => {
  // A API não tem endpoint de busca, então fazemos filtro local
  const teams = await getTeams();

  if (!searchTerm) return teams;

  const term = searchTerm.toLowerCase();
  return teams.filter(
    (t) =>
      t.nome.toLowerCase().includes(term) ||
      t.descricao.toLowerCase().includes(term)
  );
};
