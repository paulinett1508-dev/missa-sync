import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createSessionToken, sessionCookie, verifyPassword } from "./local-auth.js";

export const registerLocalAuthRoute = (app: FastifyInstance, passwordSalt: string, passwordHash: string, sessionSecret: string): void => {
  app.post("/v1/auth/session", async (request, reply) => {
    const parsed = z.object({ password: z.string().min(1) }).safeParse(request.body);
    if (!parsed.success || !await verifyPassword(parsed.data.password, passwordSalt, passwordHash)) return reply.code(401).send({ code: "INVALID_CREDENTIALS" });
    return reply.header("set-cookie", sessionCookie(createSessionToken(sessionSecret))).code(204).send();
  });
};
