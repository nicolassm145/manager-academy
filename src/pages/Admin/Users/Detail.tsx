import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getUserById, deleteUser } from "../../../services/userService";
import { getMemberById } from "../../../services/memberService";
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = id ? getUserById(id) : undefined;
  const membroVinculado = user?.membroVinculadoId
    ? getMemberById(user.membroVinculadoId)
    : null;

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Usuário não encontrado</p>
          <Link
            to="/admin/users"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Voltar para listagem
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (id && confirm("Tem certeza que deseja excluir este usuário?")) {
      deleteUser(id);
      alert("Usuário excluído com sucesso!");
      navigate("/admin/users");
    }
  };

  const handleResetPassword = () => {
    if (confirm("Enviar email de redefinição de senha?")) {
      alert("Email enviado com sucesso!");
    }
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      lider: "Líder de Equipe",
      professor: "Professor Orientador",
      diretor: "Diretor Financeiro",
      membro: "Membro",
    };
    return roles[role];
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      lider: "bg-blue-100 text-blue-800",
      professor: "bg-green-100 text-green-800",
      diretor: "bg-yellow-100 text-yellow-800",
      membro: "bg-gray-100 text-gray-800",
    };
    return colors[role];
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleResetPassword}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              <KeyIcon className="w-5 h-5" />
              Resetar Senha
            </button>
            <Link
              to={`/admin/users/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
              Excluir
            </button>
          </div>
        </div>

        {/* Card do Usuário */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <div className="flex items-center mb-8 pb-6 border-b">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mr-6">
              <span className="text-3xl text-blue-600 font-bold">
                {user.nome.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.nome}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleName(user.role)}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    user.status === "ativo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Perfil de Acesso</p>
              <p className="text-lg font-semibold text-gray-900">
                {getRoleName(user.role)}
              </p>
            </div>

            {user.equipe && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Equipe</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.equipe}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-1">Data de Criação</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(user.dataCriacao).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.status}
              </p>
            </div>

            {membroVinculado && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Membro Vinculado</p>
                <div className="flex items-center gap-3 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {membroVinculado.nome.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {membroVinculado.nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      {membroVinculado.matricula} - {membroVinculado.cargo}
                    </p>
                  </div>
                  <Link
                    to={`/members/${membroVinculado.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver Perfil →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Permissões */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Permissões do Perfil
          </h2>
          <div className="space-y-3">
            {user.role === "admin" && (
              <>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Gerenciar usuários e
                  equipes
                </div>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Acesso total ao sistema
                </div>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Configurações globais
                </div>
              </>
            )}
            {user.role === "lider" && (
              <>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Gerenciar membros da
                  equipe {user.equipe}
                </div>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Gerenciar inventário da
                  equipe
                </div>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Registrar transações
                  financeiras
                </div>
              </>
            )}
            {user.role === "professor" && (
              <>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Consultar dados de todas
                  as equipes
                </div>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Cadastrar e editar
                  membros
                </div>
              </>
            )}
            {user.role === "diretor" && (
              <>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Registrar transações
                  financeiras
                </div>
                <div className="flex items-center gap-3 text-sm text-green-600">
                  <span className="font-bold">✓</span> Visualizar extratos e
                  relatórios
                </div>
              </>
            )}
            {user.role === "membro" && (
              <>
                <div className="flex items-center gap-3 text-sm text-blue-600">
                  <span className="font-bold">✓</span> Consultar membros da
                  equipe {user.equipe}
                </div>
                <div className="flex items-center gap-3 text-sm text-blue-600">
                  <span className="font-bold">✓</span> Consultar inventário
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetailPage;
