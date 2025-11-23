import { useState, useEffect } from "react";
import { Feedback } from "../../../components/ui/FeedbackComponent";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/layout/LayoutComponent";
import {
  getInventoryItemById,
  updateInventoryItem,
} from "../../../services/inventoryService";
import { getTeams } from "../../../services/teamService";
import type { Team } from "../../../types/admin";
import { useAuth } from "../../../context/AuthContext";

const EditInventoryItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [item, setItem] = useState<any>(undefined);
  const [formData, setFormData] = useState({
    nome: "",
    sku: "",
    categoria: "",
    quantidade: 0,
    localizacao: "",
    equipeId: "",
  });
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data); // Backend retorna todas as equipes disponíveis
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      if (id) {
        try {
          const foundItem = await getInventoryItemById(id);
          setItem(foundItem);

          if (foundItem) {
            setFormData({
              nome: foundItem.nome,
              sku: foundItem.sku,
              categoria: foundItem.categoria,
              quantidade: foundItem.quantidade,
              localizacao: foundItem.localizacao,
              equipeId: foundItem.equipeId,
            });
          }
        } catch (error) {
          console.error("Erro ao carregar item:", error);
          setFeedback({
            type: "error",
            message: "Erro ao carregar dados do item",
          });
        }
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!id) return;
    try {
      // Não envie o campo sku no update
      const { sku, ...body } = formData;
      await updateInventoryItem(id, {
        ...body,
        equipeId: String(formData.equipeId),
      });
      setFeedback({ type: "success", message: "Item atualizado com sucesso!" });
      setTimeout(() => navigate(`/inventory/${id}`), 1200);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      setFeedback({ type: "error", message: "Erro ao atualizar item" });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "quantidade"
          ? parseInt(value) || 0
          : name === "equipeId"
          ? Number(value)
          : value,
    });
  };

  const categorias = [
    "Eletrônicos",
    "Componentes",
    "Ferramentas",
    "Material de Escritório",
    "Equipamentos",
    "Outros",
  ];

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-12">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Feedback visual global */}
        {feedback && (
          <Feedback type={feedback.type} message={feedback.message} />
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Editar Item</h1>
          <p className="text-sm sm:text-base opacity-60 mt-1">
            Atualize as informações do item
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border space-y-4 sm:space-y-6"
        >
          {/* Nome e SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium mb-2">
                Nome do Item *
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium mb-2">
                SKU *
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                required
                value={formData.sku}
                disabled
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Categoria e Quantidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="categoria"
                className="block text-sm font-medium mb-2"
              >
                Categoria *
              </label>
              <select
                id="categoria"
                name="categoria"
                required
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quantidade"
                className="block text-sm font-medium mb-2"
              >
                Quantidade *
              </label>
              <input
                id="quantidade"
                name="quantidade"
                type="number"
                required
                min="0"
                value={formData.quantidade}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Localização */}
          <div>
            <label
              htmlFor="localizacao"
              className="block text-sm font-medium mb-2"
            >
              Localização *
            </label>
            <input
              id="localizacao"
              name="localizacao"
              type="text"
              required
              value={formData.localizacao}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Equipe */}
          <div>
            <label
              htmlFor="equipeId"
              className="block text-sm font-medium mb-2"
            >
              Equipe Responsável *
            </label>
            {user?.role === "admin" ? (
              <select
                id="equipeId"
                name="equipeId"
                required
                value={formData.equipeId}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.nome}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-3 border rounded-lg bg-gray-50">
                {teams.find((t) => t.id === Number(formData.equipeId))?.nome ||
                  "N/A"}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => navigate(`/inventory`)}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditInventoryItemPage;
