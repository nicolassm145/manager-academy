import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import {
  getTeamById,
  deleteTeam,
  getTeamMembers,
} from "../../../services/teamService";
import { useAuth } from "../../../context/AuthContext";
import type { Team } from "../../../types/admin";
import type { Member } from "../../../types/member";
import {
  PencilIcon,
  TrashIcon,
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  BackButton,
  Card,
  StatCard,
  EmptyState,
  DetailSection,
} from "../../../components/ui";

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | undefined>(undefined);
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário é da equipe atual
  const isUserTeam = user?.equipe === id;

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const teamData = await getTeamById(id);
          setTeam(teamData);

          // Busca membros se:
          // 1. For admin (vê todos)
          // 2. OU se for a própria equipe do usuário (líder/membro vê sua equipe)
          const canSeeMbers = user?.role === "admin" || isUserTeam;

          if (teamData && canSeeMbers) {
            const members = await getTeamMembers(id);
            setTeamMembers(members);
          }
        } catch (error) {
          console.error("Erro ao carregar equipe:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [id, user?.role, user?.equipe, isUserTeam]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="opacity-60">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!team) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="opacity-60">Equipe não encontrada</p>
          <Link to="/admin/teams" className="btn btn-link mt-4">
            Voltar para listagem
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDelete = async () => {
    if (id && confirm("Tem certeza que deseja excluir esta equipe?")) {
      try {
        await deleteTeam(id);
        alert("Equipe excluída com sucesso!");
        navigate("/admin/teams");
      } catch (error) {
        console.error("Erro ao excluir equipe:", error);
        alert("Erro ao excluir equipe");
      }
    }
  };

  const teamLeader = teamMembers.find((m) => m.role === "lider");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <BackButton to="/admin/teams" />
          {/* Só mostra botões de editar/excluir para Admin */}
          {user?.role === "admin" && (
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                to={`/admin/teams/${id}/edit`}
                className="btn btn-primary flex-1 sm:flex-initial flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Editar</span>
              </Link>
              <button
                onClick={handleDelete}
                className="btn btn-error flex-1 sm:flex-initial flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            </div>
          )}
        </div>

        <Card padding="large">
          <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  {team.nome}
                </h1>
                <p className="text-sm sm:text-base opacity-60">
                  {team.descricao}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Mostra estatísticas de membros se for admin OU a própria equipe */}
            {(user?.role === "admin" || isUserTeam) && (
              <>
                <StatCard
                  label="Total de Membros"
                  value={teamMembers.length}
                  icon={UserGroupIcon}
                  color="blue"
                />
                <StatCard
                  label="Usuários no Sistema"
                  value={teamMembers.length}
                  icon={UsersIcon}
                  color="green"
                />
              </>
            )}
            <StatCard
              label="Data de Criação"
              value={
                team.criadoEm
                  ? new Date(team.criadoEm).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Não informada"
              }
              icon={CalendarIcon}
              color="purple"
            />
          </div>

          {teamLeader && (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <p className="text-sm sm:text-base font-medium mb-3">
                Líder da Equipe
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-base-200 flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-sm sm:text-base">
                    {teamLeader.nome.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {teamLeader.nome}
                  </p>
                  <p className="text-xs sm:text-sm opacity-60 truncate">
                    {teamLeader.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Card de membros: Apenas para admin OU para a própria equipe */}
        {(user?.role === "admin" || isUserTeam) && (
          <Card>
            <DetailSection title="Membros da Equipe">
              {teamMembers.length > 0 ? (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {member.nome}
                        </p>
                        <p className="text-xs sm:text-sm opacity-60 truncate">
                          {member.cargo} • {member.curso}
                        </p>
                      </div>
                      {/* Botão Ver perfil: Admin vê todos, Líder só da sua equipe */}
                      {(user?.role === "admin" || isUserTeam) && (
                        <Link
                          to={`/members/${member.id}`}
                          className="btn btn-link btn-sm"
                        >
                          Ver perfil →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nenhum membro cadastrado"
                  description="Esta equipe ainda não possui membros cadastrados."
                />
              )}
            </DetailSection>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TeamDetailPage;
