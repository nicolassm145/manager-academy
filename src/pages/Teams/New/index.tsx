import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/layout/LayoutComponent";
import { createTeam } from "../../../services/teamService";

const NewTeamPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    criadoEm: new Date().toISOString().split("T")[0], // Data atual no formato YYYY-MM-DD
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Envia nome, descricao e criadoEm
      await createTeam({
        nome: formData.nome,
        descricao: formData.descricao,
        criadoEm: formData.criadoEm,
      });
      navigate("/admin/teams");
    } catch (error) {
      console.error("Erro ao criar equipe:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nova Equipe</h1>
          <p className="opacity-60 mt-1">Cadastre uma nova equipe no sistema</p>
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
              placeholder="Ex: Baja, Fórmula SAE, Aerodesign"
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
              placeholder="Descreva o propósito e atividades da equipe..."
            />
          </div>

          <div>
            <label
              htmlFor="criadoEm"
              className="block text-sm font-medium mb-2"
            >
              Data de Criação *
            </label>
            <input
              id="criadoEm"
              name="criadoEm"
              type="date"
              required
              value={formData.criadoEm}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs opacity-60 mt-1">
              Data em que a equipe foi fundada
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Criar Equipe
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/teams")}
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

export default NewTeamPage;
