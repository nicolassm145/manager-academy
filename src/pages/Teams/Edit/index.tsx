import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getTeamById, updateTeam } from "../../../services/teamService";

const EditTeamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any>(undefined);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  });

  useEffect(() => {
    const fetchTeam = async () => {
      if (id) {
        try {
          const foundTeam = await getTeamById(id);
          setTeam(foundTeam);

          if (foundTeam) {
            setFormData({
              nome: foundTeam.nome,
              descricao: foundTeam.descricao,
            });
          }
        } catch (error) {
          console.error("Erro ao carregar equipe:", error);
          alert("Erro ao carregar dados da equipe");
        }
      }
    };
    fetchTeam();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      try {
        // Envia apenas nome e descricao
        await updateTeam(id, {
          nome: formData.nome,
          descricao: formData.descricao,
        });
        alert("Equipe atualizada com sucesso!");
        navigate(`/admin/teams/${id}`);
      } catch (error) {
        console.error("Erro ao atualizar equipe:", error);
        alert(
          `Erro ao atualizar equipe: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`
        );
      }
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
          <p className="opacity-60">Equipe não encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Editar Equipe</h1>
          <p className="opacity-60 mt-1">{team.nome}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 border space-y-6"
        >
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-2">
              Nome da Equipe *
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
            <label
              htmlFor="descricao"
              className="block text-sm font-medium mb-2"
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
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/teams/${id}`)}
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

export default EditTeamPage;
