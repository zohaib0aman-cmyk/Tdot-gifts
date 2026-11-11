import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { getOrder, saveOrder } from "@/lib/db";
import { sendRefundEmail } from "@/lib/email";
import { getStripe, paypalRefund, toCents } from "@/lib/payments";
import { money, round2 } from "@/lib/utils";

export const POST = route(async (req) => {
  const { id, amount, reason } = await body(req, z.object({ id: z.string().min(1).max(64), amount: z.number().positive().max(100000), reason: z.string().max(200).optional() }));
  const o = await getOrder(id);
  if (!o) throw new HttpError(404, "Order not found");
  if (["pending", "failed", "cancelled"].includes(o.status) && !o.paymentIntentId) throw new HttpError(400, "This order hasn't been paid.");
  const already = o.refundedAmount ?? 0;
  const max = round2(o.total - already);
  if (amount > max + 0.001) throw new HttpError(400, `You can refund at most ${money(max)}.`);
  let via = "demo processor";
  const stripe = getStripe();
  if (stripe && o.paymentIntentId?.startsWith("pi_")) {
    await stripe.refunds.create({ payment_intent: o.paymentIntentId, amount: toCents(amount), reason: "requested_by_customer", metadata: { orderId: o.id, note: reason ?? "" } });
    via = "Stripe";
  } else if (o.paypalCaptureId) {
    if (!(await paypalRefund(o.paypalCaptureId, amount))) throw new HttpError(502, "PayPal refund failed.");
    via = "PayPal";
  }
  const refundedAmount = round2(already + amount);
  const full = refundedAmount >= o.total - 0.001;
  const next = {
    ...o,
    refundedAmount,
    status: full ? ("refunded" as const) : o.status,
    events: [...o.events, { status: full ? ("refunded" as const) : ("note" as const), message: `${full ? "Refunded" : "Partial refund of"} ${money(amount)} via ${via}${reason ? ` — ${reason}` : ""}`, at: new Date().toISOString() }],
  };
  await saveOrder(next);
  await sendRefundEmail(next, amount);
  return { order: next };
}, { admin: true });
