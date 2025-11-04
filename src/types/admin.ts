export interface SystemUser {
  id: string;
  nome: string;
  email: string;
  password: string;
  role: "admin" | "lider" | "professor" | "diretor" | "membro";
  equipe?: string;
  membroVinculadoId?: string; 
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
