import { z } from "zod";
import { body, clientIp, route } from "@/lib/api";
import { getCustomerSession, HttpError, rateLimit } from "@/lib/auth";
import { addSubscriber, newId, nextOrderNumber, saveOrder } from "@/lib/db";
import { env } from "@/lib/env";
import { finalizeOrder } from "@/lib/orders";
import { signOrder } from "@/lib/order-token";
import { getStripe, paymentMode, toCents } from "@/lib/payments";
import { computeQuote, quoteInputSchema } from "@/lib/quote";
import type { Order } from "@/lib/types";

const addressSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  line1: z.string().trim().min(3, "Street address is required").max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().length(2, "Choose a state"),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  phone: z.string().trim().max(30).optional(),
});

const schema = quoteInputSchema.extend({
  email: z.email("Enter a valid email").max(160),
  address: addressSchema,
  shippingRateId: z.string().max(40),
  paymentMethod: z.enum(["card", "paypal"]),
  marketing: z.boolean().optional(),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const POST = route(async (req) => {
  if (!rateLimit(`co:${clientIp(req)}`, 12)) throw new HttpError(429, "Too many attempts — please wait a minute.");
  const input = await body(req, schema);
  const quote = await computeQuote({ ...input, state: input.address.state });
  const blocking = quote.errors.filter((e) => !e.includes("quantity adjusted"));
  if (blocking.length || !quote.lines.length) throw new HttpError(409, blocking[0] ?? "Your bag is empty.");

  const session = await getCustomerSession();
  const now = new Date().toISOString();
  const order: Order = {
    id: newId("ord"),
    number: await nextOrderNumber(),
    email: input.email.toLowerCase(),
    customerId: session?.cid,
    shippingAddress: input.address,
    lines: quote.lines,
    subtotal: quote.subtotal,
    discount: quote.discount,
    giftWrapTotal: quote.giftWrapTotal,
    shipping: quote.shipping,
    tax: quote.tax,
    giftCardApplied: quote.giftCardApplied,
    total: quote.total,
    promoCode: quote.promo?.code,
    giftCardCode: quote.giftCard?.code,
    shippingRateId: quote.shippingRateId,
    shippingLabel: quote.shippingLabel,
    deliveryDate: input.deliveryDate,
    status: "pending",
    paymentMethod: quote.total === 0 ? "gift_card" : input.paymentMethod,
    events: [{ status: "pending", message: "Order placed — awaiting payment", at: now }],
    createdAt: now,
    updatedAt: now,
  };
  await saveOrder(order);
  if (input.marketing) await addSubscriber(order.email);

  // fully covered by a gift card
  if (order.total === 0) {
    await finalizeOrder(order.id);
    return { orderId: order.id, paid: true };
  }

  const mode = paymentMode();
  if (input.paymentMethod === "paypal") {
    return { orderId: order.id, total: order.total, paypal: mode.paypal ? "live" : "demo", token: mode.paypal ? undefined : await signOrder(order) };
  }
  const stripe = getStripe();
  if (stripe) {
    const pi = await stripe.paymentIntents.create({
      amount: toCents(order.total),
      currency: "usd",
      automatic_payment_methods: { enabled: true }, // card, Apple Pay, Google Pay, Link…
      receipt_email: order.email,
      description: `${order.number} — Gifts & Surprises USA`,
      metadata: { orderId: order.id, orderNumber: order.number },
    });
    await saveOrder({ ...order, paymentIntentId: pi.id });
    return { orderId: order.id, total: order.total, clientSecret: pi.client_secret, publishableKey: env.stripePublishable };
  }
  return { orderId: order.id, total: order.total, demo: true, token: await signOrder(order) };
});
