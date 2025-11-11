import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getMembers, deleteMember } from "../../../services/memberService";
import type { Member } from "../../../types/member";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { usePermissions } from "../../../hooks/usePermissions";
import { useAuth } from "../../../context/AuthContext";
import {
  PageHeader,
  SearchBar,
  FilterSelect,
  Card,
  StatusBadge,
  EmptyState,
  Table,
  TableHeader,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  MobileCard,
  MobileCardItem,
  MobileCardActions,
} from "../../../components/ui";

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEquipe, setFilterEquipe] = useState("");
  const { can } = usePermissions();
  const { user } = useAuth();

  // Função helper para exibir o nome do role
  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: "Admin",
      lider: "Líder",
      professor: "Professor",
      diretor: "Diretor",
      membro: "Membro",
    };
    return roleNames[role] || role;
  };

  // Função helper para cor do badge de role
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

  // Carrega membros da API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getMembers();
        setMembers(data);
      } catch (error) {
        console.error("Erro ao carregar membros:", error);
        alert("Erro ao carregar membros");
      }
    };
    fetchMembers();
  }, []);

  // Função para deletar membro
  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      try {
        await deleteMember(id);
        const data = await getMembers();
        setMembers(data);
        alert("Membro excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir membro:", error);
        alert("Erro ao excluir membro");
      }
    }
  };

  // Filtros (incluindo filtro de equipe para líder)
  const filteredMembers = members.filter((member) => {
    // Se for líder, só mostra membros da sua equipe
    if (
      user?.role === "lider" &&
      user?.equipe &&
      member.equipe !== user.equipe
    ) {
      return false;
    }

    const matchSearch =
      member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.matricula.includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEquipe = !filterEquipe || member.equipe === filterEquipe;
    return matchSearch && matchEquipe;
  });

  // Lista de equipes únicas
  const equipes = Array.from(new Set(members.map((m) => m.equipe)));

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Membros das Equipes"
          description="Cadastro de alunos participantes dos projetos (não precisam ter acesso ao sistema)"
          actionButton={
            can("canCreateMember")
              ? {
                  label: "Novo Membro",
                  to: "/members/new",
                  icon: PlusIcon,
                }
              : undefined
          }
        />

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nome, matrícula ou email..."
            />
            <FilterSelect
              value={filterEquipe}
              onChange={setFilterEquipe}
              options={equipes.map((e) => ({ value: e, label: e }))}
              placeholder="Todas as Equipes"
            />
          </div>
        </Card>

        {filteredMembers.length === 0 ? (
          <Card>
            <EmptyState
              title="Nenhum membro encontrado"
              description="Não há membros cadastrados ou nenhum corresponde aos filtros aplicados."
            />
          </Card>
        ) : (
          <>
            {/* Mobile Cards (visível só em mobile) */}
            <div className="block lg:hidden space-y-3">
              {filteredMembers.map((member) => (
                <MobileCard key={member.id}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-sm">
                        {member.nome.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{member.nome}</p>
                        <div className="flex gap-1">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColor(
                              member.role
                            )}`}
                          >
                            {getRoleName(member.role)}
                          </span>
                          <StatusBadge status={member.status} />
                        </div>
                      </div>
                      <p className="text-xs opacity-60 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MobileCardItem
                      label="Matrícula"
                      value={member.matricula}
                    />
                    <MobileCardItem label="Cargo" value={member.cargo} />
                    <MobileCardItem
                      label="Equipe"
                      value={member.equipe}
                      fullWidth
                    />
                  </div>
                  <MobileCardActions>
                    <Link
                      to={`/members/${member.id}`}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Ver Detalhes
                    </Link>
                    {can("canEditMember") && (
                      <Link
                        to={`/members/${member.id}/edit`}
                        className="btn btn-ghost btn-sm"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                    )}
                    {can("canDeleteMember") && (
                      <button
                        onClick={() => handleDelete(member.id, member.nome)}
                        className="btn btn-error btn-sm"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </MobileCardActions>
                </MobileCard>
              ))}
            </div>

            {/* Tabela Desktop (oculta em mobile) */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>Matrícula</TableHeadCell>
                  <TableHeadCell>Equipe</TableHeadCell>
                  <TableHeadCell>Cargo</TableHeadCell>
                  <TableHeadCell>Perfil</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell className="text-right">Ações</TableHeadCell>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="font-semibold">
                              {member.nome.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {member.nome}
                            </div>
                            <div className="opacity-60 truncate">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.matricula}</TableCell>
                      <TableCell>{member.equipe}</TableCell>
                      <TableCell>{member.cargo}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                            member.role
                          )}`}
                        >
                          {getRoleName(member.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={member.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/members/${member.id}`}
                            className="btn btn-primary btn-xs"
                          >
                            Ver
                          </Link>
                          {can("canEditMember") && (
                            <Link
                              to={`/members/${member.id}/edit`}
                              className="btn btn-ghost btn-xs"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                          )}
                          {can("canDeleteMember") && (
                            <button
                              onClick={() =>
                                handleDelete(member.id, member.nome)
                              }
                              className="btn btn-error btn-xs"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MembersPage;
