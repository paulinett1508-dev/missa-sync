import { describe, expect, it } from "vitest";
import { packageProductionJobId, redisConnectionFromUrl } from "@missa-sync/package-builder/package-production-queue";

const input = {
  decision: "APPROVED" as const,
  day: { date: "2026-08-30", timezone: "America/Sao_Paulo" },
  packageVersion: "1.0.0",
  generatedAt: "2026-08-30T12:00:00-03:00",
  checksum: "sha256:example",
  sourceEvidence: [{ sourceId: "fixture", contentHash: "hash", collectedAt: "2026-08-30T12:00:00-03:00", parserVersion: "1", decisionRule: "fixture" }],
  celebration: { title: "Celebração de teste", sections: [{ id: "introductory-rites" as const, title: "Ritos iniciais", blocks: ["Orientação de teste"] }] },
};

describe("package production job", () => {
  it("derives a deterministic Redis-safe job id from explicit identity", () => {
    expect(packageProductionJobId(input)).toBe(packageProductionJobId(input));
    expect(packageProductionJobId(input)).not.toBe(packageProductionJobId({ ...input, checksum: "sha256:changed" }));
    expect(packageProductionJobId(input)).not.toContain(":");
  });

  it("parses the explicit Redis connection configuration", () => {
    expect(redisConnectionFromUrl("redis://localhost:6379/2")).toMatchObject({ host: "localhost", port: 6379, db: 2 });
  });
});
