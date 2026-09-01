export type CalendarInput = { date: string; timezone: string; locale?: string; calendar?: string };
export type CalendarDay = CalendarInput & { weekday: string; celebration: { key: string; title: string; rank: string; isSunday: boolean }; season: { key: string; title: string; week: number }; color: string; cycles: { sunday: string; weekday: string }; source: { provider: string; providerVersion: string; resolvedAt: string } };
export interface LiturgicalCalendarProvider { resolveDay(input: CalendarInput): Promise<CalendarDay>; }
const isValidDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
export class MockCalendarProvider implements LiturgicalCalendarProvider {
  async resolveDay(input: CalendarInput): Promise<CalendarDay> {
    if (!isValidDate(input.date) || !input.timezone) throw new Error("Invalid calendar input");
    const date = new Date(`${input.date}T12:00:00Z`); const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: input.timezone }).format(date); const isSunday = weekday === "Sunday";
    return { ...input, locale: input.locale ?? "pt-BR", calendar: input.calendar ?? "roman-general", weekday, celebration: { key: isSunday ? "sunday" : "weekday", title: isSunday ? "Domingo da Comunidade" : "Celebração do dia", rank: isSunday ? "Sunday" : "Weekday", isSunday }, season: { key: "ordinary-time", title: "Tempo Comum", week: 21 }, color: "green", cycles: { sunday: "A", weekday: "II" }, source: { provider: "mock", providerVersion: "1", resolvedAt: new Date().toISOString() } };
  }
}
export { RomcalCalendarProvider } from "./romcal-calendar-provider.js";
