import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { HttpError, rateLimit } from "@/lib/auth";
import { findGiftCard } from "@/lib/db";

export const POST = route(async (req) => {
  if (!rateLimit(`gcb:${clientIp(req)}`, 10)) throw new HttpError(429, "Too many attempts — please wait a minute.");
  const { code } = await body(req, z.object({ code: z.string().trim().min(6).max(40) }));
  const gc = await findGiftCard(code);
  if (!gc || !gc.active) throw new HttpError(404, "We couldn't find that gift card. Check the code and try again.");
  return { code: gc.code, balance: gc.balance, initialBalance: gc.initialBalance };
});
