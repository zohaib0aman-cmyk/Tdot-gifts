import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { getOrder, saveOrder } from "@/lib/db";
import { sendShippedEmail } from "@/lib/email";
import type { OrderStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/utils";

const schema = z.object({
  id: z.string().min(1).max(64),
  status: z.enum(["pending", "paid", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded", "failed"]).optional(),
  trackingNumber: z.string().trim().max(60).optional(),
  trackingCarrier: z.enum(["usps", "ups", "fedex"]).optional(),
  note: z.string().trim().max(300).optional(),
  notify: z.boolean().optional(),
});

export const PATCH = route(async (req) => {
  const d = await body(req, schema);
  const o = await getOrder(d.id);
  if (!o) throw new HttpError(404, "Order not found");
  const now = new Date().toISOString();
  const next = { ...o, events: [...o.events] };
  if (d.trackingNumber !== undefined) next.trackingNumber = d.trackingNumber || undefined;
  if (d.trackingCarrier) next.trackingCarrier = d.trackingCarrier;
  if (d.status && d.status !== o.status) {
    next.status = d.status as OrderStatus;
    const msg = d.note || (d.status === "shipped" && next.trackingNumber ? `Shipped via ${next.shippingLabel} · ${next.trackingNumber}` : STATUS_LABEL[d.status]);
    next.events.push({ status: d.status, message: msg, at: now });
  } else if (d.note) next.events.push({ status: "note", message: d.note, at: now });
  await saveOrder(next);
  if (d.status === "shipped" && o.status !== "shipped" && d.notify !== false) await sendShippedEmail(next);
  return { order: next };
}, { admin: true });
