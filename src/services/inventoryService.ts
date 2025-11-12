import type { InventoryItem } from "../types/inventory";
import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

// TODO: Quando a API estiver pronta, atualizar os endpoints
// Por enquanto, vou usar localStorage como fizemos com Teams

const STORAGE_KEY = "manager_inventory";

// Simula dados iniciais
const initialData: InventoryItem[] = [
  {
    id: "1",
    nome: "Notebook Dell",
    sku: "NB-DELL-001",
    categoria: "Eletrônicos",
    quantidade: 5,
    localizacao: "Sala 101",
    equipeId: "1",
    equipe: "Equipe Alpha",
  },
  {
    id: "2",
    nome: "Arduino Uno",
    sku: "ARD-UNO-002",
    categoria: "Componentes",
    quantidade: 20,
    localizacao: "Armário A3",
    equipeId: "2",
    equipe: "Equipe Beta",
  },
];

// Inicializa localStorage se vazio
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};

/**
 * GET - Lista todos os itens do inventário
 */
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/items/listar`, {
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
 * GET - Busca um item por ID
 */
export const getInventoryItemById = async (
  id: string
): Promise<InventoryItem | undefined> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/items/listar/${id}`, {
  //   headers: getAuthHeaders(),
  // });
  // await handleApiError(response);
  // return await response.json();

  // Temporário: usa localStorage
  const items = await getInventoryItems();
  return items.find((item) => item.id === id);
};

/**
 * POST - Cria um novo item
 */
export const createInventoryItem = async (
  item: Omit<InventoryItem, "id">
): Promise<InventoryItem> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/items/criar`, {
  //   method: "POST",
  //   headers: getAuthHeaders(),
  //   body: JSON.stringify(item),
  // });
  // await handleApiError(response);
  // return await response.json();

  // Temporário: usa localStorage
  const items = await getInventoryItems();
  const newItem = {
    ...item,
    id: Date.now().toString(),
  };
  items.push(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return newItem;
};

/**
 * PUT - Atualiza um item
 */
export const updateInventoryItem = async (
  id: string,
  data: Partial<InventoryItem>
): Promise<InventoryItem> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/items/atualizar/${id}`, {
  //   method: "PUT",
  //   headers: getAuthHeaders(),
  //   body: JSON.stringify(data),
  // });
  // await handleApiError(response);
  // return await response.json();

  // Temporário: usa localStorage
  const items = await getInventoryItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Item não encontrado");

  items[index] = { ...items[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items[index];
};

/**
 * DELETE - Remove um item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  // TODO: Descomentar quando a API estiver pronta
  // const response = await fetch(`${API_BASE_URL}/items/deletar/${id}`, {
  //   method: "DELETE",
  //   headers: getAuthHeaders(),
  // });
  // await handleApiError(response);

  // Temporário: usa localStorage
  const items = await getInventoryItems();
  const filtered = items.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
