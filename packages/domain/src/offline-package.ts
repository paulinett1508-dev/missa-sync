import type { ContentStatus, LiturgicalDayRequest } from "./liturgical-day.js";

export type EligibleContentStatus = Extract<ContentStatus, "APPROVED" | "LOCAL_PRIVATE">;

export type SourceEvidence = { sourceId: string; contentHash: string; collectedAt: string; parserVersion: string; decisionRule: string; };

export type OfflineMassSection = {
  id: "introductory-rites" | "liturgy-of-the-word" | "liturgy-of-the-eucharist" | "concluding-rites";
  title: string;
  blocks: readonly string[];
};

export type OfflineMassPackage = {
  formatVersion: 1;
  day: LiturgicalDayRequest;
  status: EligibleContentStatus;
  packageVersion: string;
  generatedAt: string;
  checksum: string;
  sourceEvidence: readonly SourceEvidence[];
  celebration: { title: string; season: string; color: string; cycleYear: "A" | "B" | "C"; celebrationRank: string; readings: readonly { type: "FIRST_READING" | "PSALM" | "SECOND_READING" | "GOSPEL"; citation: string }[]; massFlow: readonly { section: OfflineMassSection["id"]; note?: string }[]; selectedSongs: readonly { title: string; moment: string; notes?: string }[]; personalNotes?: string; sourceReference: { booklet: string; page?: string; edition?: string } };
};
