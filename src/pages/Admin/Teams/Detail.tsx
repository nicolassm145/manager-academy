import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getTeamById, deleteTeam } from "../../../services/teamService";
import { getUsers } from "../../../services/userService";
import { getMembers } from "../../../services/memberService";
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
  StatusBadge,
  StatCard,
  EmptyState,
  DetailSection,
} from "../../../components/ui";

const TeamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const team = id ? getTeamById(id) : undefined;

  if (!team) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="opacity-60">Equipe não encontrada</p>
          <Link
            to="/admin/teams"
            className="btn btn-link mt-4"
          >
            Voltar para listagem
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (id && confirm("Tem certeza que deseja excluir esta equipe?")) {
      deleteTeam(id);
      alert("Equipe excluída com sucesso!");
      navigate("/admin/teams");
    }
  };

  // Estatísticas da equipe
  const allMembers = getMembers();
  const allUsers = getUsers();
  const teamMembers = team
    ? allMembers.filter((m) => m.equipe === team.nome)
    : [];
  const teamUsers = team ? allUsers.filter((u) => u.equipe === team.nome) : [];
  const teamLeader = teamUsers.find((u) => u.role === "lider");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <BackButton to="/admin/teams" />
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
              <StatusBadge status={team.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              label="Total de Membros"
              value={teamMembers.length}
              icon={UserGroupIcon}
              color="blue"
            />
            <StatCard
              label="Usuários no Sistema"
              value={teamUsers.length}
              icon={UsersIcon}
              color="green"
            />
            <StatCard
              label="Data de Criação"
              value={new Date(team.dataCriacao).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
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
                    <Link
                      to={`/members/${member.id}`}
                      className="btn btn-link btn-sm"
                    >
                      Ver perfil →
                    </Link>
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
      </div>
    </Layout>
  );
};

export default TeamDetailPage;
