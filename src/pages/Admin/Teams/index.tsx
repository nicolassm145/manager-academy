import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getTeams, deleteTeam } from "../../../services/teamService";
import type { Team } from "../../../types/admin";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { usePermissions } from "../../../hooks/usePermissions";

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { can } = usePermissions();

  useEffect(() => {
    setTeams(getTeams());
  }, []);

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a equipe ${nome}?`)) {
      deleteTeam(id);
      setTeams(getTeams());
      alert("Equipe excluída com sucesso!");
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Equipes de Competição
            </h1>
            <p className="text-sm sm:text-base opacity-60 mt-1">
              Gerencie as equipes do projeto (Baja, Fórmula SAE, Aerodesign,
              etc)
            </p>
          </div>
          {can("canCreateTeam") && (
            <Link
              to="/admin/teams/new"
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Nova Equipe
            </Link>
          )}
        </div>

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
                  <p className="text-xs sm:text-sm opacity-60">
                    {team.descricao}
                  </p>
                </div>
                <span
                  className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                    team.status === "ativa"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {team.status}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t mt-4">
                <Link
                  to={`/admin/teams/${team.id}`}
                  className="btn btn-primary btn-sm flex-1"
                >
                  Ver Detalhes
                </Link>
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
