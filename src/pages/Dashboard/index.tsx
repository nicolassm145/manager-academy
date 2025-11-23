import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../components/layout/LayoutComponent";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { getMembers } from "../../services/memberService";
import { getTeams } from "../../services/teamService";
import { getTransactions } from "../../services/financeService";
import type { Transaction } from "../../types/finance";
import { getFinanceSummary } from "../../services/financeDashboardService";
import { getInventoryItems } from "../../services/inventoryService";
import { UsersIcon, UserGroupIcon, PlusIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { StatCard } from "../../components/ui/StatCard";
import { Greeting } from "../../components/ui/Greeting";
import { QuickActionCard } from "../../components/ui/QuickActionCard";
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
  const [financeSummary, setFinanceSummary] = useState<{
    entradas: number;
    saidas: number;
    saldo: number;
  } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadFinanceSummary();
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(
        data.map((t) => ({
          ...t,
          tipo: (typeof t.tipo === "string" ? t.tipo.toLowerCase() : t.tipo) as "entrada" | "saida",
        }))
      );
    } catch (e) {
      setTransactions([]);
    }
  };

  const loadFinanceSummary = async () => {
    try {
      const data = await getFinanceSummary();
      setFinanceSummary(data);
    } catch (e) {
      setFinanceSummary(null);
    }
  };

  const loadStats = async () => {
    try {
      const userEquipeId = user?.equipe ? parseInt(user.equipe) : undefined;
      const membersData = can("canViewMembers") ? await getMembers(userEquipeId) : [];
      const teamsData = can("canViewTeams") ? await getTeams(user?.role, user?.equipe) : [];

      const transactionsData = can("canViewFinance") ? await getTransactions() : [];
      const inventoryData = can("canViewInventory") ? await getInventoryItems() : [];

      let filteredMembers = membersData;
      let filteredTransactions = transactionsData;
      let filteredInventory = inventoryData;

      if (user?.role !== "admin" && user?.equipe) {
        filteredTransactions = transactionsData.filter((t) => t.equipeId === user.equipe);
        filteredInventory = inventoryData.filter((i) => i.equipeId === user.equipe);
      }

      const entradas = filteredTransactions.filter((t) => t.tipo === "entrada").reduce((sum, t) => sum + t.valor, 0);
      const saidas = filteredTransactions.filter((t) => t.tipo === "saida").reduce((sum, t) => sum + t.valor, 0);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      lider: user?.cargo === "Professor Orientador" || user?.cargo === "Professor" ? "Professor Orientador" : "Líder de Equipe",
      membro: "Membro",
      professor: "Professor Orientador",
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
        <Greeting user={user} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {can("canViewMembers") && (
            <StatCard label="Membros" value={stats.membros} icon={<UsersIcon className="w-6 h-6 text-blue-600" />} color="bg-blue-100">
              <p className="text-xs opacity-50 mt-1">{user?.role === "admin" ? "Total geral" : "Da sua equipe"}</p>
            </StatCard>
          )}
          {can("canViewTeams") && (
            <StatCard label="Equipes" value={stats.equipes} icon={<UserGroupIcon className="w-6 h-6 text-purple-600" />} color="bg-purple-100">
              <p className="text-xs opacity-50 mt-1">Ativas</p>
            </StatCard>
          )}
          {can("canViewFinance") && user?.role !== "admin" && (
            <StatCard
              label="Saldo"
              value={
                <span>
                  R$
                  {financeSummary
                    ? " " +
                      financeSummary.saldo.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : " -"}
                </span>
              }
              icon={<BanknotesIcon className={`w-6 h-6 ${financeSummary && financeSummary.saldo >= 0 ? "text-green-600" : "text-red-600"}`} />}
              color={financeSummary && financeSummary.saldo >= 0 ? "bg-green-100" : "bg-red-100"}
              className="lg:col-span-2"
            >
              <p className="text-xs opacity-50 mt-1">{financeSummary && financeSummary.saldo >= 0 ? "Saldo positivo" : "Saldo negativo"}</p>
            </StatCard>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {can("canCreateMember") && (
              <QuickActionCard
                to="/members/new"
                icon={<PlusIcon className="w-6 h-6 text-blue-600" />}
                bgColor="bg-blue-100"
                title="Novo Membro"
                description="Cadastrar um novo membro"
              />
            )}

            <QuickActionCard
              to="/files"
              icon={<PlusIcon className="w-6 h-6 text-gray-600" />}
              bgColor="bg-gray-100"
              title="Adicionar Arquivo"
              description="Upload de novo arquivo"
            />

            {can("canCreateCalendarEvent") && (
              <QuickActionCard
                to="/calendar/edit"
                icon={<PlusIcon className="w-6 h-6 text-blue-600" />}
                bgColor="bg-blue-100"
                title="Criar Evento"
                description="Novo evento no calendário"
              />
            )}
            {can("canCreateFinance") && (
              <QuickActionCard
                to="/finance/new"
                icon={<PlusIcon className="w-6 h-6 text-green-600" />}
                bgColor="bg-green-100"
                title="Registrar Transação"
                description="Entrada ou saída"
              />
            )}

            {can("canCreateInventory") && (
              <QuickActionCard
                to="/inventory/new"
                icon={<PlusIcon className="w-6 h-6 text-orange-600" />}
                bgColor="bg-orange-100"
                title="Adicionar Item"
                description="Novo item ao estoque"
              />
            )}

            {can("canCreateTeam") && (
              <QuickActionCard
                to="/admin/teams/new"
                icon={<PlusIcon className="w-6 h-6 text-purple-600" />}
                bgColor="bg-purple-100"
                title="Nova Equipe"
                description="Criar uma equipe"
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
