import type { Metadata } from "next";
import { CreditCard, LifeBuoy, RefreshCcw, XCircle } from "lucide-react";
import { ButtonLink, Container } from "@/components/ui";
import { getOrder, getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Payment unsuccessful", robots: { index: false } };

export default async function FailedPage({ searchParams }: PageProps<"/checkout/failed">) {
  const sp = await searchParams;
  const id = typeof sp.order === "string" ? sp.order : "";
  const reasonParam = typeof sp.reason === "string" ? sp.reason.slice(0, 160) : "";
  const [order, settings] = await Promise.all([id ? getOrder(id) : null, getSettings()]);
  const reason = reasonParam || order?.events.findLast((e) => e.status === "failed")?.message || "Your payment couldn't be completed.";
  return (
    <Container className="max-w-xl py-16 text-center sm:py-24">
      <div className="mx-auto grid h-24 w-24 animate-[pulse_2s_ease-in-out_2] place-items-center rounded-full bg-rose/10 text-rose"><XCircle size={48} strokeWidth={1.5} /></div>
      <p className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-rose">Payment unsuccessful</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Don&apos;t worry — nothing was charged</h1>
      <p className="mt-4 text-muted">{reason} Your bag is saved, so you can try again with another card, Apple Pay, Google Pay or PayPal.</p>
      {order && <p className="mt-4 text-sm text-muted">Reference {order.number}</p>}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/checkout" size="lg"><RefreshCcw size={17} /> Try again</ButtonLink>
        <ButtonLink href="/contact" variant="outline" size="lg"><LifeBuoy size={17} /> Get help</ButtonLink>
      </div>
      <ul className="mx-auto mt-10 max-w-sm space-y-2 text-left text-sm text-muted">
        <li className="flex gap-2"><CreditCard size={16} className="mt-0.5 shrink-0 text-gold-ink" /> Double-check the card number, expiry date and ZIP code.</li>
        <li className="flex gap-2"><CreditCard size={16} className="mt-0.5 shrink-0 text-gold-ink" /> International card? Your bank may need to approve the payment.</li>
        <li className="flex gap-2"><LifeBuoy size={16} className="mt-0.5 shrink-0 text-gold-ink" /> Still stuck? Call {settings.contact.phone} — we&apos;ll help you place the order.</li>
      </ul>
    </Container>
  );
}
