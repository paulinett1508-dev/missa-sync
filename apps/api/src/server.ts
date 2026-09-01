import Fastify from "fastify";
import { Queue } from "bullmq";
import { enqueuePackageProduction, packageProductionQueueName, redisConnectionFromUrl } from "@missa-sync/package-builder/package-production-queue";
import { registerPackageProductionRoute } from "./package-production-route.js";
import { createPrivateAuditWriter } from "@missa-sync/shared/private-audit-log";
import { resolve } from "node:path";
import { registerAuditRoute } from "./audit-route.js";
import { registerLocalAuthRoute } from "./local-auth-route.js";
import { registerPackageSyncRoute } from "./package-sync-route.js";
import { registerPrivateImportRoutes } from "./private-import-route.js";
import { PrismaClient } from "@prisma/client";
import { createPrismaValidationStore } from "./validation-store.js";
import { MockCalendarProvider, RomcalCalendarProvider } from "@missa-sync/calendar";
import { registerDayRoute } from "./day-route.js";
import { registerLiturgiaRoute } from "./liturgia-route.js";

const app = Fastify({ logger: true });
const webOrigin = process.env.WEB_ORIGIN ?? "https://missal.flowdigitalstudio.com.br";
app.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", webOrigin);
  reply.header("Access-Control-Allow-Credentials", "true");
  reply.header("Access-Control-Allow-Headers", "content-type, authorization");
  reply.header("Vary", "Origin");
  if (request.method === "OPTIONS") return reply.code(204).send();
});
const port = Number(process.env.API_PORT ?? 3001);
const redisUrl = process.env.REDIS_URL;
const ingestToken = process.env.INTERNAL_INGEST_TOKEN;
const passwordSalt = process.env.LOCAL_AUTH_PASSWORD_SALT;
const passwordHash = process.env.LOCAL_AUTH_PASSWORD_HASH;
const sessionSecret = process.env.LOCAL_AUTH_SESSION_SECRET;
if (!redisUrl || !ingestToken || !passwordSalt || !passwordHash || !sessionSecret) throw new Error("REDIS_URL, INTERNAL_INGEST_TOKEN and local auth variables are required to start the API.");
const packageQueue = new Queue(packageProductionQueueName, { connection: redisConnectionFromUrl(redisUrl) });
const prisma = new PrismaClient();
const packageStorageDirectory = process.env.PRIVATE_PACKAGE_STORAGE_DIR ?? resolve(process.cwd(), "storage/private/packages");

app.get("/health", async () => ({ status: "ok" }));
registerLocalAuthRoute(app, passwordSalt, passwordHash, sessionSecret);
registerPackageSyncRoute(app, sessionSecret, packageStorageDirectory, process.env.NODE_ENV === "production" ? undefined : process.env.DEVELOPMENT_PRIVATE_API_TOKEN);
registerPrivateImportRoutes(app, { sessionSecret, developmentToken: process.env.NODE_ENV === "production" ? undefined : process.env.DEVELOPMENT_PRIVATE_API_TOKEN, importDirectory: resolve(process.cwd(), process.env.PRIVATE_IMPORT_DIRECTORY ?? "data/private/imports"), validationStore: createPrismaValidationStore(prisma) });

registerDayRoute(app, new RomcalCalendarProvider(new MockCalendarProvider()));
registerLiturgiaRoute(app);

const auditDirectory = process.env.PRIVATE_AUDIT_STORAGE_DIR ?? resolve(process.cwd(), "storage/private/audit");
registerPackageProductionRoute(app, { enqueue: (input) => enqueuePackageProduction(packageQueue, input) }, ingestToken, createPrivateAuditWriter(auditDirectory));
registerAuditRoute(app, ingestToken, auditDirectory);
app.addHook("onClose", async () => { await packageQueue.close(); await prisma.$disconnect(); });

void app.listen({ host: "0.0.0.0", port });
