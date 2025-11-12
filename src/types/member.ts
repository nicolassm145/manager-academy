export interface Member {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  curso: string;
  equipe: string;
  cargo: string;
  dataInicio: string;
  status: "ativo" | "inativo";
  // Dados de acesso ao sistema
  password: string;
  role: "admin" | "lider" | "professor" | "diretor" | "membro";
  dataCriacao: string;
}
