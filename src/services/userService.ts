import type { SystemUser } from "../types/admin";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

// Funções para gerenciar usuários do sistema (administração)
export const getUsers = async (skip = 0, limit = 50): Promise<SystemUser[]> => {
  const response = await fetch(
    `${API_BASE_URL}/users/listarTudo?skip=${skip}&limit=${limit}`,
    {
      headers: getAuthHeaders(),
    }
  );
  await handleApiError(response);
  return response.json();
};

export const getUserById = async (
  id: string
): Promise<SystemUser | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/listar/${id}`, {
      headers: getAuthHeaders(),
    });
    await handleApiError(response);
    return response.json();
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return undefined;
  }
};

export const getUserByEmail = async (
  email: string
): Promise<SystemUser | undefined> => {
  try {
    // Buscar todos e filtrar por email (já que não há endpoint específico)
    const users = await getUsers();
    return users.find((u) => u.email === email);
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    return undefined;
  }
};

export const createUser = async (
  user: Omit<SystemUser, "id" | "dataCriacao">
): Promise<SystemUser> => {
  const response = await fetch(`${API_BASE_URL}/users/criar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  });
  await handleApiError(response);
  return response.json();
};

export const updateUser = async (
  id: string,
  data: Partial<SystemUser>
): Promise<SystemUser> => {
  const response = await fetch(`${API_BASE_URL}/users/atualizar/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  await handleApiError(response);
  return response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/deletar/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
};

export const filterUsers = async (filters: {
  searchTerm?: string;
  role?: string;
}): Promise<SystemUser[]> => {
  // A API não tem filtros específicos, então fazemos busca local
  const users = await getUsers();

  let filtered = users;

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.nomeCompleto?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  if (filters.role) {
    filtered = filtered.filter((u) => u.tipoAcesso === filters.role);
  }

  return filtered;
};
