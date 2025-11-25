import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useMemo } from "react";
import {
  HomeIcon,
  UsersIcon,
  Cog8ToothIcon,
  Bars3Icon,
  XMarkIcon,
  QueueListIcon,
  ArrowRightStartOnRectangleIcon,
  BanknotesIcon,
  UserGroupIcon,
  FolderIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { usePermissions } from "../../hooks/usePermissions";

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const allMenuItems: MenuItem[] = [
  {
    name: "Membros",
    path: "/members",
    icon: UsersIcon,
    permission: "canViewMembers",
  },
  {
    name: "Equipes",
    path: "/admin/teams",
    icon: UserGroupIcon,
    permission: "canViewTeams",
  },
  {
    name: "Financeiro",
    path: "/finance",
    icon: BanknotesIcon,
    permission: "canViewFinance",
  },
  {
    name: "Inventário",
    path: "/inventory",
    icon: QueueListIcon,
    permission: "canViewInventory",
  },
  {
    name: "Arquivos",
    path: "/files",
    icon: FolderIcon,
    permission: "canViewFiles",
  },
  {
    name: "Calendário",
    path: "/calendar",
    icon: CalendarIcon,
    permission: "canViewCalendar",
  },
  { name: "Configurações", path: "/settings", icon: Cog8ToothIcon },
];

const getRoleLabel = (role?: string, cargo?: string) => {
  if (role === "admin") return "Administrador";
  if (role === "professor") return "Professor Orientador";
  if (role === "membro") return "Membro";
  if (role === "lider") {
    return cargo === "Professor Orientador"
      ? "Professor Orientador"
      : "Líder de Equipe";
  }
  return "";
};

function MenuItemComponent({
  item,
  isActive,
  onClick,
}: {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "hover:bg-base-200"
      }`}
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="font-medium">{item.name}</span>
    </Link>
  );
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { permissions } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = useMemo(() => {
    if (!permissions) return [];
    return allMenuItems.filter((item) => {
      if (item.path === "/dashboard") return true;
      if (item.permission) return (permissions as any)[item.permission];
      return true;
    });
  }, [permissions]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);
  const goToDashboard = () => navigate("/dashboard");

  const renderNavigation = (showHome: boolean = false) => (
    <nav className="flex-1 px-4 py-6 space-y-2 mt-16 lg:mt-0 overflow-y-auto">
      {showHome && (
        <div className="block lg:hidden mb-2">
          <MenuItemComponent
            item={{ name: "Home", path: "/dashboard", icon: HomeIcon }}
            isActive={location.pathname === "/dashboard"}
            onClick={closeSidebar}
          />
        </div>
      )}
      {menuItems.map((item) => (
        <MenuItemComponent
          key={item.path}
          item={item}
          isActive={location.pathname.startsWith(item.path)}
          onClick={closeSidebar}
        />
      ))}
    </nav>
  );

  const renderUserProfile = () => (
    <div className="p-4 border-t">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.nome}</p>
          <p className="text-xs opacity-60 truncate">{user?.email}</p>
          <p className="text-xs text-blue-600 font-medium mt-1">
            {getRoleLabel(user?.role, user?.cargo)}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm ml-3 flex-shrink-0"
          title="Sair"
        >
          <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 shadow-md z-50 flex items-center justify-between px-4 bg-base-100">
        <button
          className="btn btn-ghost text-xl btn-sm"
          onClick={goToDashboard}
          aria-label="Ir para o dashboard"
        >
          League Manager
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn-ghost btn-sm"
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-base-100 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="hidden lg:flex items-center justify-center h-16 border-b">
            <button
              className="btn btn-ghost btn-sm"
              onClick={goToDashboard}
              aria-label="Ir para o dashboard"
            >
              League Manager
            </button>
          </div>
          {renderNavigation(true)}
          {renderUserProfile()}
        </div>
      </aside>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-base-100 lg:shadow-lg lg:z-50 lg:flex lg:flex-col">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <button
              className="btn btn-ghost btn-6xl font-bold text-2xl"
              onClick={goToDashboard}
              aria-label="Ir para o dashboard"
            >
              League Manager
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-base-200"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {renderUserProfile()}
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
