export interface SystemUser {
  id: string;
  nome: string;
  email: string;
  password: string;
  role: "admin" | "lider" | "professor" | "diretor" | "membro";
  equipe?: string;
  membroVinculadoId?: string; // ID do membro vinculado (se for role=lider ou role=membro)
  status: "ativo" | "inativo";
  dataCriacao: string;
}

export interface Team {
  id: string;
  nome: string;
  descricao: string;
  status: "ativa" | "inativa";
  dataCriacao: string;
}

// Dados movidos para src/data/*.json
// Use os services em src/services/*.ts para acessar/manipular
