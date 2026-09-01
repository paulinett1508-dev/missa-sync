import { z } from "zod";

const timezoneSchema = z.string().min(1).refine((value) => {
  try { new Intl.DateTimeFormat("en-US", { timeZone: value }); return true; } catch { return false; }
}, "Invalid IANA timezone");

const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}, "Invalid calendar date");

export const offlineMassPackageSchema = z.object({
  formatVersion: z.literal(1),
  day: z.object({ date: calendarDateSchema, timezone: timezoneSchema }),
  status: z.enum(["APPROVED", "LOCAL_PRIVATE"]),
  packageVersion: z.string().min(1),
  generatedAt: z.string().datetime({ offset: true }),
  checksum: z.string().min(1),
  sourceEvidence: z.array(z.object({ sourceId: z.string().min(1), contentHash: z.string().min(1), collectedAt: z.string().datetime({ offset: true }), parserVersion: z.string().min(1), decisionRule: z.string().min(1) })).min(1),
  celebration: z.object({ title: z.string().min(1), season: z.string().min(1), color: z.string().min(1), cycleYear: z.enum(["A", "B", "C"]), celebrationRank: z.string().min(1), readings: z.array(z.object({ type: z.enum(["FIRST_READING", "PSALM", "SECOND_READING", "GOSPEL"]), citation: z.string().min(1) })), massFlow: z.array(z.object({ section: z.enum(["introductory-rites", "liturgy-of-the-word", "liturgy-of-the-eucharist", "concluding-rites"]), note: z.string().optional() })), selectedSongs: z.array(z.object({ title: z.string().min(1), moment: z.string().min(1), notes: z.string().optional() })), personalNotes: z.string().optional(), sourceReference: z.object({ booklet: z.string().min(1), page: z.string().optional(), edition: z.string().optional() }) }),
});

export type OfflineMassPackageInput = z.infer<typeof offlineMassPackageSchema>;

export const packageProductionRequestSchema = offlineMassPackageSchema
  .omit({ formatVersion: true, status: true })
  .extend({ validationEvidence: z.object({ gospelMatches: z.boolean(), titleMatches: z.boolean(), celebrationMatches: z.boolean(), cycleMatches: z.boolean(), precedenceMatches: z.boolean(), referencesMatch: z.boolean() }) });

export type PackageProductionRequest = z.infer<typeof packageProductionRequestSchema>;
