"use client";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, Check, Lock, Pencil, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { useState } from "react";
import { Logo } from "../brand";
import { EmptyCart, FreeShippingBar } from "../cart";
import { useSettings } from "../providers";
import { Button, Checkbox, Field, Input, Select } from "../ui";
import { DemoPayment, ExpressButtons, PayPalLive, rememberOrder, StripePayment } from "./payment";
import { OrderSummary } from "./summary";
import { toQuoteLines, useQuote } from "./use-quote";
import { cartSubtotal, useCart, useHydrated } from "@/lib/client-store";
import type { Address, ShippingRate } from "@/lib/types";
import { cn, money } from "@/lib/utils";

type Props = {
  rates: ShippingRate[];
  states: { code: string; name: string }[];
  paypalClientId: string;
  prefill?: { email: string; address?: Address };
};
type PayState = { orderId: string; total: number; clientSecret?: string; publishableKey?: string; demo?: boolean; paypal?: "live" | "demo"; token?: string } | null;

const CARRIER_STYLE: Record<string, string> = { usps: "bg-[#333366] text-white", ups: "bg-[#351c15] text-[#ffb500]", fedex: "bg-[#4d148c] text-white" };

function StepHeader({ n, title, done, onEdit }: { n: number; title: string; done?: boolean; onEdit?: () => void }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <m.span className={cn("grid h-8 w-8 place-items-center rounded-full text-sm font-bold", done ? "bg-gold text-[#2a1d06]" : "bg-ink text-on-ink")} animate={{ scale: done ? [1, 1.2, 1] : 1 }}>
        {done ? <Check size={16} strokeWidth={3} /> : n}
      </m.span>
      <h2 className="flex-1 font-display text-2xl">{title}</h2>
      {done && onEdit && <button type="button" onClick={onEdit} className="flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-gold-ink"><Pencil size={14} /> Edit</button>}
    </div>
  );
}

export function CheckoutView({ rates, states, paypalClientId, prefill }: Props) {
  const hydrated = useHydrated();
  const { lines, promoCode, giftCardCode } = useCart();
  const { contact } = useSettings();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [marketing, setMarketing] = useState(true);
  const [addr, setAddr] = useState<Address>(prefill?.address ?? { firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", zip: "", phone: "" });
  const [rateId, setRateId] = useState(rates[0]?.id ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [pay, setPay] = useState<PayState>(null);
  const [payTab, setPayTab] = useState<"card" | "paypal">("card");

  const items = hydrated ? lines : [];
  const needsShipping = items.some((l) => !l.giftCard);
  const deliveryDate = items.map((l) => l.deliveryDate).filter(Boolean).sort()[0];
  const { quote, loading } = useQuote(items, { state: addr.state, shippingRateId: rateId, promoCode, giftCardCode }, hydrated);

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setAddr((a) => ({ ...a, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: "" })); if (pay) setPay(null); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!addr.firstName.trim()) e.firstName = "Required";
    if (!addr.lastName.trim()) e.lastName = "Required";
    if (addr.line1.trim().length < 3) e.line1 = "Enter the street address";
    if (addr.city.trim().length < 2) e.city = "Required";
    if (!addr.state) e.state = "Choose a state";
    if (!/^\d{5}(-\d{4})?$/.test(addr.zip.trim())) e.zip = "5-digit ZIP";
    setErrors(e);
    if (Object.keys(e).length) document.getElementById(Object.keys(e)[0] === "email" ? "co-email" : `co-${Object.keys(e)[0]}`)?.focus();
    return !Object.keys(e).length;
  };

  const startPayment = async (method: "card" | "paypal") => {
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lines: toQuoteLines(items), email, address: addr, shippingRateId: rateId, promoCode, giftCardCode, paymentMethod: method, marketing, deliveryDate }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Could not start checkout");
      if (j.paid) { router.push(`/checkout/success?order=${j.orderId}`); return; }
      setPay(j);
      setPayTab(method);
      setTimeout(() => document.getElementById("payment")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (hydrated && !items.length) return <div className="mx-auto max-w-lg py-10"><EmptyCart /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between py-5">
        <Link href="/cart" className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft size={16} /> Bag</Link>
        <Link href="/" aria-label="Home"><Logo logoUrl="/brand/logo-badge.png" mode="badge+wordmark" /></Link>
        <span className="flex items-center gap-1 text-xs font-semibold text-muted"><Lock size={14} /> <span className="hidden sm:inline">Secure checkout</span></span>
      </header>

      <div className="mb-6 lg:hidden"><OrderSummary lines={items} quote={quote} loading={loading} collapsible /></div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12 [&>*]:min-w-0">
        <div className="space-y-6">
          {/* contact */}
          <section className="rounded-[2rem] border border-line bg-surface p-5 shadow-soft sm:p-7" aria-labelledby="s1">
            <div id="s1"><StepHeader n={1} title="Contact" done={!!pay} onEdit={() => setPay(null)} /></div>
            <Field label="Email for order updates" htmlFor="co-email" error={errors.email}>
              <Input id="co-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: "" })); }} placeholder="you@example.com" aria-invalid={!!errors.email} />
            </Field>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <Checkbox checked={marketing} onChange={(e) => setMarketing(e.target.checked)} label="Email me occasion reminders & offers" />
              {!prefill && <Link href="/account/login?next=/checkout" className="min-h-11 py-3 text-sm font-semibold text-gold-ink">Have an account? Sign in</Link>}
            </div>
          </section>

          {/* address */}
          <section className="rounded-[2rem] border border-line bg-surface p-5 shadow-soft sm:p-7" aria-labelledby="s2">
            <div id="s2"><StepHeader n={2} title={needsShipping ? "Recipient's delivery address" : "Billing details"} done={!!pay} onEdit={() => setPay(null)} /></div>
            <p className="-mt-3 mb-5 text-sm text-muted">Sending from abroad? Enter the address of the person you&apos;re surprising in the USA.</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" htmlFor="co-firstName" error={errors.firstName}><Input id="co-firstName" autoComplete="given-name" value={addr.firstName} onChange={set("firstName")} /></Field>
              <Field label="Last name" htmlFor="co-lastName" error={errors.lastName}><Input id="co-lastName" autoComplete="family-name" value={addr.lastName} onChange={set("lastName")} /></Field>
              <Field label="Street address" htmlFor="co-line1" error={errors.line1} className="col-span-2"><Input id="co-line1" autoComplete="address-line1" value={addr.line1} onChange={set("line1")} placeholder="123 Peachtree St" /></Field>
              <Field label="Apt, suite, floor (optional)" htmlFor="co-line2" className="col-span-2"><Input id="co-line2" autoComplete="address-line2" value={addr.line2} onChange={set("line2")} /></Field>
              <Field label="City" htmlFor="co-city" error={errors.city} className="col-span-2 sm:col-span-1"><Input id="co-city" autoComplete="address-level2" value={addr.city} onChange={set("city")} /></Field>
              <Field label="State" htmlFor="co-state" error={errors.state} className="col-span-1"><Select id="co-state" autoComplete="address-level1" value={addr.state} onChange={set("state")}><option value="">Select…</option>{states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</Select></Field>
              <Field label="ZIP code" htmlFor="co-zip" error={errors.zip} className="col-span-1"><Input id="co-zip" inputMode="numeric" autoComplete="postal-code" value={addr.zip} onChange={set("zip")} placeholder="30303" maxLength={10} /></Field>
              <Field label="Recipient phone (for delivery)" htmlFor="co-phone" className="col-span-2 sm:col-span-1"><Input id="co-phone" type="tel" autoComplete="tel" value={addr.phone} onChange={set("phone")} placeholder="(555) 010-1234" /></Field>
            </div>
            {deliveryDate && <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm"><Truck size={16} className="mr-2 inline text-gold-ink" />Requested delivery: <strong>{new Date(deliveryDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</strong></p>}
          </section>

          {/* shipping */}
          {needsShipping && (
            <section className="rounded-[2rem] border border-line bg-surface p-5 shadow-soft sm:p-7" aria-labelledby="s3">
              <div id="s3"><StepHeader n={3} title="Shipping method" done={!!pay} onEdit={() => setPay(null)} /></div>
              {quote && <FreeShippingBar subtotal={quote.subtotal - quote.discount - quote.lines.filter((l) => l.giftCard).reduce((a, l) => a + l.unitPrice * l.quantity, 0)} className="mb-5" />}
              <div className="space-y-2.5" role="radiogroup" aria-label="Shipping method">
                {rates.map((r) => {
                  const sel = r.id === rateId;
                  const free = quote && quote.freeShippingRemaining === 0;
                  const shown = free ? Math.max(0, r.price - rates[0].price) : r.price;
                  return (
                    <label key={r.id} className={cn("relative flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition sm:gap-4", sel ? "border-ink" : "border-line hover:border-gold")}>
                      <input type="radio" name="rate" value={r.id} checked={sel} onChange={() => { setRateId(r.id); if (pay) setPay(null); }} className="sr-only" />
                      {sel && <m.span layoutId="rate-pill" className="absolute inset-0 rounded-2xl bg-blush/70" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                      <span className={cn("relative grid h-5 w-5 shrink-0 place-items-center rounded-full border-2", sel ? "border-ink" : "border-line")}>{sel && <m.span layoutId="rate-dot" className="h-2.5 w-2.5 rounded-full bg-ink" />}</span>
                      <span className={cn("relative grid h-9 w-14 shrink-0 place-items-center rounded-lg text-[0.65rem] font-black tracking-wider", CARRIER_STYLE[r.carrier])}>{r.carrier.toUpperCase()}</span>
                      <span className="relative min-w-0 flex-1"><span className="block text-sm font-semibold">{r.name}</span><span className="block text-xs text-muted">{r.eta}</span></span>
                      <span className="relative text-sm font-semibold tabular-nums">{shown === 0 ? <span className="text-emerald-700 dark:text-emerald-400">Free</span> : money(shown)}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* payment */}
          <section id="payment" className="scroll-mt-6 rounded-[2rem] border border-line bg-surface p-5 shadow-soft sm:p-7" aria-labelledby="s4">
            <div id="s4"><StepHeader n={needsShipping ? 4 : 3} title="Payment" /></div>
            <AnimatePresence mode="wait">
              {!pay ? (
                <m.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <p className="text-sm text-muted">Pay with card, Apple Pay, Google Pay or PayPal. You&apos;ll review the total before anything is charged.</p>
                  <ExpressButtons disabled={submitting} onPick={(k) => startPayment(k === "paypal" ? "paypal" : "card")} />
                  {serverError && <p role="alert" className="rounded-2xl bg-rose/10 p-3 text-sm text-rose">{serverError}</p>}
                  <Button size="lg" className="w-full" loading={submitting} onClick={() => startPayment("card")}>
                    <Lock size={16} /> Continue to payment{quote ? ` · ${money(quote.total)}` : ""}
                  </Button>
                  <p className="text-center text-xs text-muted">By continuing you agree to our <Link href="/policies/terms" className="underline">Terms</Link> and <Link href="/policies/refunds" className="underline">Refund Policy</Link>.</p>
                </m.div>
              ) : (
                <m.div key="pay" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex rounded-full bg-surface-2 p-1" role="tablist" aria-label="Payment method">
                    {(["card", "paypal"] as const).map((t) => (
                      <button key={t} role="tab" aria-selected={payTab === t} onClick={() => setPayTab(t)} className="relative h-11 flex-1 rounded-full text-sm font-semibold">
                        {payTab === t && <m.span layoutId="pay-tab" className="absolute inset-0 rounded-full bg-surface shadow-soft" />}
                        <span className="relative">{t === "card" ? "Card · Apple Pay · Google Pay" : "PayPal"}</span>
                      </button>
                    ))}
                  </div>
                  {payTab === "card" ? (
                    pay.clientSecret && pay.publishableKey ? (
                      <StripePayment clientSecret={pay.clientSecret} publishableKey={pay.publishableKey} orderId={pay.orderId} total={pay.total} dark={resolvedTheme === "dark"} />
                    ) : (
                      <DemoPayment orderId={pay.orderId} total={pay.total} token={pay.token} />
                    )
                  ) : paypalClientId ? (
                    <PayPalLive clientId={paypalClientId} orderId={pay.orderId} />
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted">You&apos;ll be asked to log in to PayPal to approve {money(pay.total)}.</p>
                      <DemoPayPal orderId={pay.orderId} total={pay.total} token={pay.token} />
                    </div>
                  )}
                  <button type="button" onClick={() => router.push(`/checkout/cancelled?order=${pay.orderId}`)} className="mx-auto block min-h-11 text-sm font-semibold text-muted underline-offset-4 hover:underline">Cancel payment</button>
                </m.div>
              )}
            </AnimatePresence>
          </section>
          <p className="flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={14} /> Questions? {contact.phone} · {contact.email}</p>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-[2rem] border border-line bg-surface p-7 shadow-soft">
            <h2 className="mb-5 font-display text-2xl">Order summary</h2>
            <OrderSummary lines={items} quote={quote} loading={loading} />
            {hydrated && <p className="mt-4 text-xs text-muted">Bag subtotal before discounts: {money(cartSubtotal(items))}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DemoPayPal({ orderId, total, token }: { orderId: string; total: number; token?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    const r = await fetch("/api/checkout/demo-pay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId, method: "paypal", token }) });
    const j = await r.json();
    if (j.status === "paid") rememberOrder(j.order, orderId);
    router.push(j.status === "paid" ? `/checkout/success?order=${orderId}` : `/checkout/failed?order=${orderId}`);
  };
  return (
    <button type="button" onClick={go} disabled={busy} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#ffc439] text-lg font-extrabold italic text-[#003087] transition active:scale-[0.98] disabled:opacity-70" aria-label={`Pay ${money(total)} with PayPal`}>
      {busy ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#003087] border-r-transparent" /> : <>Pay<span className="text-[#009cde]">Pal</span></>}
      <span className="ml-1 text-sm font-semibold not-italic text-[#003087]/70">· test mode</span>
    </button>
  );
}
