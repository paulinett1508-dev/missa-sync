import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { liturgicalDayRequestSchema } from "@missa-sync/schemas/liturgical-day";
import { offlineMassPackageSchema } from "@missa-sync/schemas/offline-package";
import { verifySessionToken } from "./local-auth.js";

const readSessionCookie = (value: string | undefined): string | undefined => value?.split(";").map((part) => part.trim()).find((part) => part.startsWith("missa_sync_session="))?.slice("missa_sync_session=".length);
const packageFileName = (date: string, timezone: string): string => `${date}__${timezone.replaceAll("/", "_")}.json`;
const hasBearerToken = (value: string | undefined, expected: string | undefined): boolean => Boolean(expected) && value === `Bearer ${expected}`;

export const registerPackageSyncRoute = (app: FastifyInstance, sessionSecret: string, packageDirectory: string, developmentToken?: string): void => {
  const readPackage = async (request: { headers: { cookie?: string; authorization?: string }; params: unknown; query: unknown }, reply: { code(status: number): { send(payload: unknown): unknown }; send(payload: unknown): unknown }) => {
    const cloudflareUser = (request.headers as Record<string, string | undefined>)["cf-access-authenticated-user-email"];
    if (!verifySessionToken(readSessionCookie(request.headers.cookie), sessionSecret) && !hasBearerToken(request.headers.authorization, developmentToken) && !cloudflareUser) return reply.code(401).send({ code: "UNAUTHORIZED" });
    const parsed = liturgicalDayRequestSchema.safeParse({ date: (request.params as { date?: unknown }).date, timezone: (request.query as { timezone?: unknown }).timezone });
    if (!parsed.success) return reply.code(400).send({ code: "INVALID_DAY_REQUEST", issues: parsed.error.issues });
    if (!/^[A-Za-z0-9_+\-/]+$/.test(parsed.data.timezone) || parsed.data.timezone.includes("..")) return reply.code(400).send({ code: "INVALID_DAY_REQUEST" });
    try {
      const value: unknown = JSON.parse(await readFile(join(packageDirectory, packageFileName(parsed.data.date, parsed.data.timezone)), "utf8"));
      const packageResult = offlineMassPackageSchema.safeParse(value);
      if (!packageResult.success || (packageResult.data.status !== "APPROVED" && packageResult.data.status !== "LOCAL_PRIVATE")) return reply.code(404).send({ code: "PACKAGE_NOT_AVAILABLE", ...parsed.data });
      return reply.send(packageResult.data);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return reply.code(404).send({ code: "PACKAGE_NOT_AVAILABLE", ...parsed.data });
      throw error;
    }
  };
  app.get("/v1/packages/:date", readPackage);
  app.get("/v1/packages/daily/:date", readPackage);
};
