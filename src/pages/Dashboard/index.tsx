import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";
import { Layout } from "../../components/LayoutComponent";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { getMembers } from "../../services/memberService";
import { getTeams } from "../../services/teamService";
import { getTransactions } from "../../services/financeService";
import type { Transaction } from "../../types/finance";
import { getFinanceSummary } from "../../services/financeDashboardService";
import { StatCard } from "../../components/ui";
import { getInventoryItems } from "../../services/inventoryService";
import {
  UsersIcon,
  UserGroupIcon,
  PlusIcon,
  BanknotesIcon,
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
      // Normaliza o campo 'tipo' para minúsculo
      setTransactions(
        data.map((t) => ({
          ...t,
          tipo: (typeof t.tipo === "string" ? t.tipo.toLowerCase() : t.tipo) as
            | "entrada"
            | "saida",
        }))
      );
    } catch (e) {
      setTransactions([]);
    }
  };
  // Agrupa transações por categoria para gráfico de pizza
  const getPieData = (tipo: "entrada" | "saida") => {
    const filtered = transactions.filter((t) => t.tipo === tipo);
    const grouped: { [cat: string]: { valor: number; count: number } } = {};
    filtered.forEach((t) => {
      if (!grouped[t.categoria]) grouped[t.categoria] = { valor: 0, count: 0 };
      grouped[t.categoria].valor += t.valor;
      grouped[t.categoria].count += 1;
    });
    // Recharts espera o campo 'name' para o label
    return Object.entries(grouped).map(([categoria, obj]) => ({
      name: categoria,
      valor: obj.valor,
      count: obj.count,
    }));
  };

  const COLORS = [
    "#22c55e",
    "#ef4444",
    "#f59e42",
    "#6366f1",
    "#eab308",
    "#06b6d4",
    "#a21caf",
    "#f472b6",
    "#64748b",
    "#facc15",
    "#0ea5e9",
    "#d97706",
    "#84cc16",
    "#db2777",
    "#7c3aed",
  ];

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
      // Carregar dados baseado no perfil
      // Se for líder/membro, passa o equipeId para buscar apenas da sua equipe
      const userEquipeId = user?.equipe ? parseInt(user.equipe) : undefined;
      const membersData = can("canViewMembers")
        ? await getMembers(userEquipeId)
        : [];
      const teamsData = can("canViewTeams")
        ? await getTeams(user?.role, user?.equipe)
        : [];

      const transactionsData = can("canViewFinance")
        ? await getTransactions()
        : [];
      const inventoryData = can("canViewInventory")
        ? await getInventoryItems()
        : [];

      // Para admin, não precisa filtrar (já vem tudo)
      // Para líder/membro, já vem filtrado do backend
      let filteredMembers = membersData;
      let filteredTransactions = transactionsData;
      let filteredInventory = inventoryData;

      if (user?.role !== "admin" && user?.equipe) {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      lider:
        user?.cargo === "Professor Orientador" || user?.cargo === "Professor"
          ? "Professor Orientador"
          : "Líder de Equipe",
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
        {/* Saudação */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {getGreeting()}, {user?.nome?.split(" ")[0]}!
          </h1>
          <p className="text-sm sm:text-base opacity-90 mt-2">
            {getRoleLabel(user?.role || "")} •{" "}
            {user?.role === "admin"
              ? "Acesso Total"
              : user?.equipeNome ||
                (user?.equipe ? `Equipe ${user.equipe}` : "Sem equipe")}
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <UserGroupIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </Card>
          )}
          {can("canViewFinance") && user?.role !== "admin" && (
            <Card className="lg:col-span-2">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60 mb-1">Saldo</p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      R$
                      {financeSummary
                        ? " " +
                          financeSummary.saldo.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : " -"}
                    </p>
                    <p className="text-xs opacity-50 mt-1">
                      {financeSummary && financeSummary.saldo >= 0
                        ? "Saldo positivo"
                        : "Saldo negativo"}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      financeSummary && financeSummary.saldo >= 0
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <BanknotesIcon
                      className={`w-6 h-6 ${
                        financeSummary && financeSummary.saldo >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
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

            {can("canCreateFinance") && (
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
            )}

            {can("canCreateInventory") && (
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
            )}

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

        <br />


        <h2 className="text-xl font-bold mb-4">Resumo Financeiro</h2>
        {/* Gráficos Financeiros */}
        {can("canViewFinance") && user?.role !== "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-bold mb-4">
                  Entradas por Categoria
                </h2>
                {getPieData("entrada").length === 0 ? (
                  <div className="text-center opacity-60">
                    Sem dados de entrada
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={getPieData("entrada")}
                        dataKey="valor"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        // Remove o label externo para deixar o gráfico mais limpo
                      >
                        {getPieData("entrada").map((_, idx) => (
                          <Cell
                            key={`cell-entrada-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length)
                            return null;
                          const entry = payload[0].payload;
                          const total = getPieData("entrada").reduce(
                            (sum, d) => sum + d.valor,
                            0
                          );
                          const percent = total
                            ? (entry.valor / total) * 100
                            : 0;
                          return (
                            <div
                              style={{
                                background: "#fff",
                                border: "1px solid #ccc",
                                padding: 8,
                                borderRadius: 6,
                              }}
                            >
                              <div>
                                <b>{entry.name}</b>
                              </div>
                              <div>
                                Valor:{" "}
                                {entry.valor.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </div>
                              <div>Qtd: {entry.count}</div>
                              <div>{percent.toFixed(1)}% do total</div>
                            </div>
                          );
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
            <Card>
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-bold mb-4">Saídas por Categoria</h2>
                {getPieData("saida").length === 0 ? (
                  <div className="text-center opacity-60">
                    Sem dados de saída
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={getPieData("saida")}
                        dataKey="valor"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={false}
                      >
                        {getPieData("saida").map((_, idx) => (
                          <Cell
                            key={`cell-saida-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length)
                            return null;
                          const entry = payload[0].payload;
                          const total = getPieData("saida").reduce(
                            (sum, d) => sum + d.valor,
                            0
                          );
                          const percent = total
                            ? (entry.valor / total) * 100
                            : 0;
                          return (
                            <div
                              style={{
                                background: "#fff",
                                border: "1px solid #ccc",
                                padding: 8,
                                borderRadius: 6,
                              }}
                            >
                              <div>
                                <b>{entry.name}</b>
                              </div>
                              <div>
                                Valor:{" "}
                                {entry.valor.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </div>
                              <div>Qtd: {entry.count}</div>
                              <div>{percent.toFixed(1)}% do total</div>
                            </div>
                          );
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
