import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../../../components/layout/LayoutComponent";
import { getTransactionById } from "../../../services/financeService";
import { getUserById } from "../../../services/userService";
import type { Transaction } from "../../../types/finance";
import { PencilIcon } from "@heroicons/react/24/outline";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  BackButton,
  DetailSection,
  DetailItem,
  DetailGrid,
} from "../../../components/ui";

const FinanceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [creatorName, setCreatorName] = useState<string>("");
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
        // Busca nome do criador
        if (data.criadoPor) {
          const user = await getUserById(data.criadoPor);
          setCreatorName(user?.nomeCompleto || `ID: ${data.criadoPor}`);
        }
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header fora do card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            {can("canEditFinance") && (
              <Link
                to={`/finance/${id}/edit`}
                className="btn btn-primary gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Editar
              </Link>
            )}
          </div>
        </div>
        {/* Card com o conteúdo da transação */}
        <div className="bg-white rounded-xl shadow-md border p-6 sm:p-8">
          {/* Informações Principais */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold leading-tight">
              Detalhes da Transação
            </h1>
            <span className="text-base opacity-60 mt-1">
              Informações completas da transação
            </span>
          </div>
          <br />
          <DetailSection title="Informações da Transação">
            <DetailGrid>
              <DetailItem
                label="Tipo"
                value={
                  <span
                    className={`inline-block px-4 py-1 text-base font-bold rounded-full ${
                      transaction.tipo === "entrada"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.tipo === "entrada" ? "ENTRADA" : "SAÍDA"}
                  </span>
                }
              />
              <DetailItem
                label="Valor"
                value={
                  <span
                    className={`text-2xl font-bold ${
                      transaction.tipo === "entrada"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.tipo === "entrada" ? "+" : "-"}
                    {formatCurrency(transaction.valor)}
                  </span>
                }
              />
              <DetailItem label="Descrição" value={transaction.descricao} />
              <DetailItem label="Categoria" value={transaction.categoria} />
              <DetailItem label="Data" value={formatDate(transaction.data)} />
              <DetailItem
                label="Equipe"
                value={transaction.equipe || "Geral"}
              />
              <DetailItem label="Criado Por" value={creatorName} />
            </DetailGrid>
          </DetailSection>
        </div>
      </div>
    </Layout>
  );
};

export default FinanceDetailPage;
