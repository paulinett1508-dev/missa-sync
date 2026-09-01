import { PrismaClient } from "@prisma/client";

export type ValidationSummary = { date: string; timezone: string; status: "PENDING" | "APPROVED" | "QUARANTINED" | "REJECTED" | "LOCAL_PRIVATE"; checksum: string; divergences: readonly string[]; validatorVersion: string; createdAt: string };
export type ValidationStore = { find(date: string, timezone: string): Promise<ValidationSummary | null> };

export const createPrismaValidationStore = (client: PrismaClient): ValidationStore => ({
  async find(date, timezone) {
    const result = await client.validationRun.findFirst({ where: { day: { date, timezone } }, orderBy: { createdAt: "desc" }, include: { day: true } });
    if (!result) return null;
    const evidence = typeof result.evidence === "object" && result.evidence !== null ? result.evidence as { divergences?: unknown } : {};
    const divergences = Array.isArray(evidence.divergences) ? evidence.divergences.filter((item): item is string => typeof item === "string") : [];
    return { date, timezone, status: result.status, checksum: result.day.checksum, divergences, validatorVersion: result.validatorVersion, createdAt: result.createdAt.toISOString() };
  },
});
