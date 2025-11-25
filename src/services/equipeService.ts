// Serviço para buscar membros da equipe
import { getAuthHeaders } from "../config/api";

export async function getEquipeMembros(equipeId: string | number) {
  const url = `/api/v1/equipes/listar/${equipeId}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  const equipe = await res.json();
  return Array.isArray(equipe.membros) ? equipe.membros : [];
}
