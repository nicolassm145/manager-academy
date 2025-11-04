import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "../../components/LayoutComponent";
import { getMemberById, deleteMember } from "../../services/memberService";
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const MemberDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = id ? getMemberById(id) : undefined;

  if (!member) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="opacity-60">Membro não encontrado</p>
          <Link to="/members" className="btn btn-link mt-4">
            Voltar para listagem
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (id && confirm("Tem certeza que deseja excluir este membro?")) {
      deleteMember(id);
      alert("Membro excluído com sucesso!");
      navigate("/members");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate("/members")}
            className="btn btn-ghost flex items-center gap-2 self-start"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Voltar
          </button>
          <div className="flex gap-2 sm:gap-3">
            <Link
              to={`/members/${id}/edit`}
              className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-error flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Excluir
            </button>
          </div>
        </div>

        {/* Card do Membro */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border">
          {/* Header do Card */}
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

          {/* Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm opacity-60 mb-1">Matrícula</p>
              <p className="text-lg font-semibold">{member.matricula}</p>
            </div>

            <div>
              <p className="text-sm opacity-60 mb-1">Curso</p>
              <p className="text-lg font-semibold">{member.curso}</p>
            </div>

            <div>
              <p className="text-sm opacity-60 mb-1">Equipe</p>
              <p className="text-lg font-semibold">{member.equipe}</p>
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

        {/* Histórico (mockado) */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-bold mb-4">Histórico de Mudanças</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div>
                <p className="text-sm font-medium">
                  Cadastro inicial - {member.equipe}
                </p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(member.dataInicio).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="text-center text-sm opacity-60 py-4">
              Nenhuma mudança de equipe registrada
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemberDetailPage;
