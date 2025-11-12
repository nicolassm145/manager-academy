import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { createMember } from "../../../services/memberService";
import { getTeams } from "../../../services/teamService";
import type { Team } from "../../../types/admin";
import { COURSES } from "../../../constants/courses";
import { useAuth } from "../../../context/AuthContext";

const NewMemberPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    matricula: "",
    email: "",
    curso: "",
    equipe: "",
    cargo: "",
    dataInicio: "",
    status: "ativo" as "ativo" | "inativo",
    password: "123456", // Senha padrão
    role: "membro" as "admin" | "lider" | "professor" | "diretor" | "membro",
  });

  useEffect(() => {
    loadTeams();

    // Se for líder, já define a equipe automaticamente como a dele
    if (user?.role === "lider" && user?.equipe) {
      setFormData((prev) => ({
        ...prev,
        equipe: user.equipe || "",
      }));
    }
  }, [user]);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data); // Backend retorna todas as equipes disponíveis
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
      alert("Erro ao carregar equipes. Tente novamente.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const memberData = {
        ...formData,
        dataCriacao: new Date().toISOString(),
      };
      await createMember(memberData);
      alert("Membro e conta de acesso cadastrados com sucesso!");
      navigate("/members");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao cadastrar membro"
      );
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

  // Função para obter o label correto do campo matrícula baseado no role
  const getMatriculaLabel = () => {
    switch (formData.role) {
      case "professor":
        return "Registro Profissional (SIAPE)";
      case "lider":
      case "membro":
        return "Matrícula";
      case "admin":
        return "Registro";
      case "diretor":
        return "Registro Profissional";
      default:
        return "Matrícula";
    }
  };

  const getMatriculaPlaceholder = () => {
    switch (formData.role) {
      case "professor":
        return "Ex: 1234567";
      case "lider":
      case "membro":
        return "Ex: 2021000001";
      default:
        return "Digite o registro";
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Novo Membro</h1>
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
            <label htmlFor="nome" className="block text-sm font-medium mb-2">
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
                {getMatriculaLabel()} *
              </label>
              <input
                id="matricula"
                name="matricula"
                type="text"
                required
                value={formData.matricula}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={getMatriculaPlaceholder()}
              />
              {formData.role === "membro" || formData.role === "lider" ? (
                <p className="text-xs opacity-60 mt-1">
                  10 dígitos: AAAA (ano) + 6 dígitos sequenciais
                </p>
              ) : formData.role === "professor" ? (
                <p className="text-xs opacity-60 mt-1">
                  SIAPE: 7 dígitos do registro profissional
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
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
            <label htmlFor="curso" className="block text-sm font-medium mb-2">
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
              {COURSES.map((curso) => (
                <option key={curso} value={curso}>
                  {curso}
                </option>
              ))}
            </select>
          </div>

          {/* Equipe e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label
                htmlFor="equipe"
                className="block text-sm font-medium mb-2"
              >
                Equipe {user?.role === "lider" && "*"}
              </label>
              {user?.role === "lider" ? (
                // Líder: Campo desabilitado, mostrando apenas sua equipe
                <div className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg bg-gray-50">
                  {teams.find((t) => t.id.toString() === user?.equipe)?.nome ||
                    "Sua Equipe"}
                </div>
              ) : (
                // Admin: Pode selecionar qualquer equipe
                <select
                  id="equipe"
                  name="equipe"
                  value={formData.equipe}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sem equipe</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="cargo" className="block text-sm font-medium mb-2">
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
                <option value="Professor Orientador">
                  Professor Orientador
                </option>
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

          {/* Divisor - Dados de Acesso */}
          <div className="border-t pt-4 sm:pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Dados de Acesso ao Sistema
            </h3>
          </div>

          {/* Senha e Perfil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Senha - apenas admin pode editar */}
            {user?.role === "admin" && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                >
                  Senha *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mínimo 6 caracteres"
                />
                <p className="text-xs opacity-60 mt-1">
                  Esta será a senha de login do membro
                </p>
              </div>
            )}

            {/* Informação de senha padrão para líder */}
            {user?.role === "lider" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Senha de Acesso
                </label>
                <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg bg-gray-50">
                  Senha padrão: <strong>123456</strong>
                </div>
                <p className="text-xs opacity-60 mt-1">
                  O membro poderá alterar a senha após o primeiro login
                </p>
              </div>
            )}

            {/* Perfil - apenas admin pode selecionar */}
            {user?.role === "admin" && (
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium mb-2"
                >
                  Perfil de Acesso *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="membro">Membro - Acesso básico</option>
                  <option value="lider">Líder - Gerencia sua equipe</option>
                  <option value="admin">Administrador - Acesso total</option>
                  <option value="professor">
                    Professor - Consulta e orientação
                  </option>
                  <option value="diretor">Diretor - Gerencia finanças</option>
                </select>
                <p className="text-xs opacity-60 mt-1">
                  Define as permissões no sistema
                </p>
              </div>
            )}

            {/* Informação de perfil fixo para líder */}
            {user?.role === "lider" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Perfil de Acesso
                </label>
                <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg bg-gray-50">
                  <strong>Membro</strong> - Acesso básico
                </div>
                <p className="text-xs opacity-60 mt-1">
                  Líderes só podem criar membros com perfil básico
                </p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
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
