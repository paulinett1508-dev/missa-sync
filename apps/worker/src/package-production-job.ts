import { Worker, type ConnectionOptions } from "bullmq";
import type { PackageBuildInput, PackageBuildResult } from "@missa-sync/package-builder/offline-package-builder";
import { packageProductionQueueName, redisConnectionFromUrl } from "@missa-sync/package-builder/package-production-queue";
import { produceOfflinePackage, type OfflinePackageDestination } from "./package-production.js";

export const createPackageProductionWorker = (connection: ConnectionOptions, destination: OfflinePackageDestination): Worker<PackageBuildInput, PackageBuildResult> => new Worker(
  packageProductionQueueName,
  async (job) => produceOfflinePackage(job.data, destination),
  { connection, concurrency: 1 },
);

export { redisConnectionFromUrl };
