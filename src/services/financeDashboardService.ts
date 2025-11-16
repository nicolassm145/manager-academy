import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

// Resumo financeiro geral
export const getFinanceSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/transacoes/dashboard/resumo`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};

// Evolução mensal (entradas/saídas por mês)
export const getFinanceMonthly = async (ano: number) => {
  const response = await fetch(
    `${API_BASE_URL}/transacoes/dashboard/mensal?ano=${ano}`,
    {
      headers: getAuthHeaders(),
    }
  );
  await handleApiError(response);
  return response.json();
};

// Totais por categoria
export const getFinanceCategories = async () => {
  const response = await fetch(
    `${API_BASE_URL}/transacoes/dashboard/categorias`,
    {
      headers: getAuthHeaders(),
    }
  );
  await handleApiError(response);
  return response.json();
};

// Últimas 10 transações
export const getFinanceLastTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transacoes/dashboard/ultimas`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return response.json();
};
