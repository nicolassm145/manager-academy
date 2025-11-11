import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../components/LayoutComponent";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { getMembers } from "../../services/memberService";
import { getTeams } from "../../services/teamService";
import { getTransactions } from "../../services/financeService";
import { getInventoryItems } from "../../services/inventoryService";
import {
  UsersIcon,
  QueueListIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Card } from "../../components/ui";

const DashboardPage = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [stats, setStats] = useState({
    membros: 0,
    equipes: 0,
    saldo: 0,
    itens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      // Carregar dados baseado no perfil
      const membersData = can("canViewMembers") ? await getMembers() : [];
      const teamsData = can("canViewTeams") ? await getTeams() : [];
      const transactionsData = can("canViewFinance")
        ? await getTransactions()
        : [];
      const inventoryData = can("canViewInventory")
        ? await getInventoryItems()
        : [];

      // Filtrar por equipe se não for admin
      let filteredMembers = membersData;
      let filteredTransactions = transactionsData;
      let filteredInventory = inventoryData;

      if (user?.role !== "admin" && user?.equipe) {
        filteredMembers = membersData.filter(
          (m) => m.equipe === user.equipe?.toString()
        );
        filteredTransactions = transactionsData.filter(
          (t) => t.equipeId === user.equipe
        );
        filteredInventory = inventoryData.filter(
          (i) => i.equipeId === user.equipe
        );
      }

      // Calcular saldo
      const entradas = filteredTransactions
        .filter((t) => t.tipo === "entrada")
        .reduce((sum, t) => sum + t.valor, 0);
      const saidas = filteredTransactions
        .filter((t) => t.tipo === "saida")
        .reduce((sum, t) => sum + t.valor, 0);

      setStats({
        membros: filteredMembers.length,
        equipes: teamsData.length,
        saldo: entradas - saidas,
        itens: filteredInventory.length,
      });

      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      lider: "Líder",
      membro: "Membro",
      professor: "Professor",
      diretor: "Diretor",
    };
    return roles[role] || role;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 opacity-60">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Saudação */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {getGreeting()}, {user?.nome?.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base opacity-90 mt-2">
            {getRoleLabel(user?.role || "")} •{" "}
            {user?.role === "admin"
              ? "Acesso Total"
              : user?.role === "lider"
              ? `Equipe ${user?.equipe || "N/A"}`
              : `Equipe ${user?.equipe || "N/A"}`}
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Membros */}
          {can("canViewMembers") && (
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60 mb-1">Membros</p>
                    <p className="text-3xl font-bold">{stats.membros}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {user?.role === "admin" ? "Total geral" : "Da sua equipe"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Equipes */}
          {can("canViewTeams") && (
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60 mb-1">Equipes</p>
                    <p className="text-3xl font-bold">{stats.equipes}</p>
                    <p className="text-xs opacity-50 mt-1">Ativas</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <QueueListIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Saldo */}
          {/* {can("canViewFinance") && (
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60 mb-1">Saldo</p>
                    <p
                      className={`text-2xl sm:text-3xl font-bold ${
                        stats.saldo >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(stats.saldo)}
                    </p>
                    <p className="text-xs opacity-50 mt-1">
                      {user?.role === "admin" ? "Total geral" : "Da sua equipe"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <BanknotesIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </Card>
          )} */}

          {/* Inventário */}
          {/* {can("canViewInventory") && (
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60 mb-1">Itens</p>
                    <p className="text-3xl font-bold">{stats.itens}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {user?.role === "admin" ? "Total geral" : "Da sua equipe"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <ArchiveBoxIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </Card>
          )} */}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {can("canCreateMember") && (
              <Link
                to="/members/new"
                className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Novo Membro</p>
                    <p className="text-sm opacity-60">
                      Cadastrar um novo membro
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* {can("canCreateFinance") && (
              <Link
                to="/finance/new"
                className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Registrar Transação</p>
                    <p className="text-sm opacity-60">Entrada ou saída</p>
                  </div>
                </div>
              </Link>
            )} */}

            {/* {can("canCreateInventory") && (
              <Link
                to="/inventory/new"
                className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Adicionar Item</p>
                    <p className="text-sm opacity-60">Novo item ao estoque</p>
                  </div>
                </div>
              </Link>
            )} */}

            {can("canCreateTeam") && (
              <Link
                to="/admin/teams/new"
                className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Nova Equipe</p>
                    <p className="text-sm opacity-60">Criar uma equipe</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Links Rápidos */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {can("canViewMembers") && (
                <Link
                  to="/members"
                  className="text-center p-4 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <UsersIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Membros</p>
                </Link>
              )}
              {can("canViewTeams") && (
                <Link
                  to="/admin/teams"
                  className="text-center p-4 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <QueueListIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Equipes</p>
                </Link>
              )}
              {/* {can("canViewFinance") && (
                <Link
                  to="/finance"
                  className="text-center p-4 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <BanknotesIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Financeiro</p>
                </Link>
              )} */}
              {/* {can("canViewInventory") && (
                <Link
                  to="/inventory"
                  className="text-center p-4 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <ArchiveBoxIcon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium">Inventário</p>
                </Link>
              )} */}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;
