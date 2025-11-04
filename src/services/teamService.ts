import type { Team } from "../types/admin";
import teamsData from "../data/teams.json";

const STORAGE_KEY = "manager_academy_teams";

const initTeams = (): Team[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teamsData));
    return teamsData as Team[];
  }
  return JSON.parse(stored) as Team[];
};

export const getTeams = (): Team[] => {
  return initTeams();
};

export const getTeamById = (id: string): Team | undefined => {
  const teams = getTeams();
  return teams.find((t) => t.id === id);
};

export const createTeam = (team: Omit<Team, "id" | "dataCriacao">): Team => {
  const teams = getTeams();
  const newTeam: Team = {
    ...team,
    id: Date.now().toString(),
    dataCriacao: new Date().toISOString().split("T")[0],
  };
  teams.push(newTeam);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  return newTeam;
};

export const updateTeam = (id: string, data: Partial<Team>): Team => {
  const teams = getTeams();
  const index = teams.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Equipe não encontrada");

  teams[index] = { ...teams[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  return teams[index];
};

export const deleteTeam = (id: string): void => {
  const teams = getTeams();
  const filtered = teams.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};


export const filterTeams = (searchTerm: string): Team[] => {
  let teams = getTeams();

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    teams = teams.filter(
      (t) =>
        t.nome.toLowerCase().includes(term) ||
        t.descricao.toLowerCase().includes(term)
    );
  }

  return teams;
};
