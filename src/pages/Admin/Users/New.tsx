import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { createUser } from "../../../services/userService";
import { getMembers } from "../../../services/memberService";
import type { Member } from "../../../types/member";

const NewUserPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    role: "" as any,
    equipe: "",
    membroVinculadoId: "",
    status: "ativo" as "ativo" | "inativo",
  });

  useEffect(() => {
    setMembers(getMembers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(formData);
    alert("Usuário criado com sucesso!");
    navigate("/admin/users");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const needsTeam = formData.role === "lider" || formData.role === "membro";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Usuário</h1>
          <p className="text-gray-600 mt-1">Crie um novo usuário do sistema</p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 border border-gray-100 space-y-6"
        >
          {/* Nome */}
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="João Silva"
            />
          </div>

          {/* Email e Senha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="joao@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Perfil */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Perfil de Acesso *
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione um perfil</option>
              <option value="admin">
                Administrador - Acesso total ao sistema
              </option>
              <option value="lider">
                Líder de Equipe - Gerencia sua equipe
              </option>
              <option value="professor">
                Professor Orientador - Acesso de consulta e orientação
              </option>
              <option value="diretor">
                Diretor Financeiro - Gerencia finanças
              </option>
              <option value="membro">Membro - Acesso de consulta</option>
            </select>
          </div>

          {/* Equipe (condicional) */}
          {needsTeam && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <div>
                <label
                  htmlFor="equipe"
                  className="block text-sm font-medium text-blue-900 mb-2"
                >
                  Equipe *
                </label>
                <select
                  id="equipe"
                  name="equipe"
                  required
                  value={formData.equipe}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma equipe</option>
                  <option value="Baja">Baja</option>
                  <option value="Fórmula SAE">Fórmula SAE</option>
                  <option value="Aerodesign">Aerodesign</option>
                  <option value="Eficiência Energética">
                    Eficiência Energética
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="membroVinculadoId"
                  className="block text-sm font-medium text-blue-900 mb-2"
                >
                  Vincular a um Membro (Opcional)
                </label>
                <select
                  id="membroVinculadoId"
                  name="membroVinculadoId"
                  value={formData.membroVinculadoId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sem vínculo</option>
                  {members
                    .filter(
                      (m) => !formData.equipe || m.equipe === formData.equipe
                    )
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.nome} - {member.matricula} ({member.equipe})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-blue-700 mt-2">
                  Vincule este usuário a um membro existente se esta conta for
                  para alguém já cadastrado
                </p>
              </div>

              <p className="text-xs text-blue-700">
                {formData.role === "lider"
                  ? "Este usuário será líder desta equipe"
                  : "Este usuário pertencerá a esta equipe"}
              </p>
            </div>
          )}

          {/* Info sobre permissões */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Sobre os Perfis:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • <strong>Administrador:</strong> Gerencia usuários, equipes e
                configurações
              </li>
              <li>
                • <strong>Líder:</strong> Gerencia membros, inventário e
                finanças da sua equipe
              </li>
              <li>
                • <strong>Professor:</strong> Consulta dados e orienta equipes
              </li>
              <li>
                • <strong>Diretor Financeiro:</strong> Gerencia transações
                financeiras
              </li>
              <li>
                • <strong>Membro:</strong> Consulta membros e inventário
              </li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Criar Usuário
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
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

export default NewUserPage;
