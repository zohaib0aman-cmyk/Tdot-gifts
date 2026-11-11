import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { HttpError, rateLimit } from "@/lib/auth";
import { saveMessage } from "@/lib/db";
import { sendContactNotice } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(80),
  email: z.email("Enter a valid email").max(160),
  phone: z.string().trim().max(30).optional(),
  topic: z.enum(["Custom surprise request", "Order question", "Corporate gifting", "Partnership", "Other"]),
  message: z.string().trim().min(10, "Message is a little short").max(3000),
  website: z.string().max(0).optional(), // honeypot
});

export const POST = route(async (req) => {
  if (!rateLimit(`ct:${clientIp(req)}`, 4)) throw new HttpError(429, "Too many messages — please try again shortly.");
  const d = await body(req, schema);
  await saveMessage({ name: d.name, email: d.email, phone: d.phone, topic: d.topic, message: d.message });
  await sendContactNotice(d.name, d.email, d.topic, d.message);
  return { ok: true };
});
