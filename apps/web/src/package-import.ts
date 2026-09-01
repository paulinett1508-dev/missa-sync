import { offlineMassPackageSchema } from "@missa-sync/schemas/offline-package";
import { offlineDatabase, type OfflinePackage } from "./offline.js";

export type PackageImportResult =
  | { outcome: "imported" | "unchanged"; package: OfflinePackage }
  | { outcome: "invalid"; message: string };

export type EligiblePackageStore = {
  get: (id: string) => Promise<OfflinePackage | undefined>;
  put: (value: OfflinePackage) => Promise<unknown>;
};

export const importOfflinePackageToStore = async (input: unknown, store: EligiblePackageStore): Promise<PackageImportResult> => {
  const parsed = offlineMassPackageSchema.safeParse(input);
  if (!parsed.success) return { outcome: "invalid", message: "O arquivo não corresponde ao contrato de pacote offline." };

  const content = parsed.data;
  const id = `${content.day.date}:${content.day.timezone}`;
  const existing = await store.get(id);
  if (existing && existing.checksum === content.checksum) return { outcome: "unchanged", package: existing };

  const storedPackage: OfflinePackage = {
    id,
    date: content.day.date,
    timezone: content.day.timezone,
    status: content.status,
    version: content.packageVersion,
    generatedAt: content.generatedAt,
    checksum: content.checksum,
    sourceEvidence: content.sourceEvidence,
    content,
  };
  await store.put(storedPackage);
  return { outcome: "imported", package: storedPackage };
};

export const importOfflinePackage = (input: unknown): Promise<PackageImportResult> => importOfflinePackageToStore(input, offlineDatabase.eligiblePackages);
