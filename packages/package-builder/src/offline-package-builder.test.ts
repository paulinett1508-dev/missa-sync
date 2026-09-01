import { describe, expect, it } from "vitest";
import { buildOfflineMassPackage } from "./offline-package-builder.js";

const input = { day: { date: "2026-08-30", timezone: "America/Sao_Paulo" }, packageVersion: "1.0.0", generatedAt: "2026-08-30T12:00:00-03:00", checksum: "sha256:example", sourceEvidence: [{ sourceId: "fixture", contentHash: "hash", collectedAt: "2026-08-30T12:00:00-03:00", parserVersion: "1", decisionRule: "fixture" }], celebration: { title: "Celebração de teste", season: "Tempo Comum", color: "Verde", cycleYear: "B" as const, celebrationRank: "Domingo", readings: [{ type: "GOSPEL" as const, citation: "Referência fictícia" }], massFlow: [{ section: "introductory-rites" as const, note: "Orientação pessoal" }], selectedSongs: [], sourceReference: { booklet: "Livreto pessoal" } } };
describe("buildOfflineMassPackage", () => {
  it("builds an approved package from an approved decision", () => { const result = buildOfflineMassPackage({ ...input, decision: "APPROVED" }); expect(result).toMatchObject({ outcome: "built", package: { status: "APPROVED", day: input.day } }); });
  it("does not build a package from quarantined or rejected content", () => { expect(buildOfflineMassPackage({ ...input, decision: "QUARANTINED" })).toEqual({ outcome: "not-eligible", decision: "QUARANTINED" }); expect(buildOfflineMassPackage({ ...input, decision: "REJECTED" })).toEqual({ outcome: "not-eligible", decision: "REJECTED" }); });
});
