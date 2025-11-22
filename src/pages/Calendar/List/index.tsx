import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { useAuth } from "../../../context/AuthContext";
import { fetchCalendarEvents } from "../../../services/googleCalendarService";
import { listarParticipantes } from "../../../services/eventoService";
import {
  PageHeader,
  Card,
  SearchBar,
  EmptyState,
  StatCard,
} from "../../../components/ui";
import {
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

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
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [participantesCount, setParticipantesCount] = useState<Record<string, number>>({});

  useEffect(() => {
    loadEvents();
  }, [user?.equipe, user?.id]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCalendarEvents(user?.equipe);
      const eventos = Array.isArray((data as any).eventos)
        ? (data as any).eventos
        : [];
      const mapped = eventos.map((ev: any) => ({
        id: ev.id,
        titulo: ev.summary || "",
        descricao: ev.description || "",
        startDatetime: ev.start?.dateTime || "",
        endDatetime: ev.end?.dateTime || "",
        googleEventId: ev.id,
        createdAt: ev.created || "",
      }));

      // Carrega participantes e filtra eventos para mostrar só os que o usuário logado foi convidado
      const counts: Record<string, number> = {};
      const eventosVisiveis: CalendarEvent[] = [];
      for (const evt of mapped) {
        try {
          const participantes = await listarParticipantes(evt.id);
          const participantesArray = Array.isArray(participantes) ? participantes : [];
          counts[evt.id] = participantesArray.length;
          // Só adiciona evento se o usuário logado está entre os participantes
          if (participantesArray.some((p: any) => p.membroId === parseInt(user?.id || "0"))) {
            eventosVisiveis.push(evt);
          }
        } catch {
          counts[evt.id] = 0;
        }
      }

      setEvents(eventosVisiveis);
      setParticipantesCount(counts);

      if (!Array.isArray((data as any).eventos)) {
        setError(
          "Resposta inesperada do backend: propriedade 'eventos' não é um array"
        );
      } else if (mapped.length === 0) {
        setError("Nenhum evento encontrado");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar eventos");
      console.error("Erro ao buscar eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const eventsArray = Array.isArray(events) ? events : [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return eventsArray;
    return eventsArray.filter(
      (ev) =>
        ev.titulo.toLowerCase().includes(q) ||
        (ev.descricao || "").toLowerCase().includes(q)
    );
  }, [events, searchTerm]);

  // Estatísticas
  const totalEvents = filteredEvents.length;
  const upcomingEvents = filteredEvents.filter(
    (ev) => new Date(ev.startDatetime) >= new Date()
  ).length;
  const pastEvents = totalEvents - upcomingEvents;

  // Gera dias do mês atual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Gera array de dias com eventos
  const calendarDays = useMemo(() => {
    const eventsArray = Array.isArray(filteredEvents) ? filteredEvents : [];
    const days = [];

    // Dias vazios no início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayEvents = eventsArray.filter(
        (ev) => ev.startDatetime.split("T")[0] === dateStr
      );
      days.push({ date, dateStr, events: dayEvents });
    }

    return days;
  }, [year, month, daysInMonth, startingDayOfWeek, filteredEvents]);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 opacity-60">Carregando eventos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Calendário da Equipe"
          description={`Eventos e compromissos - ${
            user?.equipeNome || "Sua equipe"
          }`}
        >
          {user?.role === "lider" && (
            <button
              onClick={() => navigate("/calendar/edit")}
              className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5" />
              Novo Evento
            </button>
          )}
        </PageHeader>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total de Eventos"
            value={totalEvents}
            icon={CalendarIcon}
            color="blue"
          />
          <StatCard
            label="Próximos Eventos"
            value={upcomingEvents}
            icon={ClockIcon}
            color="green"
          />
          <StatCard
            label="Eventos Passados"
            value={pastEvents}
            icon={CalendarIcon}
            color="purple"
          />
        </div>

        {error && (
          <Card>
            <div className="text-center py-8 text-gray-500">{error}</div>
          </Card>
        )}

        {!error && (
          <>
            <Card>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar eventos..."
              />
            </Card>

            {/* Navegação do Calendário */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="btn btn-ghost btn-sm btn-circle"
                    title="Mês anterior"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {monthNames[month]} {year}
                  </h2>
                  <button
                    onClick={goToNextMonth}
                    className="btn btn-ghost btn-sm btn-circle"
                    title="Próximo mês"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={goToToday} className="btn btn-primary btn-sm">
                  Hoje
                </button>
              </div>

              {/* Grade do Calendário */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Cabeçalho dos dias da semana */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-xs sm:text-sm text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Dias do mês */}
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return (
                      <div key={`empty-${idx}`} className="aspect-square" />
                    );
                  }

                  const { date, events: dayEvents } = day;
                  const today = isToday(date);

                  return (
                    <div
                      key={day.dateStr}
                      className={`aspect-square border rounded-lg p-1 sm:p-2 overflow-hidden transition-all ${
                        today
                          ? "border-blue-500 bg-blue-50"
                          : dayEvents.length > 0
                          ? "border-blue-200 hover:border-blue-400 cursor-pointer hover:shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        if (dayEvents.length > 0) {
                          navigate(`/calendar/details/${dayEvents[0].id}`);
                        }
                      }}
                    >
                      <div
                        className={`text-xs sm:text-sm font-semibold mb-1 ${
                          today ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </div>

                      {/* Eventos do dia */}
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate font-medium"
                              title={event.titulo}
                            >
                              {event.titulo}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] sm:text-[10px] text-blue-600 font-medium">
                              +{dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Lista de Próximos Eventos */}
            <Card>
              <h3 className="text-lg sm:text-xl font-bold mb-4">
                Próximos Eventos
              </h3>

              {filteredEvents.length === 0 ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="Nenhum evento encontrado"
                  description="Não há eventos cadastrados para este período."
                />
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(filteredEvents) ? filteredEvents : [])
                    .filter((ev) => new Date(ev.startDatetime) >= new Date())
                    .sort(
                      (a, b) =>
                        new Date(a.startDatetime).getTime() -
                        new Date(b.startDatetime).getTime()
                    )
                    .slice(0, 5)
                    .map((event) => (
                      <div
                        key={event.id}
                        onClick={() =>
                          navigate(`/calendar/details/${event.id}`)
                        }
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">
                            {event.titulo}
                          </h4>
                          {event.descricao && (
                            <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                              {event.descricao}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {new Date(event.startDatetime).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {new Date(event.startDatetime).toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserGroupIcon className="w-4 h-4" />
                              {participantesCount[event.id] || 0} participantes
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CalendarListPage;