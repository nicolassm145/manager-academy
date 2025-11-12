import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getInventoryItemById } from "../../../services/inventoryService";
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

  useEffect(() => {
    const fetchItem = async () => {
      if (id) {
        try {
          const foundItem = await getInventoryItemById(id);
          setItem(foundItem || null);
        } catch (error) {
          console.error("Erro ao carregar item:", error);
          alert("Erro ao carregar dados do item");
        }
      }
    };
    fetchItem();
  }, [id]);

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-12">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{item.nome}</h1>
              <p className="text-sm opacity-60 mt-1">
                SKU:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {item.sku}
                </code>
              </p>
            </div>
          </div>
          {can("canEditInventory") && (
            <Link
              to={`/inventory/${id}/edit`}
              className="btn btn-primary gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              Editar
            </Link>
          )}
        </div>

        {/* Informações Principais */}
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
              value={item.equipe || "N/A"}
            />
          </DetailGrid>
        </DetailSection>

        {/* Status do Estoque */}
        <DetailSection title="Status do Estoque">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-60 mb-1">Quantidade Disponível</p>
                <p className="text-3xl font-bold text-primary">
                  {item.quantidade}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-60 mb-1">Status</p>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    item.quantidade > 10
                      ? "bg-green-100 text-green-800"
                      : item.quantidade > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.quantidade > 10
                    ? "Estoque OK"
                    : item.quantidade > 0
                    ? "Estoque Baixo"
                    : "Esgotado"}
                </span>
              </div>
            </div>
          </div>
        </DetailSection>
      </div>
    </Layout>
  );
};

export default InventoryDetailPage;
