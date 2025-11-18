// Funções de mapeamento entre tipos do frontend e da API

import type { Member } from "./member";
import type {
  ApiUser,
  TipoAcesso,
  UserCreateRequest,
  UserUpdateRequest,
} from "./api";
import type { UserRole } from "../context/AuthContext";

// Mapeia TipoAcesso da API para UserRole do frontend
export const mapTipoAcessoToRole = (tipoAcesso: TipoAcesso): UserRole => {
  const mapping: Record<TipoAcesso, UserRole> = {
    Administrador: "admin",
    Líder: "lider",
    Membro: "membro",
  };
  return mapping[tipoAcesso] || "membro";
};

// Mapeia UserRole do frontend para TipoAcesso da API
export const mapRoleToTipoAcesso = (role: UserRole): TipoAcesso => {
  // Gambiarra: professor salva como Líder
  if (role === "professor") return "Líder";
  const mapping: Record<UserRole, TipoAcesso> = {
    admin: "Administrador",
    lider: "Líder",
    membro: "Membro",
  };
  return mapping[role] || "Membro";
};

// Converte ApiUser (da API) para Member (frontend)
export const apiUserToMember = (apiUser: ApiUser): Member => {
  return {
    id: apiUser.id.toString(),
    nome: apiUser.nomeCompleto,
    matricula: apiUser.matricula,
    email: apiUser.email,
    curso: apiUser.curso,
    equipe: apiUser.equipeId?.toString() || "", // TODO: buscar nome da equipe
    cargo: apiUser.cargoEquipe || "",
    dataInicio: apiUser.dataInicio,
    dataCriacao: apiUser.dataInicio, // Usando dataInicio como dataCriacao
    status: apiUser.ativo ? "ativo" : "inativo",
    role: mapTipoAcessoToRole(apiUser.tipoAcesso),
    password: "", // Não retornado pela API
  };
};

// Converte dados do frontend para UserCreateRequest (API)
export const memberToUserCreateRequest = (
  member: Omit<Member, "id">
): UserCreateRequest => {
  // Converte equipe: string vazia = undefined, valor numérico = parseInt
  const equipeId =
    member.equipe && member.equipe.trim() !== ""
      ? parseInt(member.equipe)
      : undefined;

  return {
    nomeCompleto: member.nome,
    matricula: member.matricula,
    email: member.email,
    curso: member.curso,
    tipoAcesso: mapRoleToTipoAcesso(member.role),
    password: member.password,
    dataInicio: member.dataInicio,
    cargoEquipe: member.cargo || undefined,
    equipeId: equipeId,
    ativo: member.status === "ativo",
  };
};

// Converte dados do frontend para UserUpdateRequest (API)
export const memberToUserUpdateRequest = (
  member: Partial<Member>
): UserUpdateRequest => {
  const updateData: UserUpdateRequest = {};

  if (member.nome) updateData.nomeCompleto = member.nome;
  if (member.matricula) updateData.matricula = member.matricula;
  if (member.email) updateData.email = member.email;
  if (member.curso) updateData.curso = member.curso;
  if (member.role) updateData.tipoAcesso = mapRoleToTipoAcesso(member.role);
  if (member.cargo !== undefined)
    updateData.cargoEquipe = member.cargo || undefined;

  // Trata equipe: undefined = não envia, string vazia = null, valor = parseInt
  if (member.equipe !== undefined) {
    updateData.equipeId =
      member.equipe && member.equipe.trim() !== ""
        ? parseInt(member.equipe)
        : undefined;
  }

  if (member.password) updateData.password = member.password;
  if (member.status) updateData.ativo = member.status === "ativo";

  return updateData;
};
