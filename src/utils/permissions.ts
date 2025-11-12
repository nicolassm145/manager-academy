import type { UserRole } from "../context/AuthContext";

// Define as permissões para cada cargo
export const PERMISSIONS = {
  // Admin tem acesso total
  admin: {
    canViewDashboard: true,
    canViewMembers: true,
    canCreateMember: true,
    canEditMember: true,
    canDeleteMember: true,
    canViewUsers: true,
    canCreateUser: true,
    canEditUser: true,
    canDeleteUser: true,
    canViewTeams: true,
    canCreateTeam: true,
    canEditTeam: true,
    canDeleteTeam: true,
    canViewFinance: true,
    canCreateFinance: true,
    canEditFinance: true,
    canDeleteFinance: true,
    canViewInventory: true,
    canCreateInventory: true,
    canEditInventory: true,
    canDeleteInventory: true,
  },

  // Líder pode gerenciar membros, finanças e inventário da sua equipe
  lider: {
    canViewDashboard: true,
    canViewMembers: true,
    canCreateMember: true,
    canEditMember: true,
    canDeleteMember: true,
    canViewUsers: false,
    canCreateUser: false,
    canEditUser: false,
    canDeleteUser: false,
    canViewTeams: true,
    canCreateTeam: false,
    canEditTeam: false,
    canDeleteTeam: false,
    canViewFinance: true,
    canCreateFinance: true,
    canEditFinance: true,
    canDeleteFinance: true,
    canViewInventory: true,
    canCreateInventory: true,
    canEditInventory: true,
    canDeleteInventory: true,
  },

  // Professor pode ver e editar membros
  professor: {
    canViewDashboard: true,
    canViewMembers: true,
    canCreateMember: false,
    canEditMember: true,
    canDeleteMember: false,
    canViewUsers: false,
    canCreateUser: false,
    canEditUser: false,
    canDeleteUser: false,
    canViewTeams: true,
    canCreateTeam: false,
    canEditTeam: false,
    canDeleteTeam: false,
    canViewFinance: false,
    canCreateFinance: false,
    canEditFinance: false,
    canDeleteFinance: false,
    canViewInventory: false,
    canCreateInventory: false,
    canEditInventory: false,
    canDeleteInventory: false,
  },

  // Diretor pode ver finanças
  diretor: {
    canViewDashboard: true,
    canViewMembers: true,
    canCreateMember: false,
    canEditMember: false,
    canDeleteMember: false,
    canViewUsers: false,
    canCreateUser: false,
    canEditUser: false,
    canDeleteUser: false,
    canViewTeams: true,
    canCreateTeam: false,
    canEditTeam: false,
    canDeleteTeam: false,
    canViewFinance: true,
    canCreateFinance: false,
    canEditFinance: false,
    canDeleteFinance: false,
    canViewInventory: false,
    canCreateInventory: false,
    canEditInventory: false,
    canDeleteInventory: false,
  },

  // Membro pode ver membros e equipes (mas sem editar/criar/deletar)
  membro: {
    canViewDashboard: true,
    canViewMembers: true,
    canCreateMember: false,
    canEditMember: false,
    canDeleteMember: false,
    canViewUsers: false,
    canCreateUser: false,
    canEditUser: false,
    canDeleteUser: false,
    canViewTeams: true,
    canCreateTeam: false,
    canEditTeam: false,
    canDeleteTeam: false,
    canViewFinance: false,
    canCreateFinance: false,
    canEditFinance: false,
    canDeleteFinance: false,
    canViewInventory: true,
    canCreateInventory: false,
    canEditInventory: false,
    canDeleteInventory: false,
  },
} as const;

export type Permission = keyof typeof PERMISSIONS.admin;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[role][permission];
}

export function getPermissions(role: UserRole) {
  return PERMISSIONS[role];
}
