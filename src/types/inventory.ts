// Tipos para Inventário

export interface InventoryItem {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  quantidade: number;
  localizacao: string;
  equipeId: string;
  equipe?: string; // Nome da equipe (para exibição)
}

export type InventoryItemStatus = "disponivel" | "em_uso" | "manutencao";
