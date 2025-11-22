import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { useAuth } from "../../../context/AuthContext";
import { fetchCalendarEvents } from "../../../services/googleCalendarService";
import { PageHeader, Card } from "../../../components/ui";

interface CalendarEvent {
  id: string;
  titulo: string;
  descricao?: string;
  startDatetime: string;
  endDatetime: string;
  googleEventId: string;
  createdAt: string;
}

const CalendarListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCalendarEvents(user?.equipe);
        setEvents(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar eventos");
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [user?.equipe]);

  // Filtro de busca
  const filteredEvents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (ev) =>
        ev.titulo.toLowerCase().includes(q) ||
        (ev.descricao || "").toLowerCase().includes(q)
    );
  }, [events, searchTerm]);

  // Agrupa eventos por dia
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((ev) => {
      const date = ev.startDatetime.slice(0, 10); // yyyy-mm-dd
      if (!map[date]) map[date] = [];
      map[date].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Gera dias do mês atual
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const iso = date.toISOString().slice(0, 10);
    return { date, iso, events: eventsByDate[iso] || [] };
  });

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Calendário da Equipe"
          description={`Eventos da equipe ${user?.equipeNome || ""}`}
        >
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered input-sm w-48"
              placeholder="Buscar evento..."
            />
            <div className="btn-group ml-auto">
              <button
                className={`btn btn-sm ${
                  viewMode === "calendar" ? "btn-active" : "btn-ghost"
                }`}
                onClick={() => setViewMode("calendar")}
              >
                Calendário
              </button>
              <button
                className={`btn btn-sm ${
                  viewMode === "list" ? "btn-active" : "btn-ghost"
                }`}
                onClick={() => setViewMode("list")}
              >
                Lista
              </button>
            </div>
            {user?.role === "lider" && (
              <button
                className="btn btn-primary btn-sm ml-2"
                onClick={() => navigate("/calendar/edit")}
              >
                + Criar Evento
              </button>
            )}
          </div>
        </PageHeader>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : viewMode === "calendar" ? (
          <Card>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map(({ date, iso, events }) => (
                <div
                  key={iso}
                  className={`relative p-2 rounded-lg border cursor-pointer hover:bg-blue-50 ${
                    events.length ? "border-blue-400" : "border-gray-200"
                  }`}
                  onClick={() =>
                    events.length &&
                    navigate(`/calendar/details/${events[0].id}`)
                  }
                >
                  <div className="font-semibold text-sm text-gray-700">
                    {date.getDate()}
                  </div>
                  {events.length > 0 && (
                    <div className="mt-1 text-xs text-blue-600 font-bold truncate">
                      {events.map((ev) => ev.titulo).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Data</th>
                  <th className="text-left">Título</th>
                  <th className="text-left">Horário</th>
                  <th className="text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-blue-50 cursor-pointer">
                    <td>
                      {new Date(ev.startDatetime).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{ev.titulo}</td>
                    <td>
                      {new Date(ev.startDatetime).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(ev.endDatetime).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-accent mr-1"
                        onClick={() => navigate(`/calendar/details/${ev.id}`)}
                      >
                        Detalhes
                      </button>
                      {user?.role === "lider" && (
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => navigate(`/calendar/edit/${ev.id}`)}
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CalendarListPage;
