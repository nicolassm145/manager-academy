import React, { useEffect, useState } from "react";
import { StatCard, Card } from "../../../components/ui";
import { Layout } from "../../../components/LayoutComponent";
import {
  getFinanceSummary,
  getFinanceCategories,
  getFinanceMonthly,
  getFinanceLastTransactions,
} from "../../../services/financeDashboardService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

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

const FinanceResumePage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [lastTransactions, setLastTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Busca todas as transações para garantir cálculo igual ao da listagem
        const [categoriesData, monthlyData, lastData, transactionsData] =
          await Promise.all([
            getFinanceCategories(),
            getFinanceMonthly(new Date().getFullYear()),
            getFinanceLastTransactions(),
            import("../../../services/financeService").then((m) =>
              m.getTransactions()
            ),
          ]);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        // Se monthlyData for objeto, transforma em array [{ mes, entradas, saidas }]
        let monthlyArray = [];
        if (Array.isArray(monthlyData)) {
          monthlyArray = monthlyData;
        } else if (monthlyData && typeof monthlyData === "object") {
          monthlyArray = Object.entries(monthlyData).map(
            ([mes, obj]: [string, any]) => ({
              mes: Number(mes),
              ...obj,
            })
          );
        }
        setMonthly(monthlyArray);
        setLastTransactions(lastData);
        setTransactions(
          Array.isArray(transactionsData) ? transactionsData : []
        );
        console.log("monthly", monthlyData);
      } catch (e) {
        setCategories([]);
        setMonthly([]);
        setLastTransactions([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helpers para gráficos - agora usando as transações reais
  const entradasPorCategoria = transactions
    .filter((t) => t.tipo?.toLowerCase() === "entrada")
    .reduce((acc: { categoria: string; valor: number; count: number }[], t) => {
      const idx = acc.findIndex(
        (c: { categoria: string; valor: number; count: number }) =>
          c.categoria === t.categoria
      );
      if (idx >= 0) {
        acc[idx].valor += Number(t.valor) || 0;
        acc[idx].count += 1;
      } else {
        acc.push({
          categoria: t.categoria,
          valor: Number(t.valor) || 0,
          count: 1,
        });
      }
      return acc;
    }, [] as { categoria: string; valor: number; count: number }[]);

  const saidasPorCategoria = transactions
    .filter((t) => t.tipo?.toLowerCase() === "saida")
    .reduce((acc: { categoria: string; valor: number; count: number }[], t) => {
      const idx = acc.findIndex(
        (c: { categoria: string; valor: number; count: number }) =>
          c.categoria === t.categoria
      );
      if (idx >= 0) {
        acc[idx].valor += Number(t.valor) || 0;
        acc[idx].count += 1;
      } else {
        acc.push({
          categoria: t.categoria,
          valor: Number(t.valor) || 0,
          count: 1,
        });
      }
      return acc;
    }, [] as { categoria: string; valor: number; count: number }[]);

  // Cálculo igual ao da listagem
  const totalEntradas = transactions
    .filter((t) => t.tipo?.toLowerCase() === "entrada")
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
  const totalSaidas = transactions
    .filter((t) => t.tipo?.toLowerCase() === "saida")
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <Layout>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Resumo Financeiro</h1>
        <p className="text-sm sm:text-base opacity-60 mt-1">
          Visão geral das finanças da organização
        </p>
      </div>
      <br />
      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Entradas"
          value={
            loading
              ? "..."
              : totalEntradas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
          }
          color="green"
        />
        <StatCard
          label="Saídas"
          value={
            loading
              ? "..."
              : totalSaidas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
          }
          color="red"
        />
        <StatCard
          label="Saldo"
          value={
            loading
              ? "..."
              : saldo.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
          }
          color={saldo >= 0 ? "green" : "red"}
        />
      </div>

      {/* Gráficos de Pizza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4">Entradas por Categoria</h2>
            {entradasPorCategoria.length === 0 ? (
              <div className="text-center opacity-60">Sem dados de entrada</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={entradasPorCategoria.map(
                      (c: {
                        categoria: string;
                        valor: number;
                        count: number;
                      }) => ({
                        name: c.categoria,
                        valor: c.valor,
                        count: c.count,
                      })
                    )}
                    dataKey="valor"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {entradasPorCategoria.map((_: any, idx: number) => (
                      <Cell
                        key={`cell-entrada-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const entry = payload[0].payload;
                      const total = entradasPorCategoria.reduce(
                        (
                          sum: number,
                          d: { categoria: string; valor: number; count: number }
                        ) => sum + d.valor,
                        0
                      );
                      const percent = total ? (entry.valor / total) * 100 : 0;
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
            {saidasPorCategoria.length === 0 ? (
              <div className="text-center opacity-60">Sem dados de saída</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={saidasPorCategoria.map(
                      (c: {
                        categoria: string;
                        valor: number;
                        count: number;
                      }) => ({
                        name: c.categoria,
                        valor: c.valor,
                        count: c.count,
                      })
                    )}
                    dataKey="valor"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={false}
                    labelLine={false}
                  >
                    {saidasPorCategoria.map((_: any, idx: number) => (
                      <Cell
                        key={`cell-saida-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const entry = payload[0].payload;
                      const total = saidasPorCategoria.reduce(
                        (
                          sum: number,
                          d: { categoria: string; valor: number; count: number }
                        ) => sum + d.valor,
                        0
                      );
                      const percent = total ? (entry.valor / total) * 100 : 0;
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

      {/* Gráfico de Barras - Evolução Mensal */}
      <Card>
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Evolução Mensal</h2>
          {Array.isArray(monthly) && monthly.length === 0 ? (
            <div className="text-center opacity-60">Sem dados mensais</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  Array.isArray(monthly)
                    ? monthly.filter(
                        (d) =>
                          d &&
                          typeof d.mes !== "undefined" &&
                          typeof d.entradas === "number" &&
                          typeof d.saidas === "number"
                      )
                    : []
                }
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mes"
                  tickFormatter={(m) => `${m}`.padStart(2, "0")}
                />
                <YAxis
                  tickFormatter={(v) =>
                    v.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  }
                />
                <Tooltip
                  formatter={(value: number) =>
                    value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  }
                />
                <Legend />
                <Bar
                  dataKey="entradas"
                  name="Entradas"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="saidas"
                  name="Saídas"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
      <br />
      {/* Últimas Transações */}
      <Card>
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4">Últimas Transações</h2>
          {lastTransactions.length === 0 ? (
            <div className="text-center opacity-60">
              Nenhuma transação encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-base-200">
                    <th className="px-3 py-2 text-left">Descrição</th>
                    <th className="px-3 py-2 text-left">Tipo</th>
                    <th className="px-3 py-2 text-left">Categoria</th>
                    <th className="px-3 py-2 text-left">Valor</th>
                    <th className="px-3 py-2 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {lastTransactions.map((t, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{t.descricao}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            t.tipo?.toLowerCase() === "entrada"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {t.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-2">{t.categoria}</td>
                      <td className="px-3 py-2 font-semibold">
                        {t.tipo?.toLowerCase() === "entrada" ? "+" : "-"}
                        {Number(t.valor).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(t.data).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </Layout>
  );
};

export default FinanceResumePage;
