import { describe, expect, it } from "vitest";
import { clampSectionIndex, massSections, progressForSection } from "./mass-flow.js";

describe("mass flow", () => {
  it("keeps manual navigation within the rite", () => {
    expect(clampSectionIndex(-1)).toBe(0);
    expect(clampSectionIndex(2)).toBe(2);
    expect(clampSectionIndex(99)).toBe(massSections.length - 1);
  });

  it("reports progress from the first to the final section", () => {
    expect(progressForSection(0)).toBe(25);
    expect(progressForSection(massSections.length - 1)).toBe(100);
  });
});
