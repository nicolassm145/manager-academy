// Salvar como: src/services/tarefaService.ts

import { getAuthHeaders } from "../config/api";

export interface Tarefa {
  id: number;
  eventoId: number;
  membroId: number;
  descricao: string;
  concluida: boolean;
}

// GET - Lista tarefas de um evento
export async function listarTarefas(eventoId: number | string): Promise<Tarefa[]> {
  const url = `/api/v1/eventos/${eventoId}/tarefas`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// POST - Adiciona tarefa ao evento
export async function adicionarTarefa(
  eventoId: number | string,
  payload: {
    membroId: number;
    descricao: string;
  }
): Promise<Tarefa> {
  const url = `/api/v1/eventos/${eventoId}/tarefas`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// PATCH - Atualiza tarefa
export async function atualizarTarefa(
  tarefaId: number,
  payload: {
    descricao?: string;
    concluido?: boolean;
  }
): Promise<Tarefa> {
  const url = `/api/v1/eventos/tarefas/${tarefaId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}