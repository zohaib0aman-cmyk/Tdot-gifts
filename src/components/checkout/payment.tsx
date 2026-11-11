"use client";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { AnimatePresence, m } from "framer-motion";
import { CreditCard, Fingerprint, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Field, Input } from "../ui";
import { cn, money } from "@/lib/utils";

/* ------------------------------------------------------------ Stripe (test mode) */
const stripeCache = new Map<string, Promise<Stripe | null>>();
const getStripe = (pk: string) => { if (!stripeCache.has(pk)) stripeCache.set(pk, loadStripe(pk)); return stripeCache.get(pk)!; };

function StripeForm({ orderId, total }: { orderId: string; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const pay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setErr("");
    const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/checkout/success?order=${orderId}` } });
    // only reached on immediate errors; success redirects
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") setErr(error.message ?? "Payment failed");
      else router.push(`/checkout/failed?order=${orderId}&reason=${encodeURIComponent(error.message ?? "Payment failed")}`);
    }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: { type: "accordion", defaultCollapsed: false, spacedAccordionItems: true }, wallets: { applePay: "auto", googlePay: "auto" } }} />
      {err && <p role="alert" className="text-sm text-rose">{err}</p>}
      <Button size="lg" className="w-full" onClick={pay} loading={busy} disabled={!stripe}><Lock size={16} /> Pay {money(total)}</Button>
    </div>
  );
}

export function StripePayment({ clientSecret, publishableKey, orderId, total, dark }: { clientSecret: string; publishableKey: string; orderId: string; total: number; dark: boolean }) {
  const stripePromise = useMemo(() => getStripe(publishableKey), [publishableKey]);
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: dark ? "night" : "stripe",
          variables: { colorPrimary: "#c9a14a", borderRadius: "14px", fontFamily: "Manrope, system-ui, sans-serif", colorBackground: dark ? "#1a1315" : "#ffffff" },
        },
      }}
    >
      <StripeForm orderId={orderId} total={total} />
    </Elements>
  );
}

/* ------------------------------------------------------------ PayPal (live sandbox when configured) */
declare global {
  interface Window { paypal?: { Buttons: (o: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close?: () => void } } }
}
export function PayPalLive({ clientId, orderId }: { clientId: string; orderId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [err, setErr] = useState("");
  useEffect(() => {
    let cancelled = false;
    const id = "paypal-sdk";
    const mount = () => {
      if (cancelled || !ref.current || !window.paypal) return;
      ref.current.innerHTML = "";
      window.paypal.Buttons({
        style: { shape: "pill", color: "gold", label: "paypal", height: 48 },
        createOrder: async () => { const r = await fetch("/api/paypal/create", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); return j.id; },
        onApprove: async () => { const r = await fetch("/api/paypal/capture", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId }) }); router.push(r.ok ? `/checkout/success?order=${orderId}` : `/checkout/failed?order=${orderId}`); },
        onCancel: () => router.push(`/checkout/cancelled?order=${orderId}`),
        onError: () => setErr("PayPal is unavailable right now. Please try a card."),
      }).render(ref.current);
    };
    if (document.getElementById(id)) mount();
    else {
      const s = document.createElement("script");
      s.id = id;
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
      s.onload = mount;
      document.body.appendChild(s);
    }
    return () => { cancelled = true; };
  }, [clientId, orderId, router]);
  return <div><div ref={ref} className="min-h-12" />{err && <p className="mt-2 text-sm text-rose">{err}</p>}</div>;
}

/* ------------------------------------------------------------ demo processor (no keys configured) */
const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
const fmtExp = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d; };

function WalletSheet({ kind, total, onAuthorize, onCancel }: { kind: "apple_pay" | "google_pay" | "paypal"; total: number; onAuthorize: () => void; onCancel: () => void }) {
  const [stage, setStage] = useState<"confirm" | "auth">("confirm");
  const title = { apple_pay: "Apple Pay", google_pay: "Google Pay", paypal: "PayPal" }[kind];
  return (
    <>
      <m.div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
      <m.div role="dialog" aria-modal="true" aria-label={`${title} (test mode)`} className="fixed inset-x-0 bottom-0 z-[91] mx-auto max-w-md rounded-t-[2rem] bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lift" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl">{title}</p>
          <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Test mode</span>
        </div>
        <div className="mt-5 space-y-3 rounded-2xl bg-surface-2 p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted">Pay</span><strong>Gifts &amp; Surprises USA</strong></div>
          <div className="flex justify-between"><span className="text-muted">Method</span><span>{kind === "paypal" ? "PayPal balance (sandbox)" : "Visa •••• 4242"}</span></div>
          <div className="flex justify-between border-t border-line pt-3"><span className="font-semibold">Total</span><strong className="font-display text-xl">{money(total)}</strong></div>
        </div>
        <AnimatePresence mode="wait">
          {stage === "confirm" ? (
            <m.div key="c" exit={{ opacity: 0 }} className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button onClick={() => { setStage("auth"); setTimeout(onAuthorize, 1300); }} className={kind === "paypal" ? "!bg-[#ffc439] !text-[#111]" : ""}>{kind === "paypal" ? "Pay now" : "Confirm"}</Button>
            </m.div>
          ) : (
            <m.div key="a" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 flex flex-col items-center gap-2">
              <m.span animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="grid h-16 w-16 place-items-center rounded-full bg-blush text-gold-ink"><Fingerprint size={30} /></m.span>
              <p className="text-sm text-muted">Authorizing…</p>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </>
  );
}

export function ExpressButtons({ onPick, disabled }: { onPick: (k: "apple_pay" | "google_pay" | "paypal") => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button type="button" disabled={disabled} onClick={() => onPick("apple_pay")} className="flex h-12 items-center justify-center gap-1 rounded-full bg-black text-[15px] font-semibold text-white transition active:scale-95 disabled:opacity-50 dark:ring-1 dark:ring-white/20" aria-label="Pay with Apple Pay">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8ZM14.1 5.8c.6-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3Z" /></svg> Pay
      </button>
      <button type="button" disabled={disabled} onClick={() => onPick("google_pay")} className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-line bg-white text-[15px] font-semibold text-[#3c4043] transition active:scale-95 disabled:opacity-50" aria-label="Pay with Google Pay">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC04" d="M6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.1L6.4 14Z" /><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6Z" /></svg> Pay
      </button>
      <button type="button" disabled={disabled} onClick={() => onPick("paypal")} className="flex h-12 items-center justify-center rounded-full bg-[#ffc439] text-[15px] font-extrabold italic text-[#003087] transition active:scale-95 disabled:opacity-50" aria-label="Pay with PayPal">
        Pay<span className="text-[#009cde]">Pal</span>
      </button>
    </div>
  );
}

export function rememberOrder(order: unknown, id: string) {
  try { sessionStorage.setItem(`gs-order-${id}`, JSON.stringify(order)); } catch { /* ignore */ }
}

export function DemoPayment({ orderId, total, token }: { orderId: string; total: number; token?: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [exp, setExp] = useState("12 / 30");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState<"apple_pay" | "google_pay" | "paypal" | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const charge = async (m: "card" | "apple_pay" | "google_pay" | "paypal") => {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/checkout/demo-pay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId, method: m, cardNumber: card, token }) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error ?? "Payment failed"); setBusy(false); return; }
      if (j.status === "paid") { rememberOrder(j.order, orderId); router.push(`/checkout/success?order=${orderId}`); }
      else router.push(`/checkout/failed?order=${orderId}&reason=${encodeURIComponent(j.reason ?? "Payment was declined")}`);
    } catch {
      setErr("Network error — please try again.");
      setBusy(false);
    }
  };
  const brand = card.startsWith("4") ? "VISA" : card.startsWith("5") ? "MC" : card.startsWith("3") ? "AMEX" : "";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
        <strong>Test mode.</strong> Use <code className="font-mono">4242 4242 4242 4242</code> to succeed or <code className="font-mono">4000 0000 0000 0002</code> to see a declined payment. No real money moves.
      </div>
      <div>
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">Express checkout</p>
        <ExpressButtons disabled={busy} onPick={(k) => setWallet(k)} />
      </div>
      <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" /> or pay with card <span className="h-px flex-1 bg-line" /></div>
      <div className={cn("space-y-4 rounded-3xl border border-line p-4", method === "card" && "border-gold")} onFocus={() => setMethod("card")}>
        <Field label="Card number" htmlFor="cc-num">
          <div className="relative">
            <Input id="cc-num" inputMode="numeric" autoComplete="cc-number" value={card} onChange={(e) => setCard(fmtCard(e.target.value))} placeholder="1234 1234 1234 1234" className="pr-16 font-mono tracking-wider" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-surface-2 px-2 py-1 text-[10px] font-black italic tracking-wider text-muted">{brand || <CreditCard size={14} />}</span>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry" htmlFor="cc-exp"><Input id="cc-exp" inputMode="numeric" autoComplete="cc-exp" value={exp} onChange={(e) => setExp(fmtExp(e.target.value))} placeholder="MM / YY" /></Field>
          <Field label="CVC" htmlFor="cc-cvc"><Input id="cc-cvc" inputMode="numeric" autoComplete="cc-csc" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" /></Field>
        </div>
        <Field label="Name on card" htmlFor="cc-name"><Input id="cc-name" autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></Field>
      </div>
      {err && <p role="alert" className="text-sm text-rose">{err}</p>}
      <Button size="lg" className="w-full" loading={busy} onClick={() => charge("card")} disabled={card.replace(/\D/g, "").length < 15 || exp.length < 7 || cvc.length < 3}>
        <Lock size={16} /> Pay {money(total)}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted"><ShieldCheck size={14} /> Payments secured by Stripe · 256-bit SSL</p>
      <AnimatePresence>
        {wallet && <WalletSheet kind={wallet} total={total} onCancel={() => setWallet(null)} onAuthorize={() => { const w = wallet; setWallet(null); void charge(w); }} />}
      </AnimatePresence>
    </div>
  );
}
