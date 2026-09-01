import type { FastifyInstance } from "fastify";
import { liturgicalDayRequestSchema } from "@missa-sync/schemas/liturgical-day";
import { readPrivateAuditRecords } from "@missa-sync/shared/private-audit-log";
import { hasValidBearerToken } from "./package-production-route.js";

export const registerAuditRoute = (app: FastifyInstance, ingestToken: string, auditDirectory: string): void => {
  app.get("/v1/internal/audit/:date", async (request, reply) => {
    if (!hasValidBearerToken(request.headers.authorization, ingestToken)) return reply.code(401).send({ code: "UNAUTHORIZED" });
    const parsed = liturgicalDayRequestSchema.safeParse({ date: (request.params as { date?: unknown }).date, timezone: (request.query as { timezone?: unknown }).timezone });
    if (!parsed.success) return reply.code(400).send({ code: "INVALID_DAY_REQUEST", issues: parsed.error.issues });
    return reply.send({ ...parsed.data, records: await readPrivateAuditRecords(auditDirectory, parsed.data.date, parsed.data.timezone) });
  });
};
