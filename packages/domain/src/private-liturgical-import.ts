import type { ContentStatus, LiturgicalDayRequest } from "./liturgical-day.js";
export type ReadingReference = { type: "FIRST_READING" | "PSALM" | "SECOND_READING" | "GOSPEL"; citation: string };
export type MassSection = { section: "introductory-rites" | "liturgy-of-the-word" | "liturgy-of-the-eucharist" | "concluding-rites"; note?: string };
export type SongEntry = { title: string; moment: string; notes?: string };
export type SourceReference = { booklet: string; page?: string; edition?: string };
export type PrivateLiturgicalImport = { day: LiturgicalDayRequest; celebrationTitle: string; season: string; color: string; cycleYear: "A" | "B" | "C"; celebrationRank: string; readings: readonly ReadingReference[]; massFlow: readonly MassSection[]; selectedSongs: readonly SongEntry[]; personalNotes?: string; sourceReference: SourceReference; source: "LOCAL_PRIVATE"; status: "PENDING" };
export type ValidationDivergence = { code: string; message: string; severity: "CRITICAL" | "WARNING" };
export type ValidatedPackage = { import: PrivateLiturgicalImport; status: ContentStatus; checksum: string; sourceEvidence: readonly { sourceId: string; contentHash: string; collectedAt: string; parserVersion: string; decisionRule: string }[]; divergences: readonly ValidationDivergence[] };
