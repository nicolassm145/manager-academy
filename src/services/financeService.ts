import type { Transaction } from "../types/finance";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";
import { getTeams } from "./teamService";

/**
 * GET - Lista todas as transações
 */
export interface TransactionFilters {
  categoria?: string;
  tipo?: "Entrada" | "Saida";
  dataInicio?: string;
  dataFim?: string;
}

export const getTransactions = async (
  filters: TransactionFilters = {}
): Promise<Transaction[]> => {
  const params = new URLSearchParams();
  if (filters.categoria) params.append("categoria", filters.categoria);
  if (filters.tipo) params.append("tipo", filters.tipo);
  if (filters.dataInicio && filters.dataFim) {
    params.append("dataInicio", filters.dataInicio);
    params.append("dataFim", filters.dataFim);
  }
  const url = `${API_BASE_URL}/transacoes/listar${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  const transactions: Transaction[] = await response.json();
  // Resolve nomes das equipes
  const teams = await getTeams();
  return transactions.map((t) => ({
    ...t,
    equipe: t.equipeId
      ? teams.find((team) => String(team.id) === String(t.equipeId))?.nome || ""
      : "",
  }));
};

/**
 * GET - Busca uma transação por ID
 */
export const getTransactionById = async (
  id: string
): Promise<Transaction | undefined> => {
  // Não existe endpoint para buscar por ID, então busca todos e filtra
  const transactions = await getTransactions();
  return transactions.find((t) => String(t.id) === String(id));
};

/**
 * POST - Cria uma nova transação
 */
export const createTransaction = async (
  transaction: Omit<Transaction, "id">
): Promise<Transaction> => {
  // Garante que tipo está correto
  const body = {
    ...transaction,
    tipo:
      transaction.tipo.charAt(0).toUpperCase() +
      transaction.tipo.slice(1).toLowerCase(),
  };
  const response = await fetch(`${API_BASE_URL}/transacoes/criar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  await handleApiError(response);
  return await response.json();
};

/**
 * PUT - Atualiza uma transação
 */
export const updateTransaction = async (
  id: string,
  data: Partial<Transaction>
): Promise<Transaction> => {
  // Garante que tipo está correto se for enviado
  const body = {
    ...data,
    ...(data.tipo
      ? {
          tipo:
            data.tipo.charAt(0).toUpperCase() +
            data.tipo.slice(1).toLowerCase(),
        }
      : {}),
  };
  const response = await fetch(`${API_BASE_URL}/transacoes/atualizar/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  await handleApiError(response);
  return await response.json();
};

/**
 * DELETE - Remove uma transação
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/transacoes/deletar/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
};
