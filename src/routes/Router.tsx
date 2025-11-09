import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRouteComponent";
import LoginPage from "../pages/Auth";
import DashboardPage from "../pages/Dashboard";
import SettingsPage from "../pages/Settings";
import NotFoundPage from "../pages/NotFound";

// Crud dos Membros (agora inclui gestão de usuários)
import MembersPage from "../pages/Members";
import NewMemberPage from "../pages/Members/New";
import MemberDetailPage from "../pages/Members/Detail";
import EditMemberPage from "../pages/Members/Edit";

// Crud das Equipes
import AdminTeamsPage from "../pages/Admin/Teams/index";
import NewTeamPage from "../pages/Admin/Teams/New";
import TeamDetailPage from "../pages/Admin/Teams/Detail";
import EditTeamPage from "../pages/Admin/Teams/Edit";

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
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsPage />
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

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
