import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import {
  getTransactions,
  deleteTransaction,
} from "../../../services/financeService";
import { getTeams } from "../../../services/teamService";
import type { Transaction } from "../../../types/finance";
import type { Team } from "../../../types/admin";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { usePermissions } from "../../../hooks/usePermissions";
import { useAuth } from "../../../context/AuthContext";
import {
  PageHeader,
  SearchBar,
  FilterSelect,
  Card,
  EmptyState,
  Table,
  TableHeader,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  MobileCard,
  MobileCardItem,
  MobileCardActions,
} from "../../../components/ui";

const FinanceListPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterEquipe, setFilterEquipe] = useState("");
  const { can } = usePermissions();
  const { user } = useAuth();

  useEffect(() => {
    loadTransactions();
    if (user?.role === "admin") {
      loadTeams();
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      alert("Erro ao carregar transações");
    }
  };

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
    }
  };

  const handleDelete = async (id: string, descricao: string) => {
    if (confirm(`Tem certeza que deseja excluir "${descricao}"?`)) {
      try {
        await deleteTransaction(id);
        await loadTransactions();
        alert("Transação excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir transação:", error);
        alert("Erro ao excluir transação");
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR");
  };

  // Filtros
  const filteredTransactions = transactions.filter((t) => {
    // Não filtra por equipe localmente para membros/líderes, deixa o backend controlar
    const matchSearch =
      t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = !filterTipo || t.tipo === filterTipo;
    let matchEquipe = true;
    if (user?.role === "admin") {
      matchEquipe =
        !filterEquipe ||
        String(t.equipeId) === String(filterEquipe) ||
        (filterEquipe === "geral" && (!t.equipeId || t.equipeId === ""));
    }
    return matchSearch && matchTipo && matchEquipe;
  });

  // Calcula totais
  const totalEntradas = filteredTransactions
    .filter((t) => t.tipo === "entrada")
    .reduce((sum, t) => sum + t.valor, 0);
  const totalSaidas = filteredTransactions
    .filter((t) => t.tipo === "saida")
    .reduce((sum, t) => sum + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Financeiro"
          description="Controle de entradas e saídas financeiras"
          actionButton={
            can("canCreateFinance")
              ? {
                  label: "Nova Transação",
                  to: "/finance/new",
                  icon: PlusIcon,
                }
              : undefined
          }
        />

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por descrição ou categoria..."
            />
            <FilterSelect
              value={filterTipo}
              onChange={setFilterTipo}
              options={[
                { value: "entrada", label: "Entradas" },
                { value: "saida", label: "Saídas" },
              ]}
              placeholder="Todos os Tipos"
            />
            {user?.role === "admin" && (
              <FilterSelect
                value={filterEquipe}
                onChange={setFilterEquipe}
                options={[
                  { value: "geral", label: "Geral (Sem Equipe)" },
                  ...teams.map((team) => ({
                    value: team.id.toString(),
                    label: team.nome,
                  })),
                ]}
                placeholder="Todas as Equipes"
              />
            )}
          </div>
        </Card>

        {filteredTransactions.length === 0 ? (
          <Card>
            <EmptyState
              title="Nenhuma transação encontrada"
              description="Não há transações cadastradas ou nenhuma corresponde aos filtros aplicados."
            />
          </Card>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block lg:hidden space-y-3">
              {filteredTransactions.map((transaction) => (
                <MobileCard key={transaction.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.descricao}
                      </p>
                      <p className="text-xs opacity-60">
                        {transaction.categoria}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.tipo === "entrada"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MobileCardItem
                      label="Valor"
                      value={formatCurrency(transaction.valor)}
                    />
                    <MobileCardItem
                      label="Data"
                      value={formatDate(transaction.data)}
                    />
                    <MobileCardItem
                      label="Equipe"
                      value={transaction.equipe || "N/A"}
                      fullWidth
                    />
                  </div>
                  <MobileCardActions>
                    <Link
                      to={`/finance/${transaction.id}`}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Ver Detalhes
                    </Link>
                    {can("canEditFinance") && (
                      <Link
                        to={`/finance/${transaction.id}/edit`}
                        className="btn btn-ghost btn-sm"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                    )}
                    {can("canDeleteFinance") && (
                      <button
                        onClick={() =>
                          handleDelete(transaction.id, transaction.descricao)
                        }
                        className="btn btn-error btn-sm"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </MobileCardActions>
                </MobileCard>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableHeadCell>Descrição</TableHeadCell>
                  <TableHeadCell>Tipo</TableHeadCell>
                  <TableHeadCell>Categoria</TableHeadCell>
                  <TableHeadCell>Valor</TableHeadCell>
                  <TableHeadCell>Data</TableHeadCell>
                  <TableHeadCell>Equipe</TableHeadCell>
                  <TableHeadCell className="text-center">Ações</TableHeadCell>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="font-medium">
                          {transaction.descricao}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.tipo === "entrada"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.tipo === "entrada" ? "Entrada" : "Saída"}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.categoria}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            transaction.tipo === "entrada"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.tipo === "entrada" ? "+" : "-"}
                          {formatCurrency(transaction.valor)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(transaction.data)}</TableCell>
                      <TableCell>{transaction.equipe || "N/A"}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/finance/${transaction.id}`}
                            className="btn btn-primary btn-xs"
                          >
                            Ver
                          </Link>
                          {can("canEditFinance") && (
                            <Link
                              to={`/finance/${transaction.id}/edit`}
                              className="btn btn-ghost btn-xs"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                          )}
                          {can("canDeleteFinance") && (
                            <button
                              onClick={() =>
                                handleDelete(
                                  transaction.id,
                                  transaction.descricao
                                )
                              }
                              className="btn btn-error btn-xs"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default FinanceListPage;
