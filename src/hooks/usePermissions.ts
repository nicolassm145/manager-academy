import { useAuth } from "../context/AuthContext";
import { hasPermission, getPermissions, type Permission } from "../utils/permissions";

export function usePermissions() {
  const { user } = useAuth();

  if (!user) {
    return {
      can: () => false,
      permissions: null,
    };
  }

  return {
    can: (permission: Permission) => hasPermission(user.role, permission),
    permissions: getPermissions(user.role),
  };
}
