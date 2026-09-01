import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { registerPrivateImportRoutes } from "./private-import-route.js";
const payload = { date: "2026-08-23", timezone: "America/Sao_Paulo", celebrationTitle: "Example", season: "Ordinary", color: "Green", cycleYear: "B", celebrationRank: "Sunday", readings: [{ type: "GOSPEL", citation: "Example 1" }], massFlow: [{ section: "introductory-rites", note: "Own note" }], selectedSongs: [], personalNotes: "Note", sourceReference: { booklet: "Livreto" }, source: "LOCAL_PRIVATE", status: "PENDING" };
describe("private import routes", () => { it("requires auth and accepts a safe local reference", async () => { const directory = await mkdtemp(join(tmpdir(), "missa-private-api-")); const app = Fastify(); registerPrivateImportRoutes(app, { sessionSecret: "secret", developmentToken: "dev", importDirectory: directory }); try { await writeFile(join(directory, "day.json"), JSON.stringify(payload)); expect((await app.inject({ method: "POST", url: "/v1/private-imports/liturgical-day", payload: { path: "day.json" } })).statusCode).toBe(401); expect((await app.inject({ method: "POST", url: "/v1/private-imports/liturgical-day", headers: { authorization: "Bearer dev" }, payload: { path: "day.json" } })).statusCode).toBe(202); } finally { await app.close(); await rm(directory, { recursive: true, force: true }); } }); });
