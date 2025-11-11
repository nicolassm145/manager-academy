import type { Team } from "../types/admin";
// import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";
import teamsData from "../data/teams.json";

// TEMPORÁRIO: Usando localStorage até a API de teams estar pronta
const STORAGE_KEY = "manager_academy_teams";

const initTeams = (): Team[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teamsData));
    return teamsData as Team[];
  }
  return JSON.parse(stored) as Team[];
};

// Funções para gerenciar equipes/times
export const getTeams = async (): Promise<Team[]> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/teams`, {
  //   headers: getAuthHeaders(),
  // });
  // await handleApiError(response);
  // return response.json();

  // TEMPORÁRIO: localStorage
  return Promise.resolve(initTeams());
};

export const getTeamById = async (id: string): Promise<Team | undefined> => {
  // TODO: Descomentar quando a API estiver pronta
  // try {
  //   const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
  //     headers: getAuthHeaders(),
  //   });
  //   await handleApiError(response);
  //   return response.json();
  // } catch (error) {
  //   console.error("Erro ao buscar equipe:", error);
  //   return undefined;
  // }

  // TEMPORÁRIO: localStorage
  const teams = initTeams();
  return Promise.resolve(teams.find((t) => t.id === id));
};

export const createTeam = async (
  team: Omit<Team, "id" | "dataCriacao">
): Promise<Team> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/teams`, {
  //   method: "POST",
  //   headers: getAuthHeaders(),
  //   body: JSON.stringify(team),
  // });
  // await handleApiError(response);
  // return response.json();

  // TEMPORÁRIO: localStorage
  const teams = initTeams();
  const newTeam: Team = {
    ...team,
    id: Date.now().toString(),
    dataCriacao: new Date().toISOString().split("T")[0],
  };
  teams.push(newTeam);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  return Promise.resolve(newTeam);
};

export const updateTeam = async (
  id: string,
  data: Partial<Team>
): Promise<Team> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
  //   method: "PUT",
  //   headers: getAuthHeaders(),
  //   body: JSON.stringify(data),
  // });
  // await handleApiError(response);
  // return response.json();

  // TEMPORÁRIO: localStorage
  const teams = initTeams();
  const index = teams.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Equipe não encontrada");

  teams[index] = { ...teams[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  return Promise.resolve(teams[index]);
};

export const deleteTeam = async (id: string): Promise<void> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
  //   method: "DELETE",
  //   headers: getAuthHeaders(),
  // });
  // await handleApiError(response);

  // TEMPORÁRIO: localStorage
  const teams = initTeams();
  const filtered = teams.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return Promise.resolve();
};

export const filterTeams = async (searchTerm: string): Promise<Team[]> => {
  // TODO: Descomentar quando a API estiver pronta
  // const params = new URLSearchParams();
  // if (searchTerm) params.append("search", searchTerm);
  // const response = await fetch(`${API_BASE_URL}/teams?${params.toString()}`, {
  //   headers: getAuthHeaders(),
  // });
  // await handleApiError(response);
  // return response.json();

  // TEMPORÁRIO: localStorage
  let teams = initTeams();
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    teams = teams.filter(
      (t) =>
        t.nome.toLowerCase().includes(term) ||
        t.descricao.toLowerCase().includes(term)
    );
  }
  return Promise.resolve(teams);
};
