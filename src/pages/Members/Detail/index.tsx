import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getMemberById, deleteMember } from "../../../services/memberService";
import { getTeams } from "../../../services/teamService";
import { usePermissions } from "../../../hooks/usePermissions";
import { useAuth } from "../../../context/AuthContext";
import type { Member } from "../../../types/member";
import type { Team } from "../../../types/admin";
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const MemberDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { user } = useAuth();
  const [member, setMember] = useState<Member | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id, user]);

  const loadData = async () => {
    if (id) {
      try {
        const [memberData, teamsData] = await Promise.all([
          getMemberById(id),
          getTeams(user?.role, user?.equipe),
        ]);
        setMember(memberData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getTeamName = (equipeId?: string) => {
    if (!equipeId) return "Sem equipe";
    const team = teams.find((t) => t.id === Number(equipeId));
    return team?.nome || equipeId;
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="opacity-60">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!member) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="opacity-60">Membro não encontrado</p>
          <Link to="/members" className="btn btn-link mt-4">
            Voltar
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDelete = async () => {
    if (id && confirm("Tem certeza que deseja excluir este membro?")) {
      try {
        await deleteMember(id);
        alert("Membro excluído com sucesso!");
        navigate("/members");
      } catch (error) {
        console.error("Erro ao excluir membro:", error);
        alert("Erro ao excluir membro");
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate("/members")}
            className="btn btn-ghost flex items-center gap-2 self-start"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Voltar
          </button>
          {(can("canEditMember") || can("canDeleteMember")) && (
            <div className="flex gap-2 sm:gap-3">
              {can("canEditMember") && (
                <Link
                  to={`/members/${id}/edit`}
                  className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Editar
                </Link>
              )}
              {can("canDeleteMember") && (
                <button
                  onClick={handleDelete}
                  className="btn btn-error flex-1 sm:flex-none flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Excluir
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border">
          <div className="flex items-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-base-200 flex items-center justify-center mr-4 sm:mr-6 flex-shrink-0">
              <span className="text-2xl sm:text-3xl font-bold">
                {member.nome.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                {member.nome}
              </h1>
              <p className="text-sm sm:text-base opacity-60 mt-1 truncate">
                {member.email}
              </p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${
                  member.status === "ativo"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm opacity-60 mb-1">{getMatriculaLabel()}</p>
              <p className="text-lg font-semibold">{member.matricula}</p>
            </div>

            <div>
              <p className="text-sm opacity-60 mb-1">Curso</p>
              <p className="text-lg font-semibold">{member.curso}</p>
            </div>

            <div>
              <p className="text-sm opacity-60 mb-1">Equipe</p>
              <p className="text-lg font-semibold">
                {getTeamName(member.equipe)}
              </p>
            </div>

            <div>
              <p className="text-sm opacity-60 mb-1">Cargo</p>
              <p className="text-lg font-semibold">{member.cargo}</p>
            </div>

            <div>
              <p className="text-sm opacity-60 mb-1">Data de Início</p>
              <p className="text-lg font-semibold">
                {new Date(member.dataInicio).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Dados de Acesso - Apenas para Admin e Líder */}
        {(can("canEditMember") || can("canDeleteMember")) && (
          <div className="bg-white rounded-xl shadow-md p-6 border">
            <h2 className="text-xl font-bold mb-4">
              Dados de Acesso ao Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm opacity-60 mb-1">Email de Login</p>
                <p className="text-lg font-semibold">{member.email}</p>
              </div>

              <div>
                <p className="text-sm opacity-60 mb-1">Perfil de Acesso</p>
                <p className="text-lg font-semibold">
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : member.role === "lider"
                        ? "bg-blue-100 text-blue-800"
                        : member.role === "professor"
                        ? "bg-green-100 text-green-800"
                        : member.role === "diretor"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {member.role === "admin" && "Administrador"}
                    {member.role === "lider" && "Líder de Equipe"}
                    {member.role === "professor" && "Professor Orientador"}
                    {member.role === "diretor" && "Diretor Financeiro"}
                    {member.role === "membro" && "Membro"}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm opacity-60 mb-1">Conta Criada em</p>
                <p className="text-lg font-semibold">
                  {new Date(member.dataCriacao).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div>
                <p className="text-sm opacity-60 mb-1">Status da Conta</p>
                <p className="text-lg font-semibold">
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full ${
                      member.status === "ativo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {member.status === "ativo" ? "Ativa" : "Inativa"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MemberDetailPage;
