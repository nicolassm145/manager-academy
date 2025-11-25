import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/layout/LayoutComponent";
import { Card, BackButton, DetailSection, DetailItem, DetailGrid, EmptyState, StatusBadge } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { Feedback } from "../../../components/ui/FeedbackComponent";
import { fetchCalendarEvents, deleteCalendarEvent } from "../../../services/googleCalendarService";
import { listarParticipantes, atualizarParticipante } from "../../../services/eventoService";
import { listarTarefas, atualizarTarefa, type Tarefa } from "../../../services/tarefaService";
import { getEquipeMembros } from "../../../services/equipeService";
import { PencilIcon, TrashIcon, CalendarIcon, ClockIcon, UserGroupIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

const CalendarDetailsPage = () => {
  const [membrosEquipe, setMembrosEquipe] = useState<any[]>([]);
  const [showParticipar, setShowParticipar] = useState(false);
  const [participarStatus, setParticiparStatus] = useState<"pendente" | "confirmado" | "recusado">("confirmado");
  const [participarObs, setParticiparObs] = useState("");
  const [participarLoading, setParticiparLoading] = useState(false);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(true);
  const [participanteAtualId, setParticipanteAtualId] = useState<number | null>(null);

  // Estados para tarefas
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loadingTarefas, setLoadingTarefas] = useState(true);

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  useEffect(() => {
    loadEvent();
  }, [id, user?.equipe]);

  type CalendarEventsResponse = any[] | { eventos: any[] };

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: CalendarEventsResponse = await fetchCalendarEvents(user?.equipe);
      let eventsArray: any[] = [];
      if (Array.isArray(data)) {
        eventsArray = data;
      } else if (data && Array.isArray((data as any).eventos)) {
        eventsArray = (data as any).eventos;
      }
      const foundEvent = eventsArray.find((ev: any) => ev.id === id);
      setEvent(foundEvent || null);

      if (foundEvent && foundEvent.id) {
        await loadParticipantes(foundEvent.id);
        await loadTarefas(foundEvent.id);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar evento");
    } finally {
      setLoading(false);
    }
  };

  const loadParticipantes = async (eventoId: string) => {
    setLoadingParticipantes(true);
    try {
      const lista = await listarParticipantes(eventoId);
      setParticipantes(Array.isArray(lista) ? lista : []);

      if (user?.equipe) {
        try {
          const membros = await getEquipeMembros(user.equipe);
          setMembrosEquipe(Array.isArray(membros) ? membros : []);
        } catch {}
      }
    } catch (err) {
      setParticipantes([]);
    } finally {
      setLoadingParticipantes(false);
    }
  };

  const loadTarefas = async (eventoId: string) => {
    setLoadingTarefas(true);
    try {
      const lista = await listarTarefas(eventoId);
      setTarefas(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setTarefas([]);
    } finally {
      setLoadingTarefas(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCalendarEvent(id!);
      setFeedback({
        type: "success",
        message: "Evento excluído com sucesso!",
      });
      setShowDeleteModal(false);
      setTimeout(() => navigate("/calendar"), 1200);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao deletar evento",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleParticipar = async () => {
    if (!participanteAtualId) {
      setFeedback({
        type: "error",
        message: "Erro ao identificar participação",
      });
      return;
    }

    setParticiparLoading(true);
    setFeedback(null);
    try {
      // ATUALIZA o participante existente ao invés de criar novo
      await atualizarParticipante(participanteAtualId, {
        membroId: parseInt(user?.id || "0"),
        status: participarStatus,
        observacao: participarObs,
      });
      setShowParticipar(false);
      setParticiparObs("");
      setParticiparStatus("confirmado");
      setParticipanteAtualId(null);
      setFeedback({
        type: "success",
        message: "Participação atualizada com sucesso!",
      });
      await loadParticipantes(event.id);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao atualizar participação",
      });
    } finally {
      setParticiparLoading(false);
    }
  };

  const handleToggleTarefa = async (tarefaId: number, concluido: boolean) => {
    try {
      await atualizarTarefa(tarefaId, { concluido });
      setFeedback({
        type: "success",
        message: concluido ? "Tarefa concluída!" : "Tarefa reaberta",
      });
      await loadTarefas(event.id);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao atualizar tarefa",
      });
    }
  };

  const handleEditarTarefaDescricao = async (tarefaId: number, novaDescricao: string) => {
    try {
      await atualizarTarefa(tarefaId, { descricao: novaDescricao });
      setFeedback({
        type: "success",
        message: "Tarefa atualizada com sucesso!",
      });
      await loadTarefas(event.id);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao atualizar tarefa",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  };

  const getStatusBadgeType = (status: string) => {
    switch (status) {
      case "confirmado":
        return "success";
      case "recusado":
        return "danger";
      case "pendente":
        return "warning";
      default:
        return "default";
    }
  };

  const getMemberName = (membroId: number) => {
    const membro = membrosEquipe.find((m) => m.id === membroId);
    return membro ? membro.nomeCompleto : `ID: ${membroId}`;
  };

  const userParticipante = participantes.find((p) => p.membroId === parseInt(user?.id || "0"));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 opacity-60">Carregando evento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="space-y-6">
          <BackButton to="/calendar" />
          <Card>
            <div className="text-center py-12">
              <p className="text-red-500">{error || "Evento não encontrado"}</p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {feedback && <Feedback type={feedback.type} message={feedback.message} />}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <BackButton to="/calendar" />

          <div className="flex gap-2">
            {user?.role === "lider" && (
              <>
                <button onClick={() => navigate(`/calendar/edit/${event.id}`)} className="btn btn-primary gap-2 flex-1 sm:flex-initial">
                  <PencilIcon className="w-4 h-4" />
                  Editar
                </button>
                <button className="btn btn-error" onClick={() => setShowDeleteModal(true)} disabled={deleting}>
                  <TrashIcon className="w-4 h-4" />
                  Excluir Evento
                </button>
              </>
            )}
          </div>
        </div>

        {/* Card Principal */}
        <Card padding="large">
          {/* Cabeçalho do Evento */}
          <div className="mb-8 pb-6 border-b">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{event.titulo}</h1>
                {event.descricao && <p className="text-base sm:text-lg text-gray-600">{event.descricao}</p>}
              </div>
            </div>
          </div>

          {/* Informações do Evento */}
          <DetailSection title="Detalhes do Evento">
            <DetailGrid columns={2}>
              <DetailItem
                label="Data de Início"
                value={
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">{formatDate(event.start?.dateTime || "")}</span>
                  </div>
                }
              />

              <DetailItem
                label="Horário de Início"
                value={
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">{formatTime(event.start?.dateTime || "")}</span>
                  </div>
                }
              />

              <DetailItem
                label="Data de Término"
                value={
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">{formatDate(event.end?.dateTime || "")}</span>
                  </div>
                }
              />

              <DetailItem
                label="Horário de Término"
                value={
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">{formatTime(event.end?.dateTime || "")}</span>
                  </div>
                }
              />

              <DetailItem
                label="Duração"
                value={<span className="font-semibold text-purple-600">{getDuration(event.start?.dateTime || "", event.end?.dateTime || "")}</span>}
              />
            </DetailGrid>
          </DetailSection>

          {/* Link do Google Calendar */}
          {event.googleEventId && (
            <div className="mt-6 pt-6 border-t">
              <a
                href={`https://calendar.google.com/calendar/event?eid=${event.googleEventId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                Ver no Google Calendar
              </a>
            </div>
          )}
        </Card>

        {/* Card de Participantes */}
        <Card>
          <DetailSection>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">Participantes</h2>
              </div>
            </div>

            {loadingParticipantes ? (
              <div className="py-8 text-center text-gray-400">
                <div className="loading loading-spinner loading-md mx-auto mb-2"></div>
                <p>Carregando participantes...</p>
              </div>
            ) : participantes.length === 0 ? (
              <EmptyState icon={UserGroupIcon} title="Nenhum participante ainda" description="Aguardando confirmação de presença" />
            ) : (
              <div className="space-y-3">
                {participantes.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-blue-600">{getMemberName(p.membroId).charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{getMemberName(p.membroId)}</p>
                        {p.observacao && <p className="text-xs text-gray-500 truncate">{p.observacao}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} type={getStatusBadgeType(p.status)} />

                      {/* Botão para editar própria participação */}
                      {p.membroId === parseInt(user?.id || "0") && (
                        <button
                          onClick={() => {
                            setShowParticipar(true);
                            setParticipanteAtualId(p.id);
                            setParticiparStatus(p.status);
                            setParticiparObs(p.observacao || "");
                          }}
                          className="btn btn-ghost btn-xs"
                          title="Editar participação"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </Card>

        {/* Card de Tarefas */}
        <Card>
          <DetailSection>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold">Tarefas do Evento</h2>
              </div>
            </div>

            {loadingTarefas ? (
              <div className="py-8 text-center text-gray-400">
                <div className="loading loading-spinner loading-md mx-auto mb-2"></div>
                <p>Carregando tarefas...</p>
              </div>
            ) : tarefas.length === 0 ? (
              <EmptyState icon={ClipboardDocumentListIcon} title="Nenhuma tarefa criada" description="Não há tarefas associadas a este evento" />
            ) : (
              <div className="space-y-3">
                {tarefas.map((tarefa) => {
                  const podeMarcar = user?.role === "lider" || tarefa.membroId === parseInt(user?.id || "0");

                  return (
                    <div
                      key={tarefa.id}
                      className={`flex items-start gap-3 p-4 border rounded-lg transition-colors ${
                        tarefa.concluido ? "bg-gray-50 opacity-75" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={tarefa.concluido}
                        onChange={(e) => handleToggleTarefa(tarefa.id, e.target.checked)}
                        disabled={!podeMarcar}
                        className={`checkbox checkbox-primary mt-1 flex-shrink-0 ${!podeMarcar ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={podeMarcar ? "Marcar como concluída/não concluída" : "Apenas o responsável ou líder pode marcar"}
                      />

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${tarefa.concluido ? "line-through text-gray-500" : ""}`}>{tarefa.descricao}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-purple-600">{getMemberName(tarefa.membroId).charAt(0)}</span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{getMemberName(tarefa.membroId)}</p>
                        </div>
                      </div>

                      {/* Ações */}
                      {user?.role === "lider" && (
                        <button
                          onClick={() => {
                            const novaDescricao = prompt("Editar descrição:", tarefa.descricao);
                            if (novaDescricao && novaDescricao.trim()) {
                              handleEditarTarefaDescricao(tarefa.id, novaDescricao);
                            }
                          }}
                          className="btn btn-ghost btn-xs"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </DetailSection>
        </Card>
      </div>

      {/* Modal de Participação */}
      {showParticipar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Atualizar Participação</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  value={participarStatus}
                  onChange={(e) => setParticiparStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                  <option value="recusado">Não vou participar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observação (opcional)</label>
                <textarea
                  value={participarObs}
                  onChange={(e) => setParticiparObs(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Adicione uma observação..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleParticipar} disabled={participarLoading} className="btn btn-primary flex-1">
                {participarLoading ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => {
                  setShowParticipar(false);
                  setParticiparObs("");
                  setParticiparStatus("confirmado");
                  setParticipanteAtualId(null);
                }}
                disabled={participarLoading}
                className="btn btn-ghost flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 btn btn-ghost btn-sm" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Confirmar exclusão</h2>
            <p className="mb-4">Tem certeza que deseja excluir este evento?</p>
            <button className="btn btn-error w-full" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CalendarDetailsPage;
