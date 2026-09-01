import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import type { FastifyInstance } from "fastify";
import { PrivateLiturgicalImportSchema } from "@missa-sync/schemas/private-liturgical-import";
import { verifySessionToken } from "./local-auth.js";
import type { ValidationStore } from "./validation-store.js";

type AuthRequest = { headers: { cookie?: string; authorization?: string }; body: unknown; params: unknown; query: unknown };
const cookieValue = (value: string | undefined): string | undefined => value?.split(";").map((item) => item.trim()).find((item) => item.startsWith("missa_sync_session="))?.slice(20);
const authorized = (request: AuthRequest, secret: string, token?: string): boolean => verifySessionToken(cookieValue(request.headers.cookie), secret) || (Boolean(token) && request.headers.authorization === `Bearer ${token}`);
const safeReference = (value: unknown, root: string): string | null => {
  if (typeof value !== "string" || value.length === 0 || value.includes("..")) return null;
  const path = resolve(root, value);
  return relative(resolve(root), path).startsWith("..") ? null : path;
};
const decision = (value: { readings: readonly { type: string }[]; massFlow: readonly unknown[] }): { status: "APPROVED" | "QUARANTINED" | "REJECTED"; divergences: string[] } => {
  if (!value.readings.some((reading) => reading.type === "GOSPEL")) return { status: "REJECTED", divergences: ["GOSPEL_MISSING"] };
  if (value.massFlow.length === 0) return { status: "QUARANTINED", divergences: ["MASS_FLOW_MISSING"] };
  return { status: "APPROVED", divergences: [] };
};

export const registerPrivateImportRoutes = (app: FastifyInstance, options: { sessionSecret: string; developmentToken?: string; importDirectory: string; validationStore?: ValidationStore }): void => {
  const guard = (request: AuthRequest, reply: { code(status: number): { send(payload: unknown): unknown } }): boolean => {
    if (!authorized(request, options.sessionSecret, options.developmentToken)) { void reply.code(401).send({ code: "UNAUTHORIZED" }); return false; }
    return true;
  };
  app.post("/v1/private-imports/liturgical-day", async (request, reply) => {
    if (!guard(request as unknown as AuthRequest, reply)) return;
    if (process.env.NODE_ENV === "production") return reply.code(403).send({ code: "LOCAL_IMPORT_ONLY" });
    const body = request.body as { path?: unknown };
    const path = safeReference(body?.path, options.importDirectory);
    if (!path) return reply.code(400).send({ code: "INVALID_PRIVATE_REFERENCE" });
    try { const parsed = PrivateLiturgicalImportSchema.safeParse(JSON.parse(await readFile(path, "utf8"))); if (!parsed.success) return reply.code(422).send({ code: "INVALID_PRIVATE_IMPORT", issues: parsed.error.issues }); return reply.code(202).send({ code: "PRIVATE_IMPORT_ACCEPTED", date: parsed.data.date, timezone: parsed.data.timezone, checksum: `sha256:${createHash("sha256").update(JSON.stringify(parsed.data)).digest("hex")}` }); } catch { return reply.code(404).send({ code: "PRIVATE_IMPORT_NOT_FOUND" }); }
  });
  app.post("/v1/days/:date/validate", async (request, reply) => {
    if (!guard(request as unknown as AuthRequest, reply)) return;
    const query = request.query as { timezone?: unknown };
    const path = safeReference(`${String((request.params as { date?: unknown }).date)}__${String(query.timezone ?? "")}.json`, options.importDirectory);
    if (!path) return reply.code(400).send({ code: "INVALID_DAY_REQUEST" });
    try { const parsed = PrivateLiturgicalImportSchema.safeParse(JSON.parse(await readFile(path, "utf8"))); if (!parsed.success) return reply.code(422).send({ status: "REJECTED", divergences: ["INVALID_PRIVATE_IMPORT"] }); return reply.send(decision(parsed.data)); } catch { return reply.code(404).send({ code: "PRIVATE_IMPORT_NOT_FOUND" }); }
  });
  app.get("/v1/days/:date/validation", async (request, reply) => {
    if (!guard(request as unknown as AuthRequest, reply)) return;
    const date = (request.params as { date?: unknown }).date;
    const timezone = (request.query as { timezone?: unknown }).timezone;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof timezone !== "string" || timezone.length === 0) return reply.code(400).send({ code: "INVALID_DAY_REQUEST" });
    if (!options.validationStore) return reply.code(404).send({ code: "VALIDATION_NOT_AVAILABLE", date, timezone });
    const result = await options.validationStore.find(date, timezone);
    if (!result) return reply.code(404).send({ code: "VALIDATION_NOT_FOUND", date, timezone });
    return reply.send(result);
  });
};
