import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { PageHeader, Card } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchCalendarEvents,
  deleteCalendarEvent,
} from "../../../services/googleCalendarService";

const CalendarDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        setError(null);
        const events = await fetchCalendarEvents(user?.equipe);
        setEvent(events.find((ev: any) => ev.id === id));
      } catch (err: any) {
        setError(err.message || "Erro ao carregar evento");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id, user?.equipe]);

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;
    setDeleting(true);
    try {
      await deleteCalendarEvent(id!);
      navigate("/calendar/list");
    } catch (err: any) {
      setError(err.message || "Erro ao deletar evento");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Detalhes do Evento"
          description="Veja as informações do evento"
        />
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : !event ? (
          <Card>
            <div className="text-center py-12">Evento não encontrado.</div>
          </Card>
        ) : (
          <Card>
            <div className="space-y-2">
              <h3 className="text-xl font-bold mb-2">{event.titulo}</h3>
              <p className="text-gray-600 mb-2">{event.descricao}</p>
              <div>
                <span className="font-semibold">Início:</span>{" "}
                {new Date(event.startDatetime).toLocaleString("pt-BR")}
              </div>
              <div>
                <span className="font-semibold">Fim:</span>{" "}
                {new Date(event.endDatetime).toLocaleString("pt-BR")}
              </div>
              <div className="text-xs text-gray-400">
                Criado em: {new Date(event.createdAt).toLocaleString("pt-BR")}
              </div>
              <div className="flex gap-2 mt-4">
                {user?.role === "lider" && (
                  <>
                    <button
                      className="btn btn-accent"
                      onClick={() => navigate(`/calendar/edit/${event.id}`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Excluindo..." : "Excluir"}
                    </button>
                  </>
                )}
                <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                  Voltar
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CalendarDetailsPage;
