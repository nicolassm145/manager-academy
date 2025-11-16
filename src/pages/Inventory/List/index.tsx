import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import {
  getInventoryItems,
  deleteInventoryItem,
} from "../../../services/inventoryService";
import { getTeams } from "../../../services/teamService";
import type { InventoryItem } from "../../../types/inventory";
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

const InventoryListPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterEquipe, setFilterEquipe] = useState("");
  const { can } = usePermissions();
  const { user } = useAuth();
  
  useEffect(() => {
    loadItems();
    loadTeams();
    
  }, [user]);

  useEffect(() => {
    loadItems();
    
  }, [searchTerm, filterCategoria, filterEquipe]);

  const loadItems = async () => {
    try {
      const filters: any = {};
      if (searchTerm) filters.nome = searchTerm;
      if (filterCategoria) filters.categoria = filterCategoria;
      // Filtro de equipe só para admin
      if (user?.role === "admin" && filterEquipe && filterEquipe !== "geral") {
        filters.equipeId = Number(filterEquipe);
      }
      const data = await getInventoryItems(filters);
      setItems(data);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      alert("Erro ao carregar inventário");
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

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      try {
        await deleteInventoryItem(id);
        await loadItems();
        alert("Item excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir item:", error);
        alert("Erro ao excluir item");
      }
    }
  };

  // Agora os itens já vêm filtrados do backend
  const filteredItems = items;

  const categorias = Array.from(new Set(items.map((i) => i.categoria)));

  // Função para pegar o nome da equipe pelo id
  const getEquipeNome = (equipeId: number | string) => {
    const equipe = teams.find((t) => t.id === Number(equipeId));
    return equipe ? equipe.nome : "N/A";
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Inventário"
          description="Controle de itens e equipamentos"
          actionButton={
            can("canCreateInventory")
              ? {
                  label: "Novo Item",
                  to: "/inventory/new",
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
              placeholder="Buscar por nome, SKU ou categoria..."
            />
            <FilterSelect
              value={filterCategoria}
              onChange={setFilterCategoria}
              options={categorias.map((c) => ({ value: c, label: c }))}
              placeholder="Todas as Categorias"
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

        {filteredItems.length === 0 ? (
          <Card>
            <EmptyState
              title="Nenhum item encontrado"
              description="Não há itens cadastrados ou nenhum corresponde aos filtros aplicados."
            />
          </Card>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block lg:hidden space-y-3">
              {filteredItems.map((item) => (
                <MobileCard key={item.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{item.nome}</p>
                      <p className="text-xs opacity-60">{item.sku}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.categoria}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MobileCardItem
                      label="Quantidade"
                      value={item.quantidade.toString()}
                    />
                    <MobileCardItem
                      label="Localização"
                      value={item.localizacao}
                    />
                    <MobileCardItem
                      label="Equipe"
                      value={getEquipeNome(item.equipeId)}
                      fullWidth
                    />
                  </div>
                  <MobileCardActions>
                    <Link
                      to={`/inventory/${item.id}`}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Ver Detalhes
                    </Link>
                    {can("canEditInventory") && (
                      <Link
                        to={`/inventory/${item.id}/edit`}
                        className="btn btn-ghost btn-sm"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                    )}
                    {can("canDeleteInventory") && (
                      <button
                        onClick={() => handleDelete(item.id, item.nome)}
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
                  <TableHeadCell>Item</TableHeadCell>
                  <TableHeadCell>SKU</TableHeadCell>
                  <TableHeadCell>Categoria</TableHeadCell>
                  <TableHeadCell>Quantidade</TableHeadCell>
                  <TableHeadCell>Localização</TableHeadCell>
                  <TableHeadCell>Equipe</TableHeadCell>
                  <TableHeadCell className="text-center">Ações</TableHeadCell>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.nome}</div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.categoria}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{item.quantidade}</span>
                      </TableCell>
                      <TableCell>{item.localizacao}</TableCell>
                      <TableCell>{getEquipeNome(item.equipeId)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/inventory/${item.id}`}
                            className="btn btn-primary btn-xs"
                          >
                            Ver
                          </Link>
                          {can("canEditInventory") && (
                            <Link
                              to={`/inventory/${item.id}/edit`}
                              className="btn btn-ghost btn-xs"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                          )}
                          {can("canDeleteInventory") && (
                            <button
                              onClick={() => handleDelete(item.id, item.nome)}
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

export default InventoryListPage;
