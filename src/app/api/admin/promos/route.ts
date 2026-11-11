import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { deletePromo, listPromos, newId, savePromo } from "@/lib/db";

const schema = z.object({
  id: z.string().max(64).optional(),
  code: z.string().trim().toUpperCase().min(3).max(30).regex(/^[A-Z0-9_-]+$/, "Letters, numbers, - and _ only"),
  type: z.enum(["percent", "fixed", "free_shipping"]),
  value: z.number().min(0).max(10000),
  minSubtotal: z.number().min(0).max(100000).optional(),
  usageLimit: z.number().int().min(1).max(1_000_000).optional(),
  expiresAt: z.string().max(40).optional(),
  active: z.boolean(),
  description: z.string().trim().max(120).optional(),
});

export const POST = route(async (req) => {
  const d = await body(req, schema);
  if (d.type === "percent" && (d.value <= 0 || d.value > 100)) throw new HttpError(400, "Percent must be between 1 and 100.");
  const all = await listPromos();
  if (all.some((p) => p.code === d.code && p.id !== d.id)) throw new HttpError(409, "That code already exists.");
  const prev = all.find((p) => p.id === d.id);
  const promo = { ...d, id: prev?.id ?? newId("pc"), used: prev?.used ?? 0, expiresAt: d.expiresAt || undefined };
  await savePromo(promo);
  return { promo };
}, { admin: true });

export const DELETE = route(async (req) => {
  const { id } = await body(req, z.object({ id: z.string().max(64) }));
  await deletePromo(id);
  return { ok: true };
}, { admin: true });
