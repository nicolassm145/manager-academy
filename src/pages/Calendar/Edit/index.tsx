import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { Card, FormField, BackButton } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { Feedback } from "../../../components/ui/FeedbackComponent";
import {
  fetchCalendarEvents,
  updateCalendarEvent,
  createCalendarEvent,
} from "../../../services/googleCalendarService";
import {
  listarParticipantes,
  participarEvento,
} from "../../../services/eventoService";
import {
  listarTarefas,
  adicionarTarefa,
  type Tarefa,
} from "../../../services/tarefaService";
import { getEquipeMembros } from "../../../services/equipeService";
import {
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const CalendarEditPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // Estados para participantes
  const [membrosEquipe, setMembrosEquipe] = useState<any[]>([]);
  const [participantesSelecionados, setParticipantesSelecionados] = useState<
    number[]
  >([]);

  // Estados para tarefas
  const [tarefas, setTarefas] = useState<
    { descricao: string; membroId: number }[]
  >([]);
  const [novaTarefaDescricao, setNovaTarefaDescricao] = useState("");
  const [novaTarefaMembroId, setNovaTarefaMembroId] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const isEditMode = !!id;

  useEffect(() => {
    loadMembros();
    if (id) {
      loadEvent();
    } else {
      // Modo criação: define data/hora padrão
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().slice(0, 5);

      setStartDate(dateStr);
      setStartTime(timeStr);

      // Término padrão: 1 hora depois
      const endDateTime = new Date(now.getTime() + 60 * 60 * 1000);
      setEndDate(endDateTime.toISOString().split("T")[0]);
      setEndTime(endDateTime.toTimeString().slice(0, 5));

      setInitialLoading(false);
    }
  }, [id, user?.equipe]);

  const loadMembros = async () => {
    if (!user?.equipe) return;
    try {
      const membros = await getEquipeMembros(user.equipe);
      setMembrosEquipe(Array.isArray(membros) ? membros : []);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
    }
  };

  const loadEvent = async () => {
    try {
      setInitialLoading(true);
      setFeedback(null);
      const data = await fetchCalendarEvents(user?.equipe);
      const eventsArray = (data as any)?.eventos || [];
      const events = Array.isArray(eventsArray) ? eventsArray : [];
      const event = events.find((ev: any) => ev.id === id);

      if (event) {
        setTitulo(event.summary || "");
        setDescricao(event.description || "");

        if (event.start?.dateTime) {
          const startDateTime = new Date(event.start.dateTime);
          setStartDate(startDateTime.toISOString().split("T")[0]);
          setStartTime(startDateTime.toTimeString().slice(0, 5));
        }

        if (event.end?.dateTime) {
          const endDateTime = new Date(event.end.dateTime);
          setEndDate(endDateTime.toISOString().split("T")[0]);
          setEndTime(endDateTime.toTimeString().slice(0, 5));
        }

        // Carrega participantes existentes
        try {
          const participantes = await listarParticipantes(
            event.googleEventId || event.id
          );
          const participantesArray = Array.isArray(participantes)
            ? participantes
            : [];
          setParticipantesSelecionados(
            participantesArray.map((p: any) => p.membroId)
          );
        } catch (err) {
          console.error("Erro ao carregar participantes:", err);
        }

        // Carrega tarefas existentes
        try {
          const tarefasData = await listarTarefas(event.id);
          const tarefasArray = Array.isArray(tarefasData) ? tarefasData : [];
          setTarefas(
            tarefasArray.map((t: any) => ({
              descricao: t.descricao,
              membroId: t.membroId,
            }))
          );
        } catch (err) {
          console.error("Erro ao carregar tarefas:", err);
        }
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao carregar evento",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggleParticipante = (membroId: number) => {
    setParticipantesSelecionados((prev) => {
      if (prev.includes(membroId)) {
        return prev.filter((id) => id !== membroId);
      } else {
        return [...prev, membroId];
      }
    });
  };

  const handleAdicionarTarefa = () => {
    if (!novaTarefaDescricao.trim() || novaTarefaMembroId === "") {
      setFeedback({
        type: "error",
        message: "Preencha todos os campos da tarefa",
      });
      return;
    }

    setTarefas((prev) => [
      ...prev,
      {
        descricao: novaTarefaDescricao,
        membroId: novaTarefaMembroId as number,
      },
    ]);
    setNovaTarefaDescricao("");
    setNovaTarefaMembroId("");
  };

  const handleRemoverTarefa = (index: number) => {
    setTarefas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    // Validações
    if (!titulo.trim()) {
      setFeedback({ type: "error", message: "Título é obrigatório" });
      setLoading(false);
      return;
    }

    if (participantesSelecionados.length === 0) {
      setFeedback({
        type: "error",
        message: "Selecione pelo menos um participante",
      });
      setLoading(false);
      return;
    }

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${endDate}T${endTime}:00`;

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setFeedback({
        type: "error",
        message: "Data/hora de término deve ser posterior ao início",
      });
      setLoading(false);
      return;
    }

    try {
      let eventoId: string;

      if (id) {
        // Atualização
        const eventoAtualizado = await updateCalendarEvent(id, {
          titulo,
          descricao,
          startDatetime: startDateTime,
          endDatetime: endDateTime,
        });
        eventoId = eventoAtualizado.googleEventId;
        setFeedback({
          type: "success",
          message: "Evento atualizado com sucesso!",
        });
      } else {
        // Criação
        const novoEvento = await createCalendarEvent({
          titulo,
          descricao,
          startDatetime: startDateTime,
          endDatetime: endDateTime,
        });
        eventoId = novoEvento.googleEventId;
        setFeedback({
          type: "success",
          message: "Evento criado com sucesso!",
        });
      }

      // Adiciona participantes
      for (const membroId of participantesSelecionados) {
        try {
          if (!eventoId) {
            console.error(
              "googleEventId inválido ao adicionar participante:",
              eventoId
            );
            continue;
          }
          await participarEvento(parseInt(eventoId), {
            membroId,
            status: "pendente",
            observacao: "",
          });
        } catch (err) {
          console.error("Erro ao adicionar participante:", err);
        }
      }

      // Adiciona tarefas
      for (const tarefa of tarefas) {
        try {
          await adicionarTarefa(eventoId, {
            membroId: tarefa.membroId,
            descricao: tarefa.descricao,
          });
        } catch (err) {
          console.error("Erro ao adicionar tarefa:", err);
        }
      }

      setTimeout(() => navigate(`/calendar/details/${eventoId}`), 1200);
    } catch (err: any) {
      let errorMsg = err.message || "Erro ao salvar evento";
      if (err.response && err.response.text) {
        try {
          errorMsg = await err.response.text();
        } catch {}
      }
      setFeedback({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (membroId: number) => {
    const membro = membrosEquipe.find((m) => m.id === membroId);
    return membro ? membro.nomeCompleto : `ID: ${membroId}`;
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 opacity-60">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Feedback visual */}
        {feedback && (
          <Feedback type={feedback.type} message={feedback.message} />
        )}

        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton to={id ? `/calendar/details/${id}` : "/calendar"} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {isEditMode ? "Editar Evento" : "Criar Novo Evento"}
            </h1>
            <p className="text-sm sm:text-base opacity-60 mt-1">
              {isEditMode
                ? "Atualize as informações do evento"
                : "Adicione um novo evento ao calendário da equipe"}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <Card padding="large">
            <div className="space-y-6">
              {/* Título */}
              <FormField
                label="Título do Evento"
                name="titulo"
                required
                description="Nome do evento ou compromisso"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="titulo"
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Reunião de equipe, Competição, Workshop..."
                  />
                </div>
              </FormField>

              {/* Descrição */}
              <FormField
                label="Descrição"
                name="descricao"
                description="Detalhes adicionais sobre o evento (opcional)"
              >
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Descreva os detalhes do evento, local, participantes..."
                />
              </FormField>

              {/* Data e Hora de Início */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Data de Início" name="startDate" required>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="startDate"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </FormField>

                <FormField label="Horário de Início" name="startTime" required>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="startTime"
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </FormField>
              </div>

              {/* Data e Hora de Término */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Data de Término" name="endDate" required>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="endDate"
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </FormField>

                <FormField label="Horário de Término" name="endTime" required>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="endTime"
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-10 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </FormField>
              </div>

              {/* Seção de Participantes */}
              <div className="pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Participantes *</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione os membros que participarão deste evento
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg">
                  {membrosEquipe.map((membro) => (
                    <label
                      key={membro.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={participantesSelecionados.includes(membro.id)}
                        onChange={() => handleToggleParticipante(membro.id)}
                        className="checkbox checkbox-primary"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-blue-600">
                            {membro.nomeCompleto.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium truncate">
                          {membro.nomeCompleto}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {participantesSelecionados.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {participantesSelecionados.length} participante(s)
                    selecionado(s)
                  </p>
                )}
              </div>

              {/* Seção de Tarefas */}
              <div className="pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">Tarefas do Evento</h3>
                </div>

                {/* Lista de tarefas adicionadas */}
                {tarefas.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {tarefas.map((tarefa, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {tarefa.descricao}
                          </p>
                          <p className="text-xs text-gray-600">
                            Responsável: {getMemberName(tarefa.membroId)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverTarefa(index)}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Adicionar nova tarefa */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm font-medium mb-3">Adicionar Tarefa</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={novaTarefaDescricao}
                      onChange={(e) => setNovaTarefaDescricao(e.target.value)}
                      placeholder="Descrição da tarefa..."
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <div className="flex gap-2">
                      <select
                        value={novaTarefaMembroId}
                        onChange={(e) =>
                          setNovaTarefaMembroId(
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      >
                        <option value="">Selecione o responsável</option>
                        {membrosEquipe
                          .filter((m) =>
                            participantesSelecionados.includes(m.id)
                          )
                          .map((membro) => (
                            <option key={membro.id} value={membro.id}>
                              {membro.nomeCompleto}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAdicionarTarefa}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading
                    ? "Salvando..."
                    : isEditMode
                    ? "Salvar Alterações"
                    : "Criar Evento"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-ghost"
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default CalendarEditPage;
