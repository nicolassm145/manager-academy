import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRouteComponent";
import LoginPage from "../pages/Auth";
import DashboardPage from "../pages/Dashboard";
import SettingsPage from "../pages/Settings";
import NotFoundPage from "../pages/NotFound";

// Crud dos Membros (agora inclui gestão de usuários)
import MembersPage from "../pages/Members/List";
import NewMemberPage from "../pages/Members/New";
import MemberDetailPage from "../pages/Members/Detail";
import EditMemberPage from "../pages/Members/Edit";

// Crud das Equipes
import AdminTeamsPage from "../pages/Teams/List";
import NewTeamPage from "../pages/Teams/New";
import TeamDetailPage from "../pages/Teams/Detail";
import EditTeamPage from "../pages/Teams/Edit";

// Crud do Financeiro
import FinanceListPage from "../pages/Finance/List";
import FinanceNewPage from "../pages/Finance/New";
import FinanceDetailPage from "../pages/Finance/Detail";
import FinanceEditPage from "../pages/Finance/Edit";

// Crud do Inventário
import InventoryListPage from "../pages/Inventory/List";
import InventoryNewPage from "../pages/Inventory/New";
import InventoryDetailPage from "../pages/Inventory/Detail";
import InventoryEditPage from "../pages/Inventory/Edit";

// Crud de Arquivos
import FileListPage from "../pages/Files";
// (futuro: importar New/Edit/Detail se necessário)
import FinanceResumePage from "../pages/Finance/Resume";
import CalendarListPage from "../pages/Calendar/List";
import CalendarEditPage from "../pages/Calendar/Edit";
import CalendarDetailsPage from "../pages/Calendar/Details";

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

  // Financeiro Routes
  {
    path: "/finance",
    element: (
      <ProtectedRoute requiredPermission="canViewFinance">
        <FinanceListPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/finance/new",
    element: (
      <ProtectedRoute requiredPermission="canCreateFinance">
        <FinanceNewPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/finance/:id",
    element: (
      <ProtectedRoute requiredPermission="canViewFinance">
        <FinanceDetailPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/finance/:id/edit",
    element: (
      <ProtectedRoute requiredPermission="canEditFinance">
        <FinanceEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/finance/resume",
    element: (
      <ProtectedRoute requiredPermission="canViewFinance">
        <FinanceResumePage />
      </ProtectedRoute>
    ),
  },
  // Inventário Routes
  {
    path: "/inventory",
    element: (
      <ProtectedRoute requiredPermission="canViewInventory">
        <InventoryListPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/inventory/new",
    element: (
      <ProtectedRoute requiredPermission="canCreateInventory">
        <InventoryNewPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/inventory/:id",
    element: (
      <ProtectedRoute requiredPermission="canViewInventory">
        <InventoryDetailPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/inventory/:id/edit",
    element: (
      <ProtectedRoute requiredPermission="canEditInventory">
        <InventoryEditPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/files",
    element: (
      <ProtectedRoute>
        <FileListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/calendar",
    element: (
      <ProtectedRoute>
        <CalendarListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/calendar/edit",
    element: (
      <ProtectedRoute requiredPermission="canCreateCalendar">
        <CalendarEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/calendar/edit/:id",
    element: (
      <ProtectedRoute requiredPermission="canEditCalendarEvent">
        <CalendarEditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/calendar/details/:id",
    element: (
      <ProtectedRoute>
        <CalendarDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
