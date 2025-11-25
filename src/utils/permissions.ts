import type { UserRole } from "../context/AuthContext";

// Define as permissões para cada cargo
type PermissionMap = {
  canViewDashboard: boolean;
  canViewMembers: boolean;
  canCreateMember: boolean;
  canEditMember: boolean;
  canDeleteMember: boolean;
  canViewUsers: boolean;
  canCreateUser: boolean;
  canEditUser: boolean;
  canDeleteUser: boolean;
  canViewTeams: boolean;
  canCreateTeam: boolean;
  canEditTeam: boolean;
  canDeleteTeam: boolean;
  canViewFinance: boolean;
  canCreateFinance: boolean;
  canEditFinance: boolean;
  canDeleteFinance: boolean;
  canViewInventory: boolean;
  canCreateInventory: boolean;
  canEditInventory: boolean;
  canDeleteInventory: boolean;
  canUploadFiles: boolean;
  canDeleteFiles: boolean;
  canViewFiles: boolean;
  canViewCalendar: boolean;
  canCreateCalendar: boolean;
  canEditCalendar: boolean;
  canDeleteCalendar: boolean;
  canCreateCalendarEvent: boolean;
  canEditCalendarEvent: boolean;
};

export const PERMISSIONS: Record<UserRole, PermissionMap> = {
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
    canUploadFiles: true,
    canDeleteFiles: true,
    canViewFiles: false,
    canCreateCalendar: true,
    canViewCalendar: false,
    canEditCalendar: true,
    canDeleteCalendar: true,
    canCreateCalendarEvent: true,
    canEditCalendarEvent: true,
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
    canUploadFiles: true,
    canDeleteFiles: true,
    canViewFiles: true,
    canCreateCalendar: true,
    canViewCalendar: true,
    canEditCalendar: true,
    canDeleteCalendar: true,
    canCreateCalendarEvent: true,
    canEditCalendarEvent: true,
  },

  // Professor tem as mesmas permissões que Líder
  professor: {
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
    canUploadFiles: true,
    canDeleteFiles: true,
    canViewFiles: true,
    canCreateCalendar: true,
    canViewCalendar: true,
    canEditCalendar: true,
    canDeleteCalendar: true,
    canCreateCalendarEvent: true,
    canEditCalendarEvent: true,
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
    canUploadFiles: true,
    canDeleteFiles: true,
    canViewFiles: true,
    canCreateCalendar: true,
    canViewCalendar: true,
    canEditCalendar: true,
    canDeleteCalendar: true,
    canCreateCalendarEvent: true,
    canEditCalendarEvent: true,
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
    canUploadFiles: true,
    canDeleteFiles: true,
    canViewFiles: true,
    canCreateCalendar: true,
    canViewCalendar: true,
    canEditCalendar: true,
    canDeleteCalendar: true,
    canCreateCalendarEvent: true,
    canEditCalendarEvent: true,
  },
} as const;

export type Permission = keyof typeof PERMISSIONS.admin;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[role][permission];
}

export function getPermissions(role: UserRole) {
  return PERMISSIONS[role];
}
