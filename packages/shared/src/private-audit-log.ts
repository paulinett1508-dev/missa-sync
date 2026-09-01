import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join, resolve } from "node:path";

export type PrivateAuditRecord = { event: string; occurredAt: string; attributes: Record<string, unknown>; };
export type PrivateAuditWriter = { write: (record: PrivateAuditRecord) => Promise<string>; };

export const createPrivateAuditWriter = (directory: string): PrivateAuditWriter => ({
  write: async (record) => {
    const targetDirectory = resolve(directory);
    await mkdir(targetDirectory, { recursive: true });
    const eventId = randomUUID();
    const target = join(targetDirectory, `${record.occurredAt.replaceAll(/[:.]/g, "-")}-${eventId}.json`);
    const temporary = `${target}.tmp`;
    await writeFile(temporary, `${JSON.stringify({ eventId, ...record }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await rename(temporary, target);
    return target;
  },
});

export const readPrivateAuditRecords = async (directory: string, date: string, timezone: string): Promise<PrivateAuditRecord[]> => {
  try {
    const entries = await readdir(resolve(directory));
    const records = await Promise.all(entries.filter((entry) => entry.endsWith(".json")).map(async (entry) => JSON.parse(await readFile(join(directory, entry), "utf8")) as PrivateAuditRecord));
    return records.filter((record) => record.attributes.date === date && record.attributes.timezone === timezone);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
};
