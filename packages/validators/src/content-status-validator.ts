export type ValidationInput = {
  gospelMatches: boolean;
  titleMatches: boolean;
  celebrationMatches: boolean;
  cycleMatches: boolean;
  precedenceMatches: boolean;
  referencesMatch: boolean;
};

export type ValidationDecision = "APPROVED" | "QUARANTINED" | "REJECTED";

export const validateContentStatus = (input: ValidationInput): ValidationDecision => {
  if (!input.gospelMatches) return "REJECTED";
  if (!input.titleMatches || !input.celebrationMatches || !input.cycleMatches || !input.precedenceMatches || !input.referencesMatch) return "QUARANTINED";
  return "APPROVED";
};
