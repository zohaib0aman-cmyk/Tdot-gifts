import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { getOrder, saveOrder } from "@/lib/db";
import { verifyOrder } from "@/lib/order-token";
import { hasPayPal, hasStripe } from "@/lib/env";
import { finalizeOrder, markOrder } from "@/lib/orders";

/**
 * Demo payment processor used ONLY when Stripe/PayPal keys are not configured.
 * Mirrors Stripe's test cards: 4242… succeeds, 4000 0000 0000 0002 is declined.
 */
const schema = z.object({
  orderId: z.string().min(1).max(64),
  method: z.enum(["card", "apple_pay", "google_pay", "paypal"]),
  cardNumber: z.string().max(25).optional(),
  outcome: z.enum(["success", "cancel"]).optional(),
  token: z.string().max(60_000).optional(),
});

export const POST = route(async (req) => {
  const input = await body(req, schema);
  if (input.method === "paypal" ? hasPayPal() : hasStripe()) throw new HttpError(400, "Live test-mode payments are configured; demo payments are disabled.");
  let order = await getOrder(input.orderId);
  if (!order) {
    // serverless demo: the order may have been created on another instance
    const snap = await verifyOrder(input.token);
    if (!snap || snap.id !== input.orderId) throw new HttpError(404, "Order not found");
    order = await saveOrder(snap);
  }
  if (order.status !== "pending" && order.status !== "failed") return { status: order.status, orderId: order.id };
  if (input.outcome === "cancel") {
    await markOrder(order.id, "pending", "Payment cancelled by customer");
    return { status: "cancelled", orderId: order.id };
  }
  const digits = (input.cardNumber ?? "").replace(/\D/g, "");
  if (input.method === "card") {
    if (digits.length < 15) throw new HttpError(400, "Enter a complete card number.");
    if (digits === "4000000000000002" || digits === "4000000000009995") {
      await markOrder(order.id, "failed", digits.endsWith("9995") ? "Card declined: insufficient funds" : "Card declined by issuer");
      return { status: "failed", orderId: order.id, reason: digits.endsWith("9995") ? "Your card has insufficient funds." : "Your card was declined." };
    }
  }
  const paid = await finalizeOrder(order.id, { paymentMethod: input.method, paymentIntentId: `demo_${input.method}_${Date.now()}` });
  return { status: "paid", orderId: order.id, order: paid };
});
