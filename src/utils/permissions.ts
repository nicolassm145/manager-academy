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
  },

  // Líder pode gerenciar membros e ver equipes
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
  },

  // Diretor pode ver relatórios e membros
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
  },

  // Membro só vê dashboard
  membro: {
    canViewDashboard: true,
    canViewMembers: false,
    canCreateMember: false,
    canEditMember: false,
    canDeleteMember: false,
    canViewUsers: false,
    canCreateUser: false,
    canEditUser: false,
    canDeleteUser: false,
    canViewTeams: false,
    canCreateTeam: false,
    canEditTeam: false,
    canDeleteTeam: false,
  },
} as const;

export type Permission = keyof typeof PERMISSIONS.admin;


export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[role][permission];
}

export function getPermissions(role: UserRole) {
  return PERMISSIONS[role];
}
