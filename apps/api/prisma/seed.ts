import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrivateLiturgicalImportSchema } from "@missa-sync/schemas/private-liturgical-import";

const prisma = new PrismaClient();
const fixturePath = resolve(process.cwd(), "../../data/fixtures/liturgical-day.sample.json");
const payload = PrivateLiturgicalImportSchema.parse(JSON.parse(await readFile(fixturePath, "utf8")));
const checksum = `sha256:${createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`;
try {
  const run = await prisma.collectionRun.findFirst({ where: { source: "LOCAL_PRIVATE" }, orderBy: { startedAt: "asc" } }) ?? await prisma.collectionRun.create({ data: { source: "LOCAL_PRIVATE" } });
  const snapshot = await prisma.rawSnapshot.upsert({ where: { checksum }, update: {}, create: { collectionRunId: run.id, checksum, storagePath: "data/private/raw-snapshots/fixture.json", collectedAt: new Date(), parserVersion: "private-import-v1" } });
  const day = await prisma.liturgicalDay.upsert({ where: { date_source_checksum: { date: payload.date, source: "LOCAL_PRIVATE", checksum } }, update: { celebrationTitle: payload.celebrationTitle, season: payload.season, color: payload.color, cycleYear: payload.cycleYear }, create: { date: payload.date, timezone: payload.timezone, source: "LOCAL_PRIVATE", checksum, celebrationTitle: payload.celebrationTitle, season: payload.season, color: payload.color, cycleYear: payload.cycleYear, rawSnapshotId: snapshot.id } });
  await prisma.reading.deleteMany({ where: { dayId: day.id } });
  await prisma.massSection.deleteMany({ where: { dayId: day.id } });
  await prisma.songEntry.deleteMany({ where: { dayId: day.id } });
  await prisma.reading.createMany({ data: payload.readings.map((item) => ({ dayId: day.id, kind: item.kind, reference: item.reference })) });
  await prisma.massSection.createMany({ data: payload.sections.map((item) => ({ dayId: day.id, sectionId: item.id, title: item.title, blocks: item.blocks })) });
  await prisma.songEntry.createMany({ data: payload.songs.map((item) => ({ dayId: day.id, moment: item.moment, title: item.title, notes: item.notes })) });
  await prisma.validationRun.deleteMany({ where: { dayId: day.id } });
  await prisma.validationRun.create({ data: { dayId: day.id, status: "APPROVED", evidence: { divergences: [], source: "LOCAL_PRIVATE", checksum }, validatorVersion: "private-import-v1" } });
  process.stdout.write(`${JSON.stringify({ date: day.date, timezone: day.timezone, checksum, status: "APPROVED" })}\n`);
} finally { await prisma.$disconnect(); }
