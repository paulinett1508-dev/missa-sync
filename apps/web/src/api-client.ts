import type { OfflineMassPackageInput } from "@missa-sync/schemas/offline-package";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
export const apiOrigin = apiBaseUrl || window.location.origin;

const request = async (path: string, init?: RequestInit): Promise<Response> => fetch(`${apiBaseUrl}${path}`, { ...init, credentials: "include" });

export const startSession = async (password: string): Promise<boolean> => (await request("/v1/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) })).status === 204;

export type DailyPackageResponse = { state: "available"; content: OfflineMassPackageInput } | { state: "missing" } | { state: "review" } | { state: "auth" };
export type CalendarDayResponse = { celebration: { title: string; rank: string; isSunday: boolean }; season: { title: string; week: number }; color: string; cycles: { sunday: string; weekday: string }; weekday: string };
export const fetchCalendarDay = async (date: string, timezone: string): Promise<CalendarDayResponse | null> => { const response = await request(`/v1/days/${encodeURIComponent(date)}?timezone=${encodeURIComponent(timezone)}`); if (!response.ok) return null; return await response.json() as CalendarDayResponse; };
export type LiturgiaReading = { referencia: string; titulo?: string; texto?: string; refrao?: string };
export type LiturgiaContent = { data: string; liturgia: string; cor: string; oracoes?: Record<string, string>; leituras?: Record<string, LiturgiaReading[] | undefined>; antifonas?: Record<string, string> };
export const fetchLiturgia = async (date: string, timezone: string): Promise<LiturgiaContent | null> => { const response = await request(`/v1/liturgy/${encodeURIComponent(date)}?timezone=${encodeURIComponent(timezone)}`); if (!response.ok) return null; const payload = await response.json() as { content?: LiturgiaContent }; return payload.content ?? null; };
export const fetchApprovedPackage = async (date: string, timezone: string): Promise<DailyPackageResponse> => {
  const response = await request(`/v1/packages/daily/${encodeURIComponent(date)}?timezone=${encodeURIComponent(timezone)}`);
  if (response.status === 401) return { state: "auth" };
  if (response.headers.get("content-type")?.includes("text/html")) return { state: "auth" };
  if (response.status === 404 || response.status === 422) return { state: "missing" };
  if (response.status === 409) return { state: "review" };
  if (!response.ok) throw new Error("Package synchronization failed.");
  return { state: "available", content: await response.json() as OfflineMassPackageInput };
};
