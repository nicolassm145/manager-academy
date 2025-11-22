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
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
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

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const isEditMode = !!id;

  useEffect(() => {
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

  const loadEvent = async () => {
    try {
      setInitialLoading(true);
      setFeedback(null);
      const data = await fetchCalendarEvents(user?.equipe);
      // Backend retorna { eventos: Array } ao invés de Array diretamente
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
      if (id) {
        await updateCalendarEvent(id, {
          titulo,
          descricao,
          startDatetime: startDateTime,
          endDatetime: endDateTime,
        });
        setFeedback({
          type: "success",
          message: "Evento atualizado com sucesso!",
        });
        setTimeout(() => navigate(`/calendar/details/${id}`), 1200);
      } else {
        await createCalendarEvent({
          titulo,
          descricao,
          startDatetime: startDateTime,
          endDatetime: endDateTime,
        });
        setFeedback({
          type: "success",
          message: "Evento criado com sucesso!",
        });
        setTimeout(() => navigate("/calendar"), 1200);
      }
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
