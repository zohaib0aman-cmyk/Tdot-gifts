import { revalidatePath } from "next/cache";
import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { deleteReview, listReviews, saveReview } from "@/lib/db";

export const PATCH = route(async (req) => {
  const { id, status } = await body(req, z.object({ id: z.string().max(80), status: z.enum(["approved", "pending", "hidden"]) }));
  const r = (await listReviews({ includeAll: true })).find((x) => x.id === id);
  if (!r) throw new HttpError(404, "Review not found");
  await saveReview({ ...r, status });
  revalidatePath("/", "layout");
  return { ok: true };
}, { admin: true });

export const DELETE = route(async (req) => {
  const { id } = await body(req, z.object({ id: z.string().max(80) }));
  await deleteReview(id);
  revalidatePath("/", "layout");
  return { ok: true };
}, { admin: true });
