import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { HttpError, rateLimit } from "@/lib/auth";
import { addSubscriber } from "@/lib/db";

export const POST = route(async (req) => {
  if (!rateLimit(`nl:${clientIp(req)}`, 5)) throw new HttpError(429, "Too many attempts — please try again in a minute.");
  const { email } = await body(req, z.object({ email: z.email("Please enter a valid email.").max(160) }));
  return addSubscriber(email);
});
