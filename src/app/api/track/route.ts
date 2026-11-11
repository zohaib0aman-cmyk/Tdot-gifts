import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { HttpError, rateLimit } from "@/lib/auth";
import { findOrder } from "@/lib/db";

export const POST = route(async (req) => {
  if (!rateLimit(`trk:${clientIp(req)}`, 10)) throw new HttpError(429, "Too many attempts — please wait a minute.");
  const { number, email } = await body(req, z.object({ number: z.string().trim().min(3).max(20), email: z.email().max(160) }));
  const o = await findOrder(number.startsWith("GS-") || number.startsWith("gs-") ? number : `GS-${number}`, email);
  if (!o) throw new HttpError(404, "We couldn't find an order with that number and email.");
  return { id: o.id };
});
