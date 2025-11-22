import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { PageHeader, Card } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchCalendarEvents,
  updateCalendarEvent,
  createCalendarEvent,
} from "../../../services/googleCalendarService";

const CalendarEditPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      if (!id) {
        setInitialLoading(false);
        return;
      }
      try {
        setInitialLoading(true);
        setError(null);
        const events = await fetchCalendarEvents(user?.equipe);
        const event = events.find((ev: any) => ev.id === id);
        if (event) {
          setTitulo(event.titulo);
          setDescricao(event.descricao || "");
          setStartDatetime(event.startDatetime.slice(0, 16));
          setEndDatetime(event.endDatetime.slice(0, 16));
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar evento");
      } finally {
        setInitialLoading(false);
      }
    }
    loadEvent();
  }, [id, user?.equipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) {
        await updateCalendarEvent(id, {
          titulo,
          descricao,
          startDatetime,
          endDatetime,
        });
        navigate(`/calendar/details/${id}`);
      } else {
        await createCalendarEvent({
          titulo,
          descricao,
          startDatetime,
          endDatetime,
          equipeId: user?.equipe,
        });
        navigate("/calendar/list");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title={id ? "Editar Evento" : "Criar Evento"}
          description={
            id
              ? "Altere os dados do evento"
              : "Adicione um novo evento ao calendário da equipe"
          }
        />
        <Card>
          {initialLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <form
              className="space-y-4 max-w-lg mx-auto"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block font-semibold mb-1">Título</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Descrição</label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Início</label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full"
                    value={startDatetime}
                    onChange={(e) => setStartDatetime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Fim</label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full"
                    value={endDatetime}
                    onChange={(e) => setEndDatetime(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Salvando..."
                    : id
                    ? "Salvar Alterações"
                    : "Criar Evento"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default CalendarEditPage;
