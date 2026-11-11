import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { HttpError, rateLimit } from "@/lib/auth";
import { getProductById, newId, saveReview } from "@/lib/db";

const schema = z.object({
  productId: z.string().min(1).max(64),
  rating: z.number().int().min(1).max(5),
  author: z.string().trim().min(1).max(60),
  location: z.string().trim().max(60).optional().default(""),
  title: z.string().trim().min(2).max(80),
  body: z.string().trim().min(10, "Please write at least a sentence.").max(1200),
});

export const POST = route(async (req) => {
  if (!rateLimit(`rv:${clientIp(req)}`, 4)) throw new HttpError(429, "Too many reviews — please try later.");
  const data = await body(req, schema);
  if (!(await getProductById(data.productId))) throw new HttpError(404, "Product not found");
  await saveReview({ id: newId("r"), ...data, location: data.location || "United States", verified: false, status: "pending", createdAt: new Date().toISOString() });
  return { ok: true };
});
