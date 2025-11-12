import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getMembers, deleteMember } from "../../../services/memberService";
import { getTeams } from "../../../services/teamService";
import type { Member } from "../../../types/member";
import type { Team } from "../../../types/admin";
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEquipe, setFilterEquipe] = useState("");
  const { can } = usePermissions();
  const { user } = useAuth();

  // Função para obter o nome da equipe pelo ID
  const getTeamName = (equipeId: string | undefined) => {
    if (!equipeId) return "Sem equipe";
    const team = teams.find((t) => t.id.toString() === equipeId);
    return team ? team.nome : equipeId;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsData = await getTeams(user?.role, user?.equipe);
        setTeams(teamsData);

        // Se for líder ou membro, passa o equipeId para buscar apenas da sua equipe
        const userEquipeId = user?.equipe ? parseInt(user.equipe) : undefined;
        const membersData = await getMembers(userEquipeId);

        setMembers(membersData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados");
      }
    };
    fetchData();
  }, [user]);

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      try {
        await deleteMember(id);
        // Recarrega com o equipeId correto
        const userEquipeId = user?.equipe ? parseInt(user.equipe) : undefined;
        const data = await getMembers(userEquipeId);
        setMembers(data);
        alert("Membro excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir membro:", error);
        alert("Erro ao excluir membro");
      }
    }
  };

  const filteredMembers = members.filter((member) => {
    if (member.status === "inativo") {
      return false;
    }

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

  // Lista de equipes únicas para o filtro, mostrando nome ao invés do ID
  const equipesOptions = Array.from(
    new Set(members.map((m) => m.equipe).filter(Boolean))
  ).map((equipeId) => {
    const team = teams.find((t) => t.id.toString() === equipeId);
    return {
      value: equipeId,
      label: team ? team.nome : equipeId,
    };
  });

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Membros das Equipes"
          description="Cadastro de alunos participantes dos projetos"
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
              options={equipesOptions}
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
                        <StatusBadge status={member.status} />
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
                      value={getTeamName(member.equipe)}
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

            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>Matrícula</TableHeadCell>
                  <TableHeadCell>Equipe</TableHeadCell>
                  <TableHeadCell>Cargo</TableHeadCell>
                  <TableHeadCell className="text-center">Ações</TableHeadCell>
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
                      <TableCell>{getTeamName(member.equipe)}</TableCell>
                      <TableCell>{member.cargo}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
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
