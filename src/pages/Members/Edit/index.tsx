import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/layout/LayoutComponent";
import { getMemberById, updateMember } from "../../../services/memberService";
import { getTeams } from "../../../services/teamService";
import type { Team } from "../../../types/admin";
import { COURSES } from "../../../constants/courses";
import { useAuth } from "../../../context/AuthContext";

const EditMemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [member, setMember] = useState<any>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    curso: "",
    equipe: "",
    cargo: "",
    role: "membro" as "admin" | "lider" | "professor" | "diretor" | "membro",
    newPassword: "",
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data); // Backend retorna todas as equipes disponíveis
    } catch (error) {
      console.error("Erro ao carregar equipes:", error);
      alert("Erro ao carregar equipes. Tente novamente.");
    }
  };

  useEffect(() => {
    const fetchMember = async () => {
      if (id) {
        try {
          const foundMember = await getMemberById(id);
          setMember(foundMember);

          if (foundMember) {
            setFormData({
              email: foundMember.email,
              curso: foundMember.curso,
              equipe: foundMember.equipe,
              cargo: foundMember.cargo,
              role: foundMember.role,
              newPassword: "",
            });
          }
        } catch (error) {
          console.error("Erro ao carregar membro:", error);
          alert("Erro ao carregar dados do membro");
        }
      }
    };
    fetchMember();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const updateData: any = {
      email: formData.email,
      curso: formData.curso,
      equipe: formData.equipe,
      cargo: formData.cargo,
    };

    // Apenas admin pode alterar senha e perfil
    if (user?.role === "admin") {
      if (formData.role) {
        updateData.role = formData.role;
      }
      if (formData.newPassword && formData.newPassword.length >= 6) {
        updateData.password = formData.newPassword;
      }
    }

    try {
      await updateMember(id, updateData);
      alert("Membro e dados de acesso atualizados com sucesso!");
      navigate(`/members/${id}`);
    } catch (error) {
      console.error("Erro ao atualizar membro:", error);
      alert("Erro ao atualizar membro");
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
    if (!member) return "Matrícula";

    switch (member.role) {
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

  if (!member) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="opacity-60">Membro não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Editar Membro</h1>
          <p className="text-sm sm:text-base opacity-60 mt-1">
            {member.nome} - {member.matricula}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border space-y-4 sm:space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-6 border-b">
            <div>
              <label className="block text-sm font-medium opacity-60 mb-2">
                Nome (não editável)
              </label>
              <input
                type="text"
                disabled
                value={member.nome}
                className="w-full px-4 py-3 bg-gray-100 border rounded-lg opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium opacity-60 mb-2">
                {getMatriculaLabel()} (não editável)
              </label>
              <input
                type="text"
                disabled
                value={member.matricula}
                className="w-full px-4 py-3 bg-gray-100 border rounded-lg opacity-60 cursor-not-allowed"
              />
            </div>
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
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

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
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um curso</option>
              {COURSES.map((curso) => (
                <option key={curso} value={curso}>
                  {curso}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="equipe"
                className="block text-sm font-medium mb-2"
              >
                Equipe
              </label>
              {user?.role === "lider" ? (
                // Líder: Campo desabilitado, não pode mudar equipe
                <div className="w-full px-4 py-3 bg-gray-100 border rounded-lg opacity-60">
                  {teams.find((t) => t.id.toString() === formData.equipe)
                    ?.nome || "Sem equipe"}
                </div>
              ) : (
                // Admin: Pode alterar equipe
                <>
                  <select
                    id="equipe"
                    name="equipe"
                    value={formData.equipe}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sem equipe</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.nome}
                      </option>
                    ))}
                  </select>
                  {formData.equipe !== member.equipe && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Mudança de equipe será registrada no histórico
                    </p>
                  )}
                </>
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
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Líder">Líder</option>
                <option value="Vice-Líder">Vice-Líder</option>
                <option value="Membro">Membro</option>
                <option value="Professor Orientador">
                  Professor Orientador
                </option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4 sm:pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Dados de Acesso ao Sistema
            </h3>
          </div>

          {/* Perfil de Acesso - apenas admin pode editar */}
          {user?.role === "admin" ? (
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Perfil de Acesso *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="membro">Membro - Acesso básico</option>
                <option value="lider">Líder - Gerencia sua equipe</option>
                <option value="admin">Administrador - Acesso total</option>
                <option value="professor">
                  Professor - Consulta e orientação
                </option>
              </select>
              <p className="text-xs opacity-60 mt-1">
                Define as permissões no sistema
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">
                Perfil de Acesso
              </label>
              <div className="px-4 py-3 border rounded-lg bg-gray-50">
                <strong>
                  {formData.role === "admin" && "Administrador - Acesso total"}
                  {formData.role === "lider" && "Líder - Gerencia sua equipe"}
                  {formData.role === "membro" && "Membro - Acesso básico"}
                  {formData.role === "professor" &&
                    "Professor - Consulta e orientação"}
                  {formData.role === "diretor" && "Diretor - Gerencia finanças"}
                </strong>
              </div>
              <p className="text-xs opacity-60 mt-1">
                Apenas administradores podem alterar o perfil de acesso
              </p>
            </div>
          )}

          {/* Senha - apenas admin pode editar */}
          {user?.role === "admin" ? (
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium mb-2"
              >
                Nova Senha (opcional)
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                minLength={6}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Deixe em branco para manter a atual"
              />
              <p className="text-xs opacity-60 mt-1">
                Preencha apenas se quiser alterar a senha de login
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <div className="px-4 py-3 border rounded-lg bg-gray-50">
                ••••••••
              </div>
              <p className="text-xs opacity-60 mt-1">
                Apenas administradores podem alterar a senha
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => navigate(`/members/${id}`)}
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

export default EditMemberPage;
