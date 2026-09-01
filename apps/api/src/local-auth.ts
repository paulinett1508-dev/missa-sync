import { createHmac, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const sessionMaxAgeSeconds = 60 * 60 * 8;

export const createPasswordHash = async (password: string, salt: string): Promise<string> => {
  const derived = await scrypt(password, salt, 64);
  if (!Buffer.isBuffer(derived)) throw new Error("Password hash derivation did not return a buffer.");
  return derived.toString("base64");
};

export const verifyPassword = async (password: string, salt: string, expectedHash: string): Promise<boolean> => {
  const actual = Buffer.from(await createPasswordHash(password, salt), "base64");
  const expected = Buffer.from(expectedHash, "base64");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export const createSessionToken = (secret: string, now = Date.now()): string => {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(now / 1_000) + sessionMaxAgeSeconds })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

export const verifySessionToken = (token: string | undefined, secret: string, now = Date.now()): boolean => {
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { const value: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); return typeof value === "object" && value !== null && "exp" in value && typeof value.exp === "number" && value.exp > Math.floor(now / 1_000); } catch { return false; }
};

export const sessionCookie = (token: string): string => `missa_sync_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionMaxAgeSeconds}`;
