import type { SystemUser } from "../types/admin";
import usersData from "../data/users.json";

const STORAGE_KEY = "manager_academy_users";

// Inicializa dados do JSON no localStorage
const initUsers = (): SystemUser[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersData));
    return usersData as SystemUser[];
  }
  return JSON.parse(stored) as SystemUser[];
};

// GET - Listar todos
export const getUsers = (): SystemUser[] => {
  return initUsers();
};

// GET - Buscar por ID
export const getUserById = (id: string): SystemUser | undefined => {
  const users = getUsers();
  return users.find((u) => u.id === id);
};

// GET - Buscar por email (para login)
export const getUserByEmail = (email: string): SystemUser | undefined => {
  const users = getUsers();
  return users.find((u) => u.email === email);
};

// POST - Criar novo
export const createUser = (
  user: Omit<SystemUser, "id" | "dataCriacao">
): SystemUser => {
  const users = getUsers();
  const newUser: SystemUser = {
    ...user,
    id: Date.now().toString(),
    dataCriacao: new Date().toISOString().split("T")[0],
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return newUser;
};

// PUT - Atualizar existente
export const updateUser = (
  id: string,
  data: Partial<SystemUser>
): SystemUser => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("Usuário não encontrado");

  users[index] = { ...users[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users[index];
};

// DELETE - Remover
export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// FILTER - Buscar com filtros
export const filterUsers = (filters: {
  searchTerm?: string;
  role?: string;
}): SystemUser[] => {
  let users = getUsers();

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    users = users.filter(
      (u) =>
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  if (filters.role) {
    users = users.filter((u) => u.role === filters.role);
  }

  return users;
};
