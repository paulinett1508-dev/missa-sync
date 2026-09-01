import { resolve } from "node:path";
import { importPrivateLiturgicalDay } from "./private-import.js";
const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: pnpm --filter @missa-sync/worker private-import <path-to-private-json>");
const root = resolve(process.cwd(), "../..");
const resolvedInputPath = resolve(root, inputPath);
const result = await importPrivateLiturgicalDay(resolvedInputPath, { rawSnapshotDirectory: process.env.PRIVATE_RAW_SNAPSHOT_DIR ? resolve(root, process.env.PRIVATE_RAW_SNAPSHOT_DIR) : resolve(root, "storage/private/raw-snapshots"), packageDirectory: process.env.PRIVATE_PACKAGE_STORAGE_DIR ? resolve(root, process.env.PRIVATE_PACKAGE_STORAGE_DIR) : resolve(root, "storage/private/packages") });
process.stdout.write(`${JSON.stringify({ status: result.validated.status, checksum: result.validated.checksum, package: result.persistence?.outcome ?? null }, null, 2)}\n`);
