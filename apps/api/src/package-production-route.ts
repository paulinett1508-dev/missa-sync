import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { packageProductionRequestSchema } from "@missa-sync/schemas/offline-package";
import { validateContentStatus } from "@missa-sync/validators/content-status-validator";
import type { PackageBuildInput } from "@missa-sync/package-builder/offline-package-builder";
import type { PrivateAuditWriter } from "@missa-sync/shared/private-audit-log";

export type PackageProductionEnqueuer = { enqueue: (input: PackageBuildInput) => Promise<{ id?: string | undefined }>; };

export const hasValidBearerToken = (authorization: string | undefined, expectedToken: string): boolean => {
  const value = authorization?.match(/^Bearer\s+(.+)$/)?.[1];
  if (!value) return false;
  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expectedToken);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
};

export const registerPackageProductionRoute = (app: FastifyInstance, enqueuer: PackageProductionEnqueuer, ingestToken: string, auditWriter: PrivateAuditWriter): void => {
  app.post("/v1/internal/packages", async (request, reply) => {
    if (!hasValidBearerToken(request.headers.authorization, ingestToken)) return reply.code(401).send({ code: "UNAUTHORIZED" });
    const parsed = packageProductionRequestSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ code: "INVALID_PACKAGE_PRODUCTION_REQUEST", issues: parsed.error.issues });

    const { validationEvidence, ...packageData } = parsed.data;
    const decision = validateContentStatus(validationEvidence);
    const job = await enqueuer.enqueue({ ...packageData, decision });
    await auditWriter.write({ event: "PACKAGE_ENQUEUED", occurredAt: new Date().toISOString(), attributes: { jobId: job.id ?? null, decision, date: packageData.day.date, timezone: packageData.day.timezone, checksum: packageData.checksum, validationEvidence, sourceEvidence: packageData.sourceEvidence } });
    return reply.code(202).send({ jobId: job.id, decision });
  });
};
