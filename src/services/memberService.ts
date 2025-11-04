import type { Member } from "../types/member";
import membersData from "../data/members.json";

// Usando localStorage enquanto n fazem o back
const STORAGE_KEY = "manager_academy_members";

const initMembers = (): Member[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(membersData));
    return membersData as Member[];
  }
  return JSON.parse(stored) as Member[];
};

export const getMembers = (): Member[] => {
  return initMembers();
};

export const getMemberById = (id: string): Member | undefined => {
  const members = getMembers();
  return members.find((m) => m.id === id);
};

export const createMember = (member: Omit<Member, "id">): Member => {
  const members = getMembers();

  if (
    !member.matricula ||
    member.matricula.length !== 10 ||
    !/^\d{10}$/.test(member.matricula)
  ) {
    throw new Error("Matrícula inválida! Deve conter exatamente 10 dígitos.");
  }

  if (members.some((m) => m.matricula === member.matricula)) {
    throw new Error("Esta matrícula já está cadastrada!");
  }

  const newMember: Member = {
    ...member,
    id: Date.now().toString(),
  };
  members.push(newMember);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  return newMember;
};

export const updateMember = (id: string, data: Partial<Member>): Member => {
  const members = getMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) throw new Error("Membro não encontrado");

  members[index] = { ...members[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  return members[index];
};

export const deleteMember = (id: string): void => {
  const members = getMembers();
  const filtered = members.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

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
