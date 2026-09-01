import { Dexie, type EntityTable } from "dexie";
import type { OfflineMassPackageInput } from "@missa-sync/schemas/offline-package";

export type OfflinePackage = {
  id: string;
  date: string;
  timezone: string;
  status: "APPROVED" | "LOCAL_PRIVATE";
  version: string;
  generatedAt: string;
  checksum: string;
  sourceEvidence: OfflineMassPackageInput["sourceEvidence"];
  content: OfflineMassPackageInput;
};

export const offlineDatabase = new Dexie("missa-sync") as Dexie & {
  packages: EntityTable<OfflinePackage, "date">;
  eligiblePackages: EntityTable<OfflinePackage, "id">;
};

offlineDatabase.version(1).stores({ packages: "date" });
offlineDatabase.version(2).stores({ packages: "date", eligiblePackages: "id, [date+timezone], date, timezone, status" });
