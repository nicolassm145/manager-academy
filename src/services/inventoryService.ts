import type { InventoryItem } from "../types/inventory";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

/**
 * GET - Lista todos os itens do inventário
 */
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/itens/listar`, {
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
): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/itens/listar/${id}`, {
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
  return await response.json();
};

/**
 * POST - Cria um novo item
 */
export const createInventoryItem = async (
  item: Omit<InventoryItem, "id">
): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/itens/criar`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
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
  const response = await fetch(`${API_BASE_URL}/api/v1/itens/atualizar/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  await handleApiError(response);
  return await response.json();
};

/**
 * DELETE - Remove um item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/itens/deletar/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
};
