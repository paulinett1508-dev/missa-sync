import { describe, expect, it } from "vitest";
import { produceOfflinePackage } from "./package-production.js";

const input = {
  day: { date: "2026-08-30", timezone: "America/Sao_Paulo" },
  packageVersion: "1.0.0",
  generatedAt: "2026-08-30T12:00:00-03:00",
  checksum: "sha256:example",
  sourceEvidence: [{ sourceId: "fixture", contentHash: "hash", collectedAt: "2026-08-30T12:00:00-03:00", parserVersion: "1", decisionRule: "fixture" }],
  celebration: { title: "Celebração de teste", sections: [{ id: "introductory-rites" as const, title: "Ritos iniciais", blocks: ["Orientação de teste"] }] },
};

describe("produceOfflinePackage", () => {
  it("writes an approved package exactly once", async () => {
    const writes: string[] = [];
    const result = await produceOfflinePackage({ ...input, decision: "APPROVED" }, { write: async (offlinePackage) => { writes.push(offlinePackage.checksum); } });
    expect(result.outcome).toBe("built");
    expect(writes).toEqual(["sha256:example"]);
  });

  it("never writes a quarantined package", async () => {
    const result = await produceOfflinePackage({ ...input, decision: "QUARANTINED" }, { write: async () => { throw new Error("must not write"); } });
    expect(result).toEqual({ outcome: "not-eligible", decision: "QUARANTINED" });
  });
});
