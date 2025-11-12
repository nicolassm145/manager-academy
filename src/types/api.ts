// Tipos da API Backend

// Tipo de acesso do usuário
export type TipoAcesso = "Administrador" | "Líder" | "Membro";

// Usuário retornado pela API
export interface ApiUser {
  id: number;
  nomeCompleto: string;
  matricula: string;
  email: string;
  curso: string;
  tipoAcesso: TipoAcesso;
  cargoEquipe: string | null;
  equipeId: number | null;
  dataInicio: string; // Format: YYYY-MM-DD
  ativo: boolean;
}

// Request de login
export interface LoginRequest {
  email: string;
  password: string;
}

// Response de login
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

// Request para criar usuário
export interface UserCreateRequest {
  nomeCompleto: string;
  matricula: string;
  email: string;
  curso: string;
  tipoAcesso: TipoAcesso;
  password: string;
  dataInicio: string; // Format: YYYY-MM-DD
  cargoEquipe?: string;
  equipeId?: number;
  ativo?: boolean;
}

// Request para atualizar usuário
export interface UserUpdateRequest {
  nomeCompleto?: string;
  matricula?: string;
  email?: string;
  curso?: string;
  tipoAcesso?: TipoAcesso;
  cargoEquipe?: string;
  equipeId?: number;
  password?: string;
  ativo?: boolean;
}

// Resposta de delete
export interface DeleteResponse {
  detail: string;
}
