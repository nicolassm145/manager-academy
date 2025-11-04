import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getTeams } from "../../../services/teamService";
import type { Team } from "../../../types/admin";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTeams(getTeams());
  }, []);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Equipes de Competição
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gerencie as equipes do projeto (Baja, Fórmula SAE, Aerodesign,
              etc)
            </p>
          </div>
          <Link
            to="/admin/teams/new"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Equipe
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {team.nome}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
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

              <div className="text-xs text-gray-500 mb-3 sm:mb-4">
                Criada em{" "}
                {new Date(team.dataCriacao).toLocaleDateString("pt-BR")}
              </div>

              <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t">
                <Link
                  to={`/admin/teams/${team.id}`}
                  className="flex-1 text-center px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 border border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Ver Detalhes
                </Link>
                <Link
                  to={`/admin/teams/${team.id}/edit`}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900"
                >
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <button className="px-2 sm:px-3 py-1.5 sm:py-2 text-red-600 hover:text-red-900">
                  <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-sm sm:text-base text-gray-500">
              Nenhuma equipe encontrada
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminTeamsPage;
