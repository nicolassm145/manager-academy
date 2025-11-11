import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { createInventoryItem } from "../../../services/inventoryService";
import { getTeams } from "../../../services/teamService";
import type { Team } from "../../../types/admin";
import { useAuth } from "../../../context/AuthContext";

const NewInventoryItemPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    sku: "",
    categoria: "",
    quantidade: 0,
    localizacao: "",
    equipeId: user?.equipe || "",
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data.filter((team) => team.status === "ativa"));
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createInventoryItem(formData);
      alert("Item cadastrado com sucesso!");
      navigate("/inventory");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao cadastrar item");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantidade" ? parseInt(value) || 0 : value,
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Novo Item</h1>
          <p className="text-sm sm:text-base opacity-60 mt-1">
            Adicione um novo item ao inventário
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Notebook Dell Inspiron"
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
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: NB-DELL-001"
              />
            </div>
          </div>

          {/* Categoria e Quantidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione uma categoria</option>
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Sala 101, Armário A3"
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
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione uma equipe</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.nome}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg bg-gray-50">
                {teams.find((t) => t.id === user?.equipe)?.nome || "Sua Equipe"}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Cadastrar Item
            </button>
            <button
              type="button"
              onClick={() => navigate("/inventory")}
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

export default NewInventoryItemPage;
