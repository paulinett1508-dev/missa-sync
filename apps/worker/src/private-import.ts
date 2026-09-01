import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { PrivateLiturgicalImportSchema, type PrivateLiturgicalImportInput } from "@missa-sync/schemas/private-liturgical-import";
import type { ValidatedPackage, ValidationDivergence } from "@missa-sync/domain/private-liturgical-import";
import type { OfflineMassPackage } from "@missa-sync/domain/offline-package";
import { storePrivatePackage, type PrivatePackageWriteResult } from "./private-package-store.js";

const parserVersion = "private-import-v1";
export type RawSnapshot = { path: string; checksum: string; collectedAt: string; sourceFile: string };
export type CalendarValidation = { divergences: readonly ValidationDivergence[] };
export type CanonicalCalendar = { validate(day: PrivateLiturgicalImportInput): CalendarValidation };
export const permissiveCalendar: CanonicalCalendar = { validate: () => ({ divergences: [] }) };

const canonicalJson = (value: unknown): string => JSON.stringify(value, (_key, item: unknown) => {
  if (item && typeof item === "object" && !Array.isArray(item)) return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)));
  return item;
});
const checksumOf = (value: unknown): string => `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
export const createRawSnapshot = async (payload: unknown, metadata: { sourceFile: string; storageDirectory: string; collectedAt?: string }): Promise<RawSnapshot> => {
  const checksum = checksumOf(payload);
  const directory = resolve(metadata.storageDirectory);
  await mkdir(directory, { recursive: true });
  const path = join(directory, `${checksum.slice("sha256:".length)}.json`);
  try { await readFile(path, "utf8"); } catch (error: unknown) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT")) throw error;
    await writeFile(path, `${JSON.stringify({ metadata: { sourceFile: basename(metadata.sourceFile), collectedAt: metadata.collectedAt ?? new Date().toISOString(), parserVersion }, payload }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  }
  return { path, checksum, collectedAt: metadata.collectedAt ?? new Date().toISOString(), sourceFile: basename(metadata.sourceFile) };
};

export const normalizePrivateImport = (snapshot: { payload: unknown }): PrivateLiturgicalImportInput => {
  const parsed = PrivateLiturgicalImportSchema.safeParse(snapshot.payload);
  if (!parsed.success) throw new Error(`INVALID_PRIVATE_IMPORT:${parsed.error.issues.map((issue) => issue.path.join(".")).join(",")}`);
  const input = parsed.data;
  return { ...input, readings: [...input.readings], massFlow: [...input.massFlow], selectedSongs: [...input.selectedSongs] };
};

export const validateLiturgicalDay = (normalizedDay: PrivateLiturgicalImportInput, checksum: string, collectedAt: string, calendar: CanonicalCalendar = permissiveCalendar): ValidatedPackage => {
  const divergences: ValidationDivergence[] = [...calendar.validate(normalizedDay).divergences];
  if (normalizedDay.massFlow.length === 0) divergences.push({ code: "MASS_FLOW_MISSING", message: "At least one Mass section note is required.", severity: "CRITICAL" });
  if (!normalizedDay.readings.some((reading) => reading.type === "GOSPEL")) divergences.push({ code: "GOSPEL_MISSING", message: "A Gospel reference is required.", severity: "CRITICAL" });
  const status = divergences.some((item) => item.severity === "CRITICAL") ? "REJECTED" : divergences.length > 0 ? "QUARANTINED" : "APPROVED";
  const { date, timezone, ...details } = normalizedDay;
  return { import: { ...details, day: { date, timezone } }, status, checksum, divergences, sourceEvidence: [{ sourceId: "local-private", contentHash: checksum, collectedAt, parserVersion, decisionRule: status === "APPROVED" ? "private-metadata-minimum-rules" : "private-metadata-rules-with-divergences" }] };
};

export const buildOfflinePackage = (validatedDay: ValidatedPackage, generatedAt = new Date().toISOString()): OfflineMassPackage | null => {
  if (validatedDay.status !== "APPROVED" && validatedDay.status !== "LOCAL_PRIVATE") return null;
  return { formatVersion: 1, day: validatedDay.import.day, status: validatedDay.status, packageVersion: "1.0.0", generatedAt, checksum: validatedDay.checksum, sourceEvidence: validatedDay.sourceEvidence, celebration: { title: validatedDay.import.celebrationTitle, season: validatedDay.import.season, color: validatedDay.import.color, cycleYear: validatedDay.import.cycleYear, celebrationRank: validatedDay.import.celebrationRank, readings: validatedDay.import.readings, massFlow: validatedDay.import.massFlow, selectedSongs: validatedDay.import.selectedSongs, personalNotes: validatedDay.import.personalNotes, sourceReference: validatedDay.import.sourceReference } };
};

export const persistPackage = async (offlinePackage: OfflineMassPackage, storageDirectory: string): Promise<PrivatePackageWriteResult> => storePrivatePackage(storageDirectory, offlinePackage);

export const importPrivateLiturgicalDay = async (inputPath: string, options: { rawSnapshotDirectory: string; packageDirectory: string; calendar?: CanonicalCalendar; collectedAt?: string } ): Promise<{ snapshot: RawSnapshot; validated: ValidatedPackage; package: OfflineMassPackage | null; persistence?: PrivatePackageWriteResult }> => {
  const payload: unknown = JSON.parse(await readFile(inputPath, "utf8"));
  const snapshot = await createRawSnapshot(payload, { sourceFile: inputPath, storageDirectory: options.rawSnapshotDirectory, collectedAt: options.collectedAt });
  let normalized: PrivateLiturgicalImportInput;
  try { normalized = normalizePrivateImport({ payload }); } catch {
    const fallback = { date: "1970-01-01", timezone: "UTC" };
    return { snapshot, validated: { import: { day: fallback, celebrationTitle: "", season: "", color: "", cycleYear: "A", celebrationRank: "", readings: [], massFlow: [], selectedSongs: [], sourceReference: { booklet: "invalid" }, source: "LOCAL_PRIVATE", status: "PENDING" }, status: "REJECTED", checksum: snapshot.checksum, divergences: [{ code: "IMPORT_SCHEMA_INVALID", message: "Private import does not satisfy the required schema.", severity: "CRITICAL" }], sourceEvidence: [{ sourceId: "local-private", contentHash: snapshot.checksum, collectedAt: snapshot.collectedAt, parserVersion, decisionRule: "schema-rejection" }] }, package: null };
  }
  const validated = validateLiturgicalDay(normalized, snapshot.checksum, snapshot.collectedAt, options.calendar);
  const offlinePackage = buildOfflinePackage(validated, snapshot.collectedAt);
  const persistence = offlinePackage ? await persistPackage(offlinePackage, options.packageDirectory) : undefined;
  return { snapshot, validated, package: offlinePackage, persistence };
};
