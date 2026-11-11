import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { US_STATES } from "@/data/settings";
import { getCurrentCustomer } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import { enabledRates } from "@/lib/quote";

export const metadata: Metadata = { title: "Secure Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [settings, customer] = await Promise.all([getSettings(), getCurrentCustomer()]);
  const addr = customer?.addresses.find((a) => a.isDefault) ?? customer?.addresses[0];
  return (
    <CheckoutView
      rates={enabledRates(settings)}
      states={US_STATES}
      paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
      prefill={customer ? { email: customer.email, address: addr ? { ...addr, line2: addr.line2 ?? "", phone: addr.phone ?? "" } : undefined } : undefined}
    />
  );
}
