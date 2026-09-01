import type { FastifyInstance } from "fastify";
import { liturgicalDayRequestSchema } from "@missa-sync/schemas/liturgical-day";
import type { LiturgicalCalendarProvider } from "@missa-sync/calendar";
export const registerDayRoute = (app: FastifyInstance, provider: LiturgicalCalendarProvider): void => {
  app.get("/v1/days/:date", async (request, reply) => {
    const parsed = liturgicalDayRequestSchema.safeParse({ date: (request.params as { date?: unknown }).date, timezone: (request.query as { timezone?: unknown }).timezone });
    if (!parsed.success) return reply.code(400).send({ code: "INVALID_DAY_REQUEST", issues: parsed.error.issues });
    try { return reply.send(await provider.resolveDay(parsed.data)); } catch { return reply.code(400).send({ code: "INVALID_DAY_REQUEST" }); }
  });
};
