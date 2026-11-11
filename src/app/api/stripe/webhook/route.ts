import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { finalizeOrder, markOrder } from "@/lib/orders";
import { getStripe } from "@/lib/payments";

/** Stripe → marks orders paid / failed. Configure the endpoint at /api/stripe/webhook. */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 400 });
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  const pi = event.data.object as Stripe.PaymentIntent;
  const orderId = pi.metadata?.orderId;
  if (orderId) {
    if (event.type === "payment_intent.succeeded") {
      const method = pi.payment_method_types?.[0];
      await finalizeOrder(orderId, { paymentIntentId: pi.id, paymentMethod: method === "card" ? "card" : "card" });
    } else if (event.type === "payment_intent.payment_failed") {
      await markOrder(orderId, "failed", pi.last_payment_error?.message ?? "Payment failed");
    }
  }
  return NextResponse.json({ received: true });
}
