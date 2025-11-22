import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import {
  Card,
  BackButton,
  DetailSection,
  DetailItem,
  DetailGrid,
} from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchCalendarEvents,
  deleteCalendarEvent,
} from "../../../services/googleCalendarService";
import {
  listarParticipantes,
  participarEvento,
} from "../../../services/eventoService";
import { getEquipeMembros } from "../../../services/equipeService";
import {
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const CalendarDetailsPage = () => {
  const [membrosEquipe, setMembrosEquipe] = useState<any[]>([]);
  const [showParticipar, setShowParticipar] = useState(false);
  const [participarStatus, setParticiparStatus] = useState<
    "pendente" | "confirmado" | "recusado"
  >("confirmado");
  const [participarObs, setParticiparObs] = useState("");
  const [participarLoading, setParticiparLoading] = useState(false);
  const [participarFeedback, setParticiparFeedback] = useState<string | null>(
    null
  );
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id, user?.equipe]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCalendarEvents(user?.equipe);
      // Backend retorna { eventos: Array } ou objeto
      let eventsArray: any[] = [];
      if (Array.isArray(data)) {
        eventsArray = data;
      } else if (Array.isArray(data?.eventos)) {
        eventsArray = data.eventos;
      }
      const foundEvent = eventsArray.find((ev: any) => ev.id === id);
      setEvent(foundEvent || null);
      // Carrega participantes se evento encontrado
      if (foundEvent && foundEvent.id) {
        setLoadingParticipantes(true);
        try {
          const lista = await listarParticipantes(foundEvent.id);
          setParticipantes(Array.isArray(lista) ? lista : []);
          // Busca membros da equipe do usuário logado
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
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar evento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;

    setDeleting(true);
    try {
      await deleteCalendarEvent(id!);
      navigate("/calendar");
    } catch (err: any) {
      setError(err.message || "Erro ao deletar evento");
    } finally {
      setDeleting(false);
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

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <BackButton to="/calendar" />

          {user?.role === "lider" && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/calendar/edit/${event.id}`)}
                className="btn btn-primary gap-2 flex-1 sm:flex-initial"
              >
                <PencilIcon className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-error gap-2 flex-1 sm:flex-initial"
              >
                <TrashIcon className="w-4 h-4" />
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          )}
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  {event.titulo}
                </h1>
                {event.descricao && (
                  <p className="text-base sm:text-lg text-gray-600">
                    {event.descricao}
                  </p>
                )}
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
                    <span className="font-semibold">
                      {formatDate(event.start?.dateTime || "")}
                    </span>
                  </div>
                }
              />

              <DetailItem
                label="Horário de Início"
                value={
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">
                      {formatTime(event.start?.dateTime || "")}
                    </span>
                  </div>
                }
              />

              <DetailItem
                label="Data de Término"
                value={
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">
                      {formatDate(event.end?.dateTime || "")}
                    </span>
                  </div>
                }
              />

              <DetailItem
                label="Horário de Término"
                value={
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">
                      {formatTime(event.end?.dateTime || "")}
                    </span>
                  </div>
                }
              />

              <DetailItem
                label="Duração"
                value={
                  <span className="font-semibold text-purple-600">
                    {getDuration(
                      event.start?.dateTime || "",
                      event.end?.dateTime || ""
                    )}
                  </span>
                }
              />

              <DetailItem
                label="Criado em"
                value={
                  <span className="text-sm text-gray-600">
                    {formatDateTime(event.created || "")}
                  </span>
                }
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
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                Ver no Google Calendar
              </a>
            </div>
          )}
          <br />
          {/* Participantes do Evento */}
          <DetailSection title="Participantes">
            {loadingParticipantes ? (
              <div className="py-4 text-center text-gray-400">
                Carregando participantes...
              </div>
            ) : participantes.length === 0 ? (
              <div className="py-4 text-center text-gray-400">
                Nenhum participante
              </div>
            ) : (
              <ul className="divide-y">
                {participantes.map((p) => {
                  const membro = membrosEquipe.find((m) => m.id === p.membroId);
                  return (
                    <li
                      key={p.id}
                      className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-semibold">
                        {membro ? membro.nomeCompleto : p.membroId}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 ml-2">
                        {p.status}
                      </span>
                      {p.observacao && (
                        <span className="text-xs text-gray-500 ml-2">
                          {p.observacao}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {/* Botão para participar do evento */}
            <div className="mt-4 text-center">
              <button
                className="btn btn-accent"
                onClick={() => setShowParticipar(true)}
              >
                Participar / Confirmar Presença
              </button>
            </div>
            {/* Modal simples para participação */}
            {showParticipar && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                  <h3 className="text-lg font-bold mb-2">
                    Participar do Evento
                  </h3>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">
                      Status:
                    </label>
                    <select
                      value={participarStatus}
                      onChange={(e) =>
                        setParticiparStatus(e.target.value as any)
                      }
                      className="input input-bordered w-full"
                    >
                      <option value="confirmado">Confirmado</option>
                      <option value="pendente">Pendente</option>
                      <option value="recusado">Recusado</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">
                      Observação:
                    </label>
                    <input
                      type="text"
                      value={participarObs}
                      onChange={(e) => setParticiparObs(e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>
                  {participarFeedback && (
                    <div className="text-red-500 text-sm mb-2">
                      {participarFeedback}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      className="btn btn-primary flex-1"
                      disabled={participarLoading}
                      onClick={async () => {
                        setParticiparLoading(true);
                        setParticiparFeedback(null);
                        try {
                          await participarEvento(event.id, {
                            membroId: user?.id,
                            status: participarStatus,
                            observacao: participarObs,
                          });
                          setShowParticipar(false);
                          setParticiparObs("");
                          setParticiparStatus("confirmado");
                          // Atualiza lista de participantes
                          setLoadingParticipantes(true);
                          try {
                            const lista = await listarParticipantes(event.id);
                            setParticipantes(Array.isArray(lista) ? lista : []);
                          } catch {}
                          setLoadingParticipantes(false);
                        } catch (err: any) {
                          setParticiparFeedback(
                            err.message || "Erro ao participar"
                          );
                        } finally {
                          setParticiparLoading(false);
                        }
                      }}
                    >
                      Salvar
                    </button>
                    <button
                      className="btn btn-ghost flex-1"
                      onClick={() => setShowParticipar(false)}
                      disabled={participarLoading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </DetailSection>
        </Card>
      </div>
    </Layout>
  );
};

export default CalendarDetailsPage;
