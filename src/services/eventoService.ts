// Serviços para participantes de eventos
import { getAuthHeaders } from "../config/api";

export async function listarParticipantes(eventoId: string) {
  const url = `/api/v1/eventos/${eventoId}/participantes`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function participarEvento(
  eventoId: string | number,
  payload: {
    membroId?: number;
    status: "pendente" | "confirmado" | "recusado";
    observacao?: string;
  }
) {
  const url = `/api/v1/eventos/${eventoId}/participar`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function atualizarParticipante(
  participanteId: number,
  payload: {
    membroId?: number;
    status?: "pendente" | "confirmado" | "recusado";
    observacao?: string;
  }
) {
  const url = `/api/v1/eventos/participantes/${participanteId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}