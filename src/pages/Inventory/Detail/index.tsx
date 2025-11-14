import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import {
  getInventoryItemById,
  deleteInventoryItem,
} from "../../../services/inventoryService";
import { getTeams } from "../../../services/teamService";
import type { InventoryItem } from "../../../types/inventory";
import { PencilIcon } from "@heroicons/react/24/outline";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  BackButton,
  DetailSection,
  DetailItem,
  DetailGrid,
} from "../../../components/ui";

const InventoryDetailPage = () => {
  const { id } = useParams();
  const { can } = usePermissions();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const [foundItem, teamsList] = await Promise.all([
            getInventoryItemById(id),
            getTeams(),
          ]);
          setItem(foundItem || null);
          setTeams(teamsList || []);
        } catch (error) {
          console.error("Erro ao carregar item:", error);
          alert("Erro ao carregar dados do item");
        }
      }
    };
    fetchData();
  }, [id]);

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-12">Carregando...</div>
      </Layout>
    );
  }

  // Função para pegar o nome da equipe pelo id
  const getEquipeNome = (equipeId: number | string) => {
    const equipe = teams.find((t) => t.id === Number(equipeId));
    return equipe ? equipe.nome : "-";
  };

  // Função para deletar item
  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await deleteInventoryItem(id);
        alert("Item excluído com sucesso!");
        window.location.href = "/inventory";
      } catch (error) {
        alert("Erro ao excluir item");
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header fora do card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            {can("canEditInventory") && (
              <Link
                to={`/inventory/${id}/edit`}
                className="btn btn-primary gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Editar
              </Link>
            )}
            {can("canDeleteInventory") && (
              <button onClick={handleDelete} className="btn btn-error gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Excluir
              </button>
            )}
          </div>
        </div>
        {/* Card com o conteúdo do item */}
        <div className="bg-white rounded-xl shadow-md border p-6 sm:p-8">
          {/* Informações Principais */}
          <div className="flex flex-col">
              <h1 className="text-3xl font-bold leading-tight">{item.nome}</h1>
              <span className="text-base opacity-60 mt-1">
                SKU:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {item.sku}
                </code>
              </span>
            </div>
            <br />
          <DetailSection title="Informações do Item">
            
            <DetailGrid>
              <DetailItem label="Nome" value={item.nome} />
              <DetailItem label="SKU" value={item.sku} />
              <DetailItem label="Categoria" value={item.categoria} />
              <DetailItem
                label="Quantidade"
                value={
                  <span className="font-bold text-lg text-primary">
                    {item.quantidade}
                  </span>
                }
              />
              <DetailItem label="Localização" value={item.localizacao} />
              <DetailItem
                label="Equipe Responsável"
                value={getEquipeNome(item.equipeId)}
              />
            </DetailGrid>
          </DetailSection>

        </div>
      </div>
    </Layout>
  );
};

export default InventoryDetailPage;
