// Tipos para Financeiro

export interface Transaction {
  id: string;
  descricao: string;
  valor: number;
  data: string; // YYYY-MM-DD
  tipo: "entrada" | "saida";
  categoria: string;
  equipeId: string;
  criadoPor: string; // ID do usuário que criou
  equipe?: string; // Nome da equipe (para exibição)
  criador?: string; // Nome do criador (para exibição)
}

export type TransactionType = "entrada" | "saida";
