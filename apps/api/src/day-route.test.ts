import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { MockCalendarProvider, RomcalCalendarProvider } from "@missa-sync/calendar";
import { registerDayRoute } from "./day-route.js";

describe("day route", () => {
  it("returns the Romcal celebration for an explicit date", async () => {
    const app = Fastify();
    registerDayRoute(app, new RomcalCalendarProvider(new MockCalendarProvider()));
    const response = await app.inject({ method: "GET", url: "/v1/days/2026-04-05?timezone=America%2FSao_Paulo" });
    expect(response.statusCode).toBe(200);
    expect(response.json().celebration.key).toBe("easter");
    await app.close();
  });
});
