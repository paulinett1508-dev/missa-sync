import { createHash } from "node:crypto";
import { Queue, type ConnectionOptions } from "bullmq";
import type { PackageBuildInput } from "./offline-package-builder.js";

export const packageProductionQueueName = "package-production";
export const packageProductionJobName = "produce-offline-package";

export const packageProductionJobId = (input: PackageBuildInput): string => {
  const identity = `${input.day.date}|${input.day.timezone}|${input.checksum}|${input.decision}`;
  return `package-${createHash("sha256").update(identity).digest("hex")}`;
};

export const enqueuePackageProduction = async (queue: Queue<PackageBuildInput>, input: PackageBuildInput) => queue.add(packageProductionJobName, input, {
  jobId: packageProductionJobId(input), attempts: 3, backoff: { type: "exponential", delay: 1_000 }, removeOnComplete: 100, removeOnFail: 1_000,
});

export const redisConnectionFromUrl = (value: string): ConnectionOptions => {
  const url = new URL(value);
  if (url.protocol !== "redis:" && url.protocol !== "rediss:") throw new Error("REDIS_URL must use redis:// or rediss://.");
  const database = url.pathname === "" || url.pathname === "/" ? 0 : Number(url.pathname.slice(1));
  if (!Number.isInteger(database) || database < 0) throw new Error("REDIS_URL has an invalid database number.");
  return { host: url.hostname, port: Number(url.port || 6379), db: database, ...(url.username ? { username: decodeURIComponent(url.username) } : {}), ...(url.password ? { password: decodeURIComponent(url.password) } : {}), ...(url.protocol === "rediss:" ? { tls: {} } : {}) };
};
