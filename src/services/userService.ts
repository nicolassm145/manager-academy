import type { SystemUser } from "../types/admin";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

// Funções para gerenciar usuários do sistema (administração)
export const getUsers = async (): Promise<SystemUser[]> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};

export const getUserById = async (
  id: string
): Promise<SystemUser | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/users?email=${email}`, {
      headers: getAuthHeaders(),
    });
    await handleApiError(response);
    const users = await response.json();
    return users[0];
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    return undefined;
  }
};

export const createUser = async (
  user: Omit<SystemUser, "id" | "dataCriacao">
): Promise<SystemUser> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
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
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  await handleApiError(response);
  return response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
};

export const filterUsers = async (filters: {
  searchTerm?: string;
  role?: string;
}): Promise<SystemUser[]> => {
  const params = new URLSearchParams();
  if (filters.searchTerm) params.append("search", filters.searchTerm);
  if (filters.role) params.append("role", filters.role);

  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};
