import "server-only";
import Stripe from "stripe";
import { env, hasPayPal, hasStripe } from "./env";

let stripe: Stripe | null = null;
export function getStripe() {
  if (!hasStripe()) return null;
  stripe ??= new Stripe(env.stripeSecret);
  return stripe;
}

export const toCents = (n: number) => Math.round(n * 100);

/* ------------------------------------------------------------ PayPal (REST, sandbox by default) */
async function paypalToken() {
  const r = await fetch(`${env.paypalApi}/v1/oauth2/token`, {
    method: "POST",
    headers: { authorization: `Basic ${Buffer.from(`${env.paypalClientId}:${env.paypalSecret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!r.ok) throw new Error("PayPal auth failed");
  return ((await r.json()) as { access_token: string }).access_token;
}

export async function paypalCreateOrder(amount: number, reference: string) {
  if (!hasPayPal()) throw new Error("PayPal is not configured");
  const r = await fetch(`${env.paypalApi}/v2/checkout/orders`, {
    method: "POST",
    headers: { authorization: `Bearer ${await paypalToken()}`, "content-type": "application/json" },
    body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ reference_id: reference, amount: { currency_code: "USD", value: amount.toFixed(2) } }] }),
  });
  if (!r.ok) throw new Error("PayPal order failed");
  return ((await r.json()) as { id: string }).id;
}

export async function paypalCapture(paypalOrderId: string) {
  const r = await fetch(`${env.paypalApi}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: { authorization: `Bearer ${await paypalToken()}`, "content-type": "application/json" },
  });
  const j = (await r.json()) as { status?: string; purchase_units?: { reference_id?: string; payments?: { captures?: { id: string; amount: { value: string } }[] } }[] };
  return { ok: r.ok && j.status === "COMPLETED", reference: j.purchase_units?.[0]?.reference_id, captureId: j.purchase_units?.[0]?.payments?.captures?.[0]?.id };
}

export async function paypalRefund(captureId: string, amount: number) {
  const r = await fetch(`${env.paypalApi}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
    method: "POST",
    headers: { authorization: `Bearer ${await paypalToken()}`, "content-type": "application/json" },
    body: JSON.stringify({ amount: { currency_code: "USD", value: amount.toFixed(2) } }),
  });
  return r.ok;
}

export const paymentMode = () => ({ stripe: hasStripe(), paypal: hasPayPal() });
