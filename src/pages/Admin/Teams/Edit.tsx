import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getTeamById, updateTeam } from "../../../services/teamService";

const EditTeamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const team = id ? getTeamById(id) : undefined;

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    status: "" as "ativa" | "inativa" | "",
  });

  useEffect(() => {
    if (team) {
      setFormData({
        nome: team.nome,
        descricao: team.descricao,
        status: team.status,
      });
    }
  }, [team]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      const teamData = {
        ...formData,
        status: formData.status as "ativa" | "inativa",
      };
      updateTeam(id, teamData);
      alert("Equipe atualizada com sucesso!");
      navigate(`/admin/teams/${id}`);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!team) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Equipe não encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Equipe</h1>
          <p className="text-gray-600 mt-1">{team.nome}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 border border-gray-100 space-y-6"
        >
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome da Equipe *
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrição *
            </label>
            <textarea
              id="descricao"
              name="descricao"
              required
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Equipes inativas não aparecerão nos dropdowns de seleção
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/teams/${id}`)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditTeamPage;
