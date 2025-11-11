import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getTransactionById } from "../../../services/financeService";
import type { Transaction } from "../../../types/finance";
import { PencilIcon } from "@heroicons/react/24/outline";
import { usePermissions } from "../../../hooks/usePermissions";

const FinanceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const { can } = usePermissions();

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    if (!id) return;

    try {
      const data = await getTransactionById(id);
      if (data) {
        setTransaction(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar transação:", error);
      alert("Erro ao carregar transação");
      setLoading(false);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 opacity-60">Carregando transação...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl font-semibold">Transação não encontrada</p>
            <Link to="/finance" className="btn btn-primary mt-4">
              Voltar para Financeiro
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Detalhes da Transação
            </h1>
            <p className="text-sm sm:text-base opacity-60 mt-1">
              Informações completas da transação
            </p>
          </div>
          {can("canEditFinance") && (
            <Link
              to={`/finance/${id}/edit`}
              className="btn btn-primary btn-sm sm:btn-md"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Editar
            </Link>
          )}
        </div>

        {/* Tipo Badge Grande */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border">
          <div className="text-center">
            <span
              className={`inline-block px-6 py-3 text-lg font-bold rounded-full ${
                transaction.tipo === "entrada"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {transaction.tipo === "entrada" ? "ENTRADA" : "SAÍDA"}
            </span>
          </div>
        </div>

        {/* Valor Destacado */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border">
          <div className="text-center">
            <p className="text-sm opacity-60 mb-2">Valor</p>
            <p
              className={`text-4xl sm:text-5xl font-bold ${
                transaction.tipo === "entrada"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {transaction.tipo === "entrada" ? "+" : "-"}
              {formatCurrency(transaction.valor)}
            </p>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border space-y-6">
          <h2 className="text-xl font-semibold mb-4">Informações</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium opacity-60 mb-1">
                Descrição
              </label>
              <p className="text-base">{transaction.descricao}</p>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium opacity-60 mb-1">
                Categoria
              </label>
              <p className="text-base">{transaction.categoria}</p>
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium opacity-60 mb-1">
                Data
              </label>
              <p className="text-base">{formatDate(transaction.data)}</p>
            </div>

            {/* Equipe */}
            <div>
              <label className="block text-sm font-medium opacity-60 mb-1">
                Equipe
              </label>
              <p className="text-base">{transaction.equipe || "Geral"}</p>
            </div>

            {/* Criado Por */}
            <div>
              <label className="block text-sm font-medium opacity-60 mb-1">
                Criado Por
              </label>
              <p className="text-base">ID: {transaction.criadoPor}</p>
            </div>
          </div>
        </div>

        {/* Botão Voltar */}
        <div className="flex justify-center">
          <Link to="/finance" className="btn btn-ghost">
            Voltar para Financeiro
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default FinanceDetailPage;
