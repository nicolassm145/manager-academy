// Tipo que corresponde à estrutura da API do backend
export interface SystemUser {
  id: number;
  nomeCompleto: string;
  email: string;
  password?: string; // Opcional, usado apenas na criação
  tipoAcesso:
    | "Administrador"
    | "Líder"
    | "Professor"
    | "Diretor Financeiro"
    | "Membro";
  equipeId?: number | null;
  ativo: boolean;
}

export interface Team {
  id: number;
  nome: string;
  descricao: string;
  criadoEm?: string; // Data de criação (opcional, gerada pelo backend se não enviada)
  membros?: SystemUser[]; // Lista de membros da equipe
}
