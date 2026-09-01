import { describe, expect, it } from "vitest";
import { validateContentStatus } from "./content-status-validator.js";

const matchingEvidence = { gospelMatches: true, titleMatches: true, celebrationMatches: true, cycleMatches: true, precedenceMatches: true, referencesMatch: true };

describe("validateContentStatus", () => {
  it("rejects a Gospel divergence", () => expect(validateContentStatus({ ...matchingEvidence, gospelMatches: false })).toBe("REJECTED"));
  it("quarantines a celebration divergence", () => expect(validateContentStatus({ ...matchingEvidence, celebrationMatches: false })).toBe("QUARANTINED"));
  it("quarantines a title or reference divergence", () => expect(validateContentStatus({ ...matchingEvidence, titleMatches: false })).toBe("QUARANTINED"));
  it("approves matching evidence", () => expect(validateContentStatus(matchingEvidence)).toBe("APPROVED"));
});
