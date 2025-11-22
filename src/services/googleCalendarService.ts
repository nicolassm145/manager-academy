import { getAuthHeaders } from "../config/api";

// Serviço para Google Calendar
export interface CalendarEvent {
  id: string;
  titulo: string;
  descricao?: string;
  startDatetime: string;
  endDatetime: string;
  googleEventId: string;
  createdAt: string;
}

export async function fetchCalendarEvents(
  equipeId?: string | number
): Promise<CalendarEvent[]> {
  const url = `/api/v1/google-calendar/listar-evento${
    equipeId ? `?equipeId=${equipeId}` : ""
  }`;
  const res = await fetch(url, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  const contentType = res.headers.get("content-type");
  if (!res.ok) throw new Error(`Erro ao buscar eventos: ${res.status}`);
  if (!contentType || !contentType.includes("application/json"))
    throw new Error("Resposta do backend não é JSON.");
  return await res.json();
}

export async function createCalendarEvent(
  event: Omit<CalendarEvent, "id" | "googleEventId" | "createdAt">
): Promise<CalendarEvent> {
  const url = `/api/v1/google-calendar/criar-evento`;
  const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
  // Garante formato ISO para datas
  const payload = {
    ...event,
    startDatetime: event.startDatetime
      ? new Date(event.startDatetime).toISOString()
      : undefined,
    endDatetime: event.endDatetime
      ? new Date(event.endDatetime).toISOString()
      : undefined,
  };
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    let errorMsg = "Erro ao criar evento";
    try {
      errorMsg = await res.text();
    } catch {}
    throw new Error(errorMsg);
  }
  return await res.json();
}

export async function updateCalendarEvent(
  eventId: string,
  event: Partial<Omit<CalendarEvent, "id" | "googleEventId" | "createdAt">>
): Promise<CalendarEvent> {
  const url = `/api/v1/google-calendar/atualizar-evento/${eventId}`;
  const headers = { ...getAuthHeaders(), "Content-Type": "application/json" };
  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(event),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao atualizar evento");
  return await res.json();
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const url = `/api/v1/google-calendar/deletar-evento/${eventId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erro ao deletar evento");
}
