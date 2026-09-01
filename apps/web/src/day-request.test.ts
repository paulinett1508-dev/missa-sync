import { describe, expect, it } from "vitest";
import { isCalendarDate, isExplicitDayRequest } from "./day-request.js";

describe("day request", () => {
  it("accepts a real ISO calendar date with an explicit timezone", () => {
    expect(isExplicitDayRequest("2026-08-30", "America/Sao_Paulo")).toBe(true);
  });

  it("rejects an impossible calendar date or an invalid timezone", () => {
    expect(isCalendarDate("2026-02-30")).toBe(false);
    expect(isExplicitDayRequest("2026-08-30", "local")).toBe(false);
  });
});
