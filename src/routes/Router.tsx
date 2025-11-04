import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRouteComponent";
import LoginPage from "../pages/Auth";
import DashboardPage from "../pages/Dashboard";

// Members (CRUD COMPLETO - Release 01)
import MembersPage from "../pages/Members";
import NewMemberPage from "../pages/Members/New";
import MemberDetailPage from "../pages/Members/Detail";
import EditMemberPage from "../pages/Members/Edit";

// Admin (CRUD COMPLETO - Release 01)
import AdminUsersPage from "../pages/Admin/Users/index";
import NewUserPage from "../pages/Admin/Users/New";
import UserDetailPage from "../pages/Admin/Users/Detail";
import EditUserPage from "../pages/Admin/Users/Edit";
import AdminTeamsPage from "../pages/Admin/Teams/index";
import NewTeamPage from "../pages/Admin/Teams/New";
import TeamDetailPage from "../pages/Admin/Teams/Detail";
import EditTeamPage from "../pages/Admin/Teams/Edit";
import NotFoundPage from "../pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/members",
    element: (
      <ProtectedRoute requiredPermission="canViewMembers">
        <MembersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/members/new",
    element: (
      <ProtectedRoute requiredPermission="canCreateMember">
        <NewMemberPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/members/:id",
    element: (
      <ProtectedRoute requiredPermission="canViewMembers">
        <MemberDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/members/:id/edit",
    element: (
      <ProtectedRoute requiredPermission="canEditMember">
        <EditMemberPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requiredPermission="canViewUsers">
        <AdminUsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/new",
    element: (
      <ProtectedRoute requiredPermission="canCreateUser">
        <NewUserPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/:id",
    element: (
      <ProtectedRoute requiredPermission="canViewUsers">
        <UserDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users/:id/edit",
    element: (
      <ProtectedRoute requiredPermission="canEditUser">
        <EditUserPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/admin/teams",
    element: (
      <ProtectedRoute requiredPermission="canViewTeams">
        <AdminTeamsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/teams/new",
    element: (
      <ProtectedRoute requiredPermission="canCreateTeam">
        <NewTeamPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/teams/:id",
    element: (
      <ProtectedRoute requiredPermission="canViewTeams">
        <TeamDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/teams/:id/edit",
    element: (
      <ProtectedRoute requiredPermission="canEditTeam">
        <EditTeamPage />
      </ProtectedRoute>
    ),
  },

  // 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
