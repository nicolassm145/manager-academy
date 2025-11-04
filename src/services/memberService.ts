import type { Member } from "../types/member";
import membersData from "../data/members.json";

// Simula localStorage como banco de dados
const STORAGE_KEY = "manager_academy_members";

// Inicializa dados do JSON no localStorage se não existir
const initMembers = (): Member[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(membersData));
    return membersData as Member[];
  }
  return JSON.parse(stored) as Member[];
};

// GET - Listar todos
export const getMembers = (): Member[] => {
  return initMembers();
};

// GET - Buscar por ID
export const getMemberById = (id: string): Member | undefined => {
  const members = getMembers();
  return members.find((m) => m.id === id);
};

// POST - Criar novo
export const createMember = (member: Omit<Member, "id">): Member => {
  const members = getMembers();
  const newMember: Member = {
    ...member,
    id: Date.now().toString(), // Gera ID único
  };
  members.push(newMember);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  return newMember;
};

// PUT - Atualizar existente
export const updateMember = (id: string, data: Partial<Member>): Member => {
  const members = getMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) throw new Error("Membro não encontrado");

  members[index] = { ...members[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  return members[index];
};

// DELETE - Remover
export const deleteMember = (id: string): void => {
  const members = getMembers();
  const filtered = members.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// FILTER - Buscar com filtros
export const filterMembers = (filters: {
  searchTerm?: string;
  equipe?: string;
  status?: string;
}): Member[] => {
  let members = getMembers();

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    members = members.filter(
      (m) =>
        m.nome.toLowerCase().includes(term) ||
        m.matricula.includes(term) ||
        m.email.toLowerCase().includes(term)
    );
  }

  if (filters.equipe) {
    members = members.filter((m) => m.equipe === filters.equipe);
  }

  if (filters.status) {
    members = members.filter((m) => m.status === filters.status);
  }

  return members;
};
