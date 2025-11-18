import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getTeams, deleteTeam } from "../../../services/teamService";
import { useAuth } from "../../../context/AuthContext";
import type { Team } from "../../../types/admin";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "../../../components/ui/PageHeaderComponent";
import { usePermissions } from "../../../hooks/usePermissions";

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { can } = usePermissions();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams(user?.role, user?.equipe);
        setTeams(data);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
      }
    };
    fetchTeams();
  }, [user]);

  const handleDelete = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a equipe ${nome}?`)) {
      try {
        await deleteTeam(id.toString());
        const data = await getTeams(user?.role, user?.equipe);
        setTeams(data);
      } catch (error) {
        console.error("Erro ao excluir equipe:", error);
      }
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verifica se o usuário pode ver os detalhes da equipe
  const canViewTeamDetails = (teamId: number) => {
    // Admin pode ver qualquer equipe
    if (user?.role === "admin") return true;
    // Líder/Membro só pode ver sua própria equipe
    return user?.equipe === teamId.toString();
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Equipes de Competição"
          description="Gerencie as equipes do projeto"
        >
          {can("canCreateTeam") && (
            <Link
              to="/admin/teams/new"
              className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              Nova Equipe
            </Link>
          )}
        </PageHeader>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                    {team.nome}
                  </h3>
                  <span
                    className="text-xs sm:text-sm opacity-60"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      width: '100%',
                    }}
                  >
                    {team.descricao}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t mt-4">
                {canViewTeamDetails(team.id) ? (
                  <Link
                    to={`/admin/teams/${team.id}`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Ver Detalhes
                  </Link>
                ) : (
                  <button
                    disabled
                    className="btn btn-primary btn-sm flex-1 opacity-50 cursor-not-allowed"
                    title="Você só pode ver detalhes da sua própria equipe"
                  >
                    Ver Detalhes
                  </button>
                )}
                {can("canEditTeam") && (
                  <Link
                    to={`/admin/teams/${team.id}/edit`}
                    className="btn btn-ghost btn-sm"
                  >
                    <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                )}
                {can("canDeleteTeam") && (
                  <button
                    onClick={() => handleDelete(team.id, team.nome)}
                    className="btn btn-error btn-sm"
                  >
                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-sm sm:text-base opacity-60">
              Nenhuma equipe encontrada
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminTeamsPage;
