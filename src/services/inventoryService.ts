import type { InventoryItem } from "../types/inventory";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

/**
 * GET - Lista todos os itens do inventário
 */
export interface InventoryFilters {
  nome?: string;
  categoria?: string;
  sku?: string;
}

export const getInventoryItems = async (
  filters: InventoryFilters = {}
): Promise<InventoryItem[]> => {
  const params = new URLSearchParams();
  if (filters.nome) params.append("nome", filters.nome);
  if (filters.categoria) params.append("categoria", filters.categoria);
  if (filters.sku) params.append("sku", filters.sku);
  const url = `${API_BASE_URL}/itens/listar${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return await response.json();
};

/**
 * GET - Busca um item por ID
 */
export const getInventoryItemById = async (
  id: string
): Promise<InventoryItem | undefined> => {
  // Não existe endpoint para buscar por ID, então busca todos e filtra
  const items = await getInventoryItems();
  return items.find((item) => String(item.id) === String(id));
};

/**
 * POST - Cria um novo item
 */
export const createInventoryItem = async (
  item: Omit<InventoryItem, "id"> & { equipeId: number }
): Promise<InventoryItem> => {
  // Remove id se vier por engano
  const { id, ...body } = item as any;
  const response = await fetch(`${API_BASE_URL}/itens/criar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  await handleApiError(response);
  return await response.json();
};

/**
 * PUT - Atualiza um item
 */
export const updateInventoryItem = async (
  id: string,
  data: Partial<InventoryItem>
): Promise<InventoryItem> => {
  // Nunca envie o campo sku no update
  const { sku, ...body } = data;
  const response = await fetch(`${API_BASE_URL}/itens/atualizar/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  await handleApiError(response);
  return await response.json();
};

/**
 * DELETE - Remove um item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/itens/deletar/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
};
