import type { OfflineMassPackage, SourceEvidence } from "@missa-sync/domain/offline-package";
import type { LiturgicalDayRequest } from "@missa-sync/domain/liturgical-day";
import type { ValidationDecision } from "@missa-sync/validators/content-status-validator";

export type PackageBuildInput = {
  decision: ValidationDecision;
  day: LiturgicalDayRequest;
  packageVersion: string;
  generatedAt: string;
  checksum: string;
  sourceEvidence: readonly SourceEvidence[];
  celebration: OfflineMassPackage["celebration"] | { title: string; sections: readonly { id: "introductory-rites" | "liturgy-of-the-word" | "liturgy-of-the-eucharist" | "concluding-rites"; title: string; blocks: readonly string[] }[] };
};

export type PackageBuildResult =
  | { outcome: "built"; package: OfflineMassPackage }
  | { outcome: "not-eligible"; decision: Exclude<ValidationDecision, "APPROVED"> };

export const buildOfflineMassPackage = (input: PackageBuildInput): PackageBuildResult => {
  if (input.decision !== "APPROVED") return { outcome: "not-eligible", decision: input.decision };
  const celebration = "sections" in input.celebration ? { title: input.celebration.title, season: "", color: "", cycleYear: "A" as const, celebrationRank: "", readings: [], massFlow: input.celebration.sections.map((item) => ({ section: item.id, note: item.blocks.join(" ") })), selectedSongs: [], sourceReference: { booklet: "legacy-package" } } : input.celebration;
  return { outcome: "built", package: { formatVersion: 1, day: input.day, status: "APPROVED", packageVersion: input.packageVersion, generatedAt: input.generatedAt, checksum: input.checksum, sourceEvidence: input.sourceEvidence, celebration } };
};
