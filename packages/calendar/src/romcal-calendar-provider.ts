import { calendarFor } from "romcal";
import type { CalendarDay, CalendarInput, LiturgicalCalendarProvider } from "./index.js";

type RomcalEntry = { moment?: unknown; type?: unknown; name?: unknown; key?: unknown; source?: unknown; data?: { season?: { key?: unknown; value?: unknown }; meta?: { liturgicalColor?: { key?: unknown; value?: unknown }; cycle?: { value?: unknown } }; calendar?: { week?: unknown } } };

/** Boundary for Romcal. Mapping stays isolated until the selected Romcal distribution is verified. */
export class RomcalCalendarProvider implements LiturgicalCalendarProvider {
  public constructor(private readonly fallback: LiturgicalCalendarProvider) {}

  public async resolveDay(input: CalendarInput): Promise<CalendarDay> {
    const base = await this.fallback.resolveDay(input);
    const entries = calendarFor({ year: Number(input.date.slice(0, 4)) }) as unknown as RomcalEntry[];
    const entry = entries.find((candidate) => typeof candidate.moment === "string" && candidate.moment.slice(0, 10) === input.date);
    if (!entry) return base;
    const meta = entry.data?.meta;
    const season = entry.data?.season;
    return { ...base, celebration: { key: typeof entry.key === "string" ? entry.key : base.celebration.key, title: typeof entry.name === "string" ? entry.name : base.celebration.title, rank: typeof entry.type === "string" ? entry.type : base.celebration.rank, isSunday: base.celebration.isSunday }, season: { key: typeof season?.key === "string" ? season.key : base.season.key, title: typeof season?.value === "string" ? season.value : base.season.title, week: typeof entry.data?.calendar?.week === "number" ? entry.data.calendar.week : base.season.week }, color: typeof meta?.liturgicalColor?.key === "string" ? meta.liturgicalColor.key.toLowerCase() : base.color, cycles: { sunday: typeof meta?.cycle?.value === "string" ? meta.cycle.value.replace("Year ", "") : base.cycles.sunday, weekday: base.cycles.weekday }, source: { provider: "romcal", providerVersion: "1.3.0", resolvedAt: new Date().toISOString() } };
  }
}
