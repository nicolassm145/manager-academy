import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { createTransaction } from "../../../services/financeService";
import { getTeams } from "../../../services/teamService";
import type { Team } from "../../../types/admin";
import { useAuth } from "../../../context/AuthContext";

const CATEGORIAS = [
  "Material Elétrico",
  "Material Mecânico",
  "Ferramentas",
  "Patrocínio",
  "Doação",
  "Mensalidade",
  "Inscrição Competição",
  "Transporte",
  "Alimentação",
  "Hospedagem",
  "Outros",
];

const FinanceNewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    tipo: "entrada",
    categoria: "",
    equipe: user?.role === "admin" ? "" : user?.equipe || "",
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.descricao.trim()) {
        alert("Descrição é obrigatória");
        return;
      }
      if (!formData.valor || parseFloat(formData.valor) <= 0) {
        alert("Valor deve ser maior que zero");
        return;
      }
      if (!formData.categoria) {
        alert("Categoria é obrigatória");
        return;
      }

      const transactionData = {
        descricao: formData.descricao.trim(),
        valor: parseFloat(formData.valor),
        data: formData.data,
        tipo: formData.tipo as "entrada" | "saida",
        categoria: formData.categoria,
        equipeId: formData.equipe || "",
        criadoPor: user?.id || "",
      };

      await createTransaction(transactionData);
      alert("Transação criada com sucesso!");
      navigate("/finance");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao criar transação");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nova Transação</h1>
          <p className="text-sm sm:text-base opacity-60 mt-1">
            Registre uma nova entrada ou saída financeira
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border space-y-4 sm:space-y-6"
        >
          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium mb-2">
              Tipo *
            </label>
            <select
              id="tipo"
              name="tipo"
              required
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>

          {/* Descrição */}
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
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Descreva a transação..."
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="valor" className="block text-sm font-medium mb-2">
                Valor (R$) *
              </label>
              <input
                id="valor"
                name="valor"
                type="number"
                required
                value={formData.valor}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="data" className="block text-sm font-medium mb-2">
                Data *
              </label>
              <input
                id="data"
                name="data"
                type="date"
                required
                value={formData.data}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Categoria */}
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
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Equipe */}
          <div>
            <label htmlFor="equipe" className="block text-sm font-medium mb-2">
              Equipe
            </label>
            {user?.role === "admin" ? (
              <select
                id="equipe"
                name="equipe"
                value={formData.equipe}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Nenhuma (Geral)</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.nome}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg bg-gray-50">
                  Sua equipe atual
                </div>
                <p className="text-xs opacity-60 mt-1">
                  Líderes registram transações apenas para sua equipe
                </p>
              </>
            )}
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Salvar Transação
            </button>
            <button
              type="button"
              onClick={() => navigate("/finance")}
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

export default FinanceNewPage;
