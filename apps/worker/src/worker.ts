import pino from "pino";
import { resolve } from "node:path";
import { createPrivatePackageDestination } from "./private-package-store.js";
import { createPackageProductionWorker, redisConnectionFromUrl } from "./package-production-job.js";
import { createPrivateAuditWriter } from "@missa-sync/shared/private-audit-log";

const logger = pino();
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("REDIS_URL is required to start the worker.");

const packageStorageDirectory = process.env.PRIVATE_PACKAGE_STORAGE_DIR ?? resolve(process.cwd(), "storage/private/packages");
const auditStorageDirectory = process.env.PRIVATE_AUDIT_STORAGE_DIR ?? resolve(process.cwd(), "storage/private/audit");
const worker = createPackageProductionWorker(redisConnectionFromUrl(redisUrl), createPrivatePackageDestination(packageStorageDirectory, createPrivateAuditWriter(auditStorageDirectory)));
worker.on("completed", (job) => logger.info({ event: "package_production_completed", jobId: job.id }, "Offline package production completed"));
worker.on("failed", (job, error) => logger.error({ event: "package_production_failed", jobId: job?.id, error }, "Offline package production failed"));
logger.info({ event: "worker_started", packageStorageDirectory }, "Worker started with offline package production");

process.on("SIGTERM", () => {
  void worker.close().then(() => {
    logger.info({ event: "worker_stopped" }, "Worker stopped");
    process.exit(0);
  });
});
