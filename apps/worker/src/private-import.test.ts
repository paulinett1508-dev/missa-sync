import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { importPrivateLiturgicalDay, validateLiturgicalDay } from "./private-import.js";

const fixture = resolve(process.cwd(), "../../data/fixtures/private-liturgical-import.sample.json");
describe("private liturgical import", () => {
  it("approves a valid synthetic import and is idempotent by checksum", async () => {
    const directory = await mkdtemp(join(tmpdir(), "missa-private-import-"));
    try {
      const input = join(directory, "input.json"); await cp(fixture, input);
      const options = { rawSnapshotDirectory: join(directory, "raw"), packageDirectory: join(directory, "packages"), collectedAt: "2026-08-23T12:00:00-03:00" };
      const first = await importPrivateLiturgicalDay(input, options); const second = await importPrivateLiturgicalDay(input, options);
      expect(first.validated.status).toBe("APPROVED"); expect(second.persistence?.outcome).toBe("unchanged"); expect(JSON.parse(await readFile(first.snapshot.path, "utf8"))).toHaveProperty("payload");
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
  it("quarantines an incompatible weekday and rejects a missing Gospel", () => {
    const base = { date: "2026-08-23", timezone: "America/Sao_Paulo", celebrationTitle: "Example", season: "Ordinary", color: "Green", cycleYear: "B" as const, celebrationRank: "Sunday", readings: [{ type: "FIRST_READING" as const, citation: "Example 1" }], massFlow: [{ section: "introductory-rites" as const, note: "Own note" }], selectedSongs: [], personalNotes: "Note", sourceReference: { booklet: "Personal booklet" }, source: "LOCAL_PRIVATE" as const, status: "PENDING" as const };
    expect(validateLiturgicalDay(base, "sha256:abc", "2026-08-23T12:00:00-03:00").status).toBe("REJECTED");
    expect(validateLiturgicalDay({ ...base, readings: [...base.readings, { type: "GOSPEL", citation: "Example 2" }] }, "sha256:abc", "2026-08-23T12:00:00-03:00").status).toBe("APPROVED");
  });
});
