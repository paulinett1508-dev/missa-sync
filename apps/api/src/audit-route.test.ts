import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { createPrivateAuditWriter } from "@missa-sync/shared/private-audit-log";
import { registerAuditRoute } from "./audit-route.js";

describe("audit route", () => {
  it("requires authentication and filters records by explicit day and timezone", async () => {
    const directory = await mkdtemp(join(tmpdir(), "missa-sync-audit-"));
    const app = Fastify();
    registerAuditRoute(app, "test-token", directory);

    try {
      const writer = createPrivateAuditWriter(directory);
      await writer.write({ event: "PACKAGE_ENQUEUED", occurredAt: "2026-08-30T12:00:00.000Z", attributes: { date: "2026-08-30", timezone: "America/Sao_Paulo", checksum: "first" } });
      await writer.write({ event: "PACKAGE_ENQUEUED", occurredAt: "2026-08-30T12:01:00.000Z", attributes: { date: "2026-08-30", timezone: "UTC", checksum: "other-timezone" } });

      expect((await app.inject({ method: "GET", url: "/v1/internal/audit/2026-08-30?timezone=America/Sao_Paulo" })).statusCode).toBe(401);
      const filtered = await app.inject({ method: "GET", url: "/v1/internal/audit/2026-08-30?timezone=America/Sao_Paulo", headers: { authorization: "Bearer test-token" } });
      expect(filtered.statusCode).toBe(200);
      expect(filtered.json().records).toHaveLength(1);

      const empty = await app.inject({ method: "GET", url: "/v1/internal/audit/2026-08-31?timezone=America/Sao_Paulo", headers: { authorization: "Bearer test-token" } });
      expect(empty.json().records).toEqual([]);
    } finally {
      await app.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
});
