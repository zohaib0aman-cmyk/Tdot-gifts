import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SuccessFallback } from "@/components/checkout/order-fallback";
import { SuccessView } from "@/components/checkout/success-view";
import { getOrder } from "@/lib/db";
import { finalizeOrder } from "@/lib/orders";
import { getStripe } from "@/lib/payments";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const sp = await searchParams;
  const id = typeof sp.order === "string" ? sp.order.slice(0, 64) : "";
  let order = id ? await getOrder(id) : null;
  if (!order) return <SuccessFallback id={id} />;

  // Stripe redirect: confirm with Stripe directly in case the webhook hasn't arrived yet
  const stripe = getStripe();
  if (order.status === "pending" && order.paymentIntentId && stripe) {
    const pi = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    if (pi.status === "succeeded") order = await finalizeOrder(order.id, { paymentIntentId: pi.id });
    else if (pi.status === "requires_payment_method" || pi.status === "canceled") redirect(`/checkout/failed?order=${order.id}&reason=${encodeURIComponent(pi.last_payment_error?.message ?? "Your payment was not completed.")}`);
  }
  if (order.status === "failed") redirect(`/checkout/failed?order=${order.id}`);
  return <SuccessView order={order} />;
}
