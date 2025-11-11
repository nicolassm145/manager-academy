import type { Transaction } from "../types/finance";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

// TODO: Quando a API estiver pronta, atualizar os endpoints
// Por enquanto, vou usar localStorage

const STORAGE_KEY = "manager_transactions";

// Simula dados iniciais
const initialData: Transaction[] = [
  {
    id: "1",
    descricao: "Compra de componentes Arduino",
    valor: 350.0,
    data: "2025-11-01",
    tipo: "saida",
    categoria: "Material",
    equipeId: "2",
    criadoPor: "1",
    equipe: "Equipe Beta",
    criador: "Admin",
  },
  {
    id: "2",
    descricao: "Patrocínio XYZ Corp",
    valor: 5000.0,
    data: "2025-11-05",
    tipo: "entrada",
    categoria: "Patrocínio",
    equipeId: "1",
    criadoPor: "1",
    equipe: "Equipe Alpha",
    criador: "Admin",
  },
];

// Inicializa localStorage se vazio
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};

/**
 * GET - Lista todas as transações
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/transacoes/listar`, {
  //   headers: getAuthHeaders(),
  // });
  // await handleApiError(response);
  // return await response.json();

  // Temporário: usa localStorage
  initStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * GET - Busca uma transação por ID
 */
export const getTransactionById = async (
  id: string
): Promise<Transaction | undefined> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/transacoes/listar/${id}`, {
  //   headers: getAuthHeaders(),
  // });
  // await handleApiError(response);
  // return await response.json();

  // Temporário: usa localStorage
  const transactions = await getTransactions();
  return transactions.find((t) => t.id === id);
};

/**
 * POST - Cria uma nova transação
 */
export const createTransaction = async (
  transaction: Omit<Transaction, "id">
): Promise<Transaction> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/transacoes/criar`, {
  //   method: "POST",
  //   headers: getAuthHeaders(),
  //   body: JSON.stringify(transaction),
  // });
  // await handleApiError(response);
  // return await response.json();

  // Temporário: usa localStorage
  const transactions = await getTransactions();
  const newTransaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  transactions.push(newTransaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  return newTransaction;
};

/**
 * PUT - Atualiza uma transação
 */
export const updateTransaction = async (
  id: string,
  data: Partial<Transaction>
): Promise<Transaction> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/transacoes/atualizar/${id}`, {
  //   method: "PUT",
  //   headers: getAuthHeaders(),
  //   body: JSON.stringify(data),
  // });
  // await handleApiError(response);
  // return await response.json();

  // Temporário: usa localStorage
  const transactions = await getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Transação não encontrada");

  transactions[index] = { ...transactions[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  return transactions[index];
};

/**
 * DELETE - Remove uma transação
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/transacoes/deletar/${id}`, {
  //   method: "DELETE",
  //   headers: getAuthHeaders(),
  // });
  // await handleApiError(response);

  // Temporário: usa localStorage
  const transactions = await getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
