import { describe, expect, it } from "vitest";
import { MockCalendarProvider } from "./index.js";
import { RomcalCalendarProvider } from "./romcal-calendar-provider.js";
describe("MockCalendarProvider", () => { it("resolves an explicit Sunday", async () => { const day = await new MockCalendarProvider().resolveDay({ date: "2026-08-23", timezone: "America/Sao_Paulo" }); expect(day.weekday).toBe("Sunday"); expect(day.celebration.isSunday).toBe(true); }); });
describe("RomcalCalendarProvider", () => { it("maps Easter 2026 without leaking Romcal types", async () => { const day = await new RomcalCalendarProvider(new MockCalendarProvider()).resolveDay({ date: "2026-04-05", timezone: "America/Sao_Paulo" }); expect(day.source.provider).toBe("romcal"); expect(day.celebration.key).toBe("easter"); expect(day.cycles.sunday).toBe("A"); }); });
describe("Romcal 2026 regressions", () => {
  const cases = [
    ["2026-02-18", "ashWednesday"], ["2026-03-29", "palmSunday"], ["2026-04-05", "easter"],
    ["2026-05-24", "pentecostSunday"], ["2026-08-15", "assumption"], ["2026-11-02", "allSouls"],
    ["2026-11-22", "christTheKing"], ["2026-11-29", "1stSundayOfAdvent"], ["2026-12-25", "christmas"],
  ] as const;
  it.each(cases)("resolves %s as %s", async (date, key) => { const day = await new RomcalCalendarProvider(new MockCalendarProvider()).resolveDay({ date, timezone: "America/Sao_Paulo" }); expect(day.source.provider).toBe("romcal"); expect(day.celebration.key).toBe(key); });
  it("resolves a common Sunday", async () => { const day = await new RomcalCalendarProvider(new MockCalendarProvider()).resolveDay({ date: "2026-08-23", timezone: "America/Sao_Paulo" }); expect(day.celebration.isSunday).toBe(true); expect(day.season.key).toBe("Later Ordinary Time"); });
});
