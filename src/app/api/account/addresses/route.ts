import { z } from "zod";
import { body, route } from "@/lib/api";
import { getCurrentCustomer, HttpError } from "@/lib/auth";
import { newId, saveCustomer } from "@/lib/db";

const addr = z.object({
  id: z.string().max(40).optional(),
  label: z.string().trim().max(30).optional(),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().length(2),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  phone: z.string().trim().max(30).optional(),
  isDefault: z.boolean().optional(),
});

export const PUT = route(async (req) => {
  const c = await getCurrentCustomer();
  if (!c) throw new HttpError(401, "Please sign in");
  const { addresses } = await body(req, z.object({ addresses: z.array(addr).max(10) }));
  const list = addresses.map((a) => ({ ...a, id: a.id ?? newId("a") }));
  if (list.length && !list.some((a) => a.isDefault)) list[0].isDefault = true;
  await saveCustomer({ ...c, addresses: list });
  return { addresses: list };
});
