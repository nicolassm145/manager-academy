import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getUsers, deleteUser } from "../../../services/userService";
import { getMembers } from "../../../services/memberService";
import type { SystemUser } from "../../../types/admin";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { usePermissions } from "../../../hooks/usePermissions";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const { can } = usePermissions();

  useEffect(() => {
    setUsers(getUsers());
    setMembers(getMembers());
  }, []);

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) {
      deleteUser(id);
      setUsers(getUsers());
      alert("Usuário excluído com sucesso!");
    }
  };

  // Filtros
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !filterRole || user.role === filterRole;
    return matchSearch && matchRole;
  });

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      lider: "Líder de Equipe",
      professor: "Professor Orientador",
      diretor: "Diretor Financeiro",
      membro: "Membro",
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      lider: "bg-blue-100 text-blue-800",
      professor: "bg-green-100 text-green-800",
      diretor: "bg-yellow-100 text-yellow-800",
      membro: "bg-gray-100 text-gray-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Usuários do Sistema (Login)
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gerencie contas de acesso, permissões e credenciais de login
            </p>
          </div>
          {can("canCreateUser") && (
            <Link
              to="/admin/users/new"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Novo Usuário
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Busca */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os Perfis</option>
              <option value="admin">Administrador</option>
              <option value="lider">Líder de Equipe</option>
              <option value="professor">Professor Orientador</option>
              <option value="diretor">Diretor Financeiro</option>
              <option value="membro">Membro</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Mobile Cards */}
          <div className="block lg:hidden divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.nome.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      {user.nome}
                    </p>
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      {user.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleName(user.role)}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          user.status === "ativo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    {user.equipe && (
                      <p className="text-xs text-gray-600 mb-2">
                        <span className="text-gray-500">Equipe:</span>
                        <span className="ml-1 font-medium">{user.equipe}</span>
                      </p>
                    )}
                    {user.membroVinculadoId && (
                      <p className="text-xs text-blue-600 mb-3 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        Vinculado a{" "}
                        {members.find((m) => m.id === user.membroVinculadoId)
                          ?.nome || "Membro"}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="flex-1 text-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100"
                      >
                        Ver Detalhes
                      </Link>
                      {can("canEditUser") && (
                        <Link
                          to={`/admin/users/${user.id}/edit`}
                          className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                      )}
                      {can("canDeleteUser") && (
                        <button
                          onClick={() => handleDelete(user.id, user.nome)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">
                            {user.nome.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.equipe || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "ativo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </Link>
                        {can("canEditUser") && (
                          <Link
                            to={`/admin/users/${user.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                        )}
                        {can("canDeleteUser") && (
                          <button
                            onClick={() => handleDelete(user.id, user.nome)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm sm:text-base text-gray-500">
                Nenhum usuário encontrado
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsersPage;
