import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { endAdminSession, HttpError, rateLimit, safeEqual, startAdminSession } from "@/lib/auth";
import { env } from "@/lib/env";

export const POST = route(async (req) => {
  if (!rateLimit(`adm:${clientIp(req)}`, 6, 5 * 60_000)) throw new HttpError(429, "Too many login attempts. Try again in a few minutes.");
  const { email, password } = await body(req, z.object({ email: z.email().max(160), password: z.string().min(1).max(200) }));
  const ok = safeEqual(email.toLowerCase(), env.adminEmail) && safeEqual(password, env.adminPassword);
  if (!ok) throw new HttpError(401, "Incorrect email or password.");
  await startAdminSession(email.toLowerCase());
  return { ok: true };
});

export const DELETE = route(async () => { await endAdminSession(); return { ok: true }; });
