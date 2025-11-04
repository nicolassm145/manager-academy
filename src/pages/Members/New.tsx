import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/LayoutComponent";
import { createMember } from "../../services/memberService";

const NewMemberPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    matricula: "",
    email: "",
    curso: "",
    equipe: "",
    cargo: "",
    dataInicio: "",
    status: "ativo" as "ativo" | "inativo",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      createMember(formData);
      alert("Membro cadastrado com sucesso!");
      navigate("/members");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao cadastrar membro");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
          <h1 className="text-2xl sm:text-3xl font-bold">
            Novo Membro
          </h1>
          <p className="text-sm sm:text-base opacity-60 mt-1">
            Cadastre um novo membro da equipe
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border space-y-4 sm:space-y-6"
        >
          {/* Nome */}
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium mb-2"
            >
              Nome Completo *
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="João Silva"
            />
          </div>

          {/* Matrícula e Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label
                htmlFor="matricula"
                className="block text-sm font-medium mb-2"
              >
                Matrícula *
              </label>
              <input
                id="matricula"
                name="matricula"
                type="text"
                required
                value={formData.matricula}
                onChange={handleChange}
                maxLength={10}
                pattern="\d{10}"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: 2021000001"
              />
              <p className="text-xs opacity-60 mt-1">
                10 dígitos: AAAA (ano) + 6 dígitos sequenciais
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="joao@example.com"
              />
            </div>
          </div>

          {/* Curso */}
          <div>
            <label
              htmlFor="curso"
              className="block text-sm font-medium mb-2"
            >
              Curso *
            </label>
            <select
              id="curso"
              name="curso"
              required
              value={formData.curso}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um curso</option>
              <option value="Engenharia Mecânica">Engenharia Mecânica</option>
              <option value="Engenharia Elétrica">Engenharia Elétrica</option>
              <option value="Engenharia Aeroespacial">
                Engenharia Aeroespacial
              </option>
              <option value="Engenharia de Produção">
                Engenharia de Produção
              </option>
              <option value="Engenharia Civil">Engenharia Civil</option>
            </select>
          </div>

          {/* Equipe e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label
                htmlFor="equipe"
                className="block text-sm font-medium mb-2"
              >
                Equipe *
              </label>
              <select
                id="equipe"
                name="equipe"
                required
                value={formData.equipe}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione uma equipe</option>
                <option value="DevU">DevU</option>
                <option value="Byron">Byron</option>
                <option value="Exmachima">Exmachima</option>
                <option value="Asimov">Asimov</option>
                <option value="BlackBee">BlackBee</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="cargo"
                className="block text-sm font-medium mb-2"
              >
                Cargo *
              </label>
              <select
                id="cargo"
                name="cargo"
                required
                value={formData.cargo}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione um cargo</option>
                <option value="Líder">Líder</option>
                <option value="Vice-Líder">Vice-Líder</option>
                <option value="Membro">Membro</option>
              </select>
            </div>
          </div>

          {/* Data de Início */}
          <div>
            <label
              htmlFor="dataInicio"
              className="block text-sm font-medium mb-2"
            >
              Data de Início *
            </label>
            <input
              id="dataInicio"
              name="dataInicio"
              type="date"
              required
              value={formData.dataInicio}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Cadastrar Membro
            </button>
            <button
              type="button"
              onClick={() => navigate("/members")}
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

export default NewMemberPage;
