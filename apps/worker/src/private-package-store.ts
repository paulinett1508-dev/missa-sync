import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { offlineMassPackageSchema } from "@missa-sync/schemas/offline-package";
import type { OfflineMassPackage } from "@missa-sync/domain/offline-package";
import type { OfflinePackageDestination } from "./package-production.js";
import type { PrivateAuditWriter } from "@missa-sync/shared/private-audit-log";

type PrivatePackageIndexEntry = {
  date: string;
  timezone: string;
  checksum: string;
  fileName: string;
  status: "APPROVED" | "LOCAL_PRIVATE";
  packageVersion: string;
};

type PrivatePackageIndex = {
  formatVersion: 1;
  packages: Record<string, PrivatePackageIndexEntry>;
};

export type PrivatePackageWriteResult = { outcome: "stored" | "unchanged"; filePath: string };

const indexFileName = "index.json";
const isSafeTimezone = (timezone: string): boolean => /^[A-Za-z0-9_+\-/]+$/.test(timezone) && !timezone.includes("..");
const packageKey = (date: string, timezone: string): string => `${date}|${timezone}`;
const packageFileName = (date: string, timezone: string): string => `${date}__${timezone.replaceAll("/", "_")}.json`;

const ensureInsideDirectory = (directory: string, path: string): string => {
  const resolvedDirectory = resolve(directory);
  const resolvedPath = resolve(path);
  if (relative(resolvedDirectory, resolvedPath).startsWith("..")) throw new Error("Private package path escapes storage directory.");
  return resolvedPath;
};

const writeAtomically = async (path: string, data: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, data, { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, path);
};

const readIndex = async (path: string): Promise<PrivatePackageIndex> => {
  try {
    const value: unknown = JSON.parse(await readFile(path, "utf8"));
    if (typeof value !== "object" || value === null || !("packages" in value) || typeof value.packages !== "object" || value.packages === null) throw new Error("Invalid private package index.");
    return { formatVersion: 1, packages: value.packages as Record<string, PrivatePackageIndexEntry> };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return { formatVersion: 1, packages: {} };
    throw error;
  }
};

export const storePrivatePackage = async (storageDirectory: string, offlinePackage: OfflineMassPackage): Promise<PrivatePackageWriteResult> => {
  const parsed = offlineMassPackageSchema.safeParse(offlinePackage);
  if (!parsed.success) throw new Error("Refusing to persist an invalid offline package.");

  const content = parsed.data;
  if (!isSafeTimezone(content.day.timezone)) throw new Error("Refusing an unsafe timezone path.");

  const directory = resolve(storageDirectory);
  const fileName = packageFileName(content.day.date, content.day.timezone);
  const filePath = ensureInsideDirectory(directory, resolve(directory, fileName));
  const indexPath = ensureInsideDirectory(directory, resolve(directory, indexFileName));
  const index = await readIndex(indexPath);
  const key = packageKey(content.day.date, content.day.timezone);

  if (index.packages[key]?.checksum === content.checksum) return { outcome: "unchanged", filePath };

  await writeAtomically(filePath, `${JSON.stringify(content, null, 2)}\n`);
  index.packages[key] = { date: content.day.date, timezone: content.day.timezone, checksum: content.checksum, fileName, status: content.status, packageVersion: content.packageVersion };
  await writeAtomically(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  return { outcome: "stored", filePath };
};

export const createPrivatePackageDestination = (storageDirectory: string, auditWriter: PrivateAuditWriter): OfflinePackageDestination => ({
  write: async (offlinePackage) => {
    const result = await storePrivatePackage(storageDirectory, offlinePackage);
    await auditWriter.write({ event: "PACKAGE_PERSISTED", occurredAt: new Date().toISOString(), attributes: { outcome: result.outcome, filePath: result.filePath, date: offlinePackage.day.date, timezone: offlinePackage.day.timezone, checksum: offlinePackage.checksum, status: offlinePackage.status, sourceEvidence: offlinePackage.sourceEvidence } });
  },
});
