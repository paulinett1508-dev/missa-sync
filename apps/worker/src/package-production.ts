import { buildOfflineMassPackage, type PackageBuildInput, type PackageBuildResult } from "@missa-sync/package-builder/offline-package-builder";
import type { OfflineMassPackage } from "@missa-sync/domain/offline-package";

export type OfflinePackageDestination = {
  write: (offlinePackage: OfflineMassPackage) => Promise<void>;
};

export const produceOfflinePackage = async (input: PackageBuildInput, destination: OfflinePackageDestination): Promise<PackageBuildResult> => {
  const result = buildOfflineMassPackage(input);
  if (result.outcome === "not-eligible") return result;

  await destination.write(result.package);
  return result;
};
