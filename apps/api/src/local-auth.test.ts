import { describe, expect, it } from "vitest";
import { createPasswordHash, createSessionToken, verifyPassword, verifySessionToken } from "./local-auth.js";

describe("local auth", () => {
  it("verifies the configured password hash and expires sessions", async () => {
    const hash = await createPasswordHash("secret", "salt");
    expect(await verifyPassword("secret", "salt", hash)).toBe(true);
    expect(await verifyPassword("wrong", "salt", hash)).toBe(false);
    const token = createSessionToken("session-secret", 0);
    expect(verifySessionToken(token, "session-secret", 1)).toBe(true);
    expect(verifySessionToken(token, "session-secret", 1000 * 60 * 60 * 9)).toBe(false);
  });
});
