"use client";
import { AnimatePresence, m } from "framer-motion";
import { Gift, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button, Field, Input, Textarea } from "./ui";
import { lineKey, toast, useCart, useUI } from "@/lib/client-store";
import { cn, money } from "@/lib/utils";

const AMOUNTS = [25, 50, 75, 100, 150, 250];

function CardPreview({ amount, to, from, message }: { amount: number; to: string; from: string; message: string }) {
  return (
    <m.div className="relative mx-auto aspect-[1.6] w-full max-w-md [perspective:1200px]" initial={{ rotateX: 12, y: 20, opacity: 0 }} animate={{ rotateX: 0, y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
      <m.div whileHover={{ rotateY: -8, rotateX: 6 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#2a1d20,#0f0a0b)] p-6 text-[#f6efe6] shadow-lift ring-1 ring-[#c9a14a]/50 [transform-style:preserve-3d]">
        <div className="gold-bg absolute inset-y-0 left-[34%] w-8 opacity-90" />
        <div className="gold-bg absolute inset-x-0 top-[46%] h-6 opacity-90" />
        <m.div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,.18)_45%,transparent_60%)]" animate={{ x: ["-100%", "120%"] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1.5 }} />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-[0.12em]">GIFTS <span className="font-script text-2xl font-normal text-[#e9cf7f]">&amp;</span> SURPRISES</p>
            <p className="text-[0.6rem] font-bold tracking-[0.5em] text-[#c9a14a]">USA · GIFT CARD</p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xs text-white/70">{to ? `For ${to}` : "For someone special"}{from ? ` · from ${from}` : ""}</p>
              {message && <p className="mt-1 line-clamp-1 font-display text-sm italic text-white/90">“{message}”</p>}
            </div>
            <AnimatePresence mode="popLayout">
              <m.p key={amount} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="gold-text font-display text-5xl">{money(amount).replace(".00", "")}</m.p>
            </AnimatePresence>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}

export function GiftCardBuilder() {
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const value = custom ? Math.max(0, Number(custom)) : amount;
  const valid = value >= 10 && value <= 1000 && to.trim() && /^\S+@\S+\.\S+$/.test(toEmail) && from.trim();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    add({ key: lineKey("giftcard", undefined, `${value}-${toEmail.toLowerCase()}`), productId: "giftcard", slug: "gift-cards", name: `Digital Gift Card — ${money(value)}`, image: "/brand/gift-card.svg", unitPrice: value, quantity: 1, giftCard: { amount: value, recipientName: to.trim(), recipientEmail: toEmail.trim(), senderName: from.trim(), message: message.trim() || undefined } });
    toast({ title: "Gift card added", description: `${money(value)} for ${to}`, image: "/brand/gift-card.svg", action: { label: "View bag", onClick: () => setCart(true) } });
  };
  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <div className="lg:sticky lg:top-28"><CardPreview amount={value || 0} to={to} from={from} message={message} /><p className="mt-5 text-center text-sm text-muted">Delivered instantly by email · Never expires · Redeemable on everything</p></div>
      <form onSubmit={submit} className="space-y-6 rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8">
        <fieldset>
          <legend className="mb-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted">Choose an amount</legend>
          <div className="grid grid-cols-3 gap-2">
            {AMOUNTS.map((a) => (
              <button key={a} type="button" aria-pressed={!custom && amount === a} onClick={() => { setAmount(a); setCustom(""); }} className={cn("relative h-14 rounded-2xl border font-display text-xl transition", !custom && amount === a ? "border-ink" : "border-line hover:border-gold")}>
                {!custom && amount === a && <m.span layoutId="gc-amt" className="absolute inset-0 rounded-2xl bg-blush" />}
                <span className="relative">${a}</span>
              </button>
            ))}
          </div>
          <Field label="Or a custom amount ($10–$1,000)" htmlFor="gc-custom" className="mt-3"><Input id="gc-custom" inputMode="decimal" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, "").slice(0, 7))} placeholder="e.g. 120" /></Field>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Recipient name" htmlFor="gc-to"><Input id="gc-to" required value={to} onChange={(e) => setTo(e.target.value)} maxLength={80} /></Field>
          <Field label="Recipient email" htmlFor="gc-email"><Input id="gc-email" type="email" required value={toEmail} onChange={(e) => setToEmail(e.target.value)} /></Field>
          <Field label="From" htmlFor="gc-from" className="sm:col-span-2"><Input id="gc-from" required value={from} onChange={(e) => setFrom(e.target.value)} maxLength={80} placeholder="Your name" /></Field>
          <Field label="Personal message (optional)" htmlFor="gc-msg" className="sm:col-span-2"><Textarea id="gc-msg" value={message} maxLength={300} onChange={(e) => setMessage(e.target.value)} placeholder="Treat yourself — you deserve it!" /></Field>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={!valid}><ShoppingBag size={17} /> Add {value >= 10 ? money(value) : ""} gift card to bag</Button>
      </form>
    </div>
  );
}

export function BalanceChecker() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ code: string; balance: number; initialBalance: number } | null>(null);
  const [err, setErr] = useState("");
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(""); setRes(null);
    const r = await fetch("/api/giftcards/balance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
    const j = await r.json();
    setBusy(false);
    if (r.ok) setRes(j); else setErr(j.error ?? "Not found");
  };
  const apply = useCart((s) => s.setGiftCard);
  return (
    <div className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8">
      <h2 className="flex items-center gap-2 font-display text-3xl"><Gift className="text-gold-ink" /> Redeem or check balance</h2>
      <p className="mt-2 text-sm text-muted">Enter your gift card code at checkout, or check your remaining balance here. Try <code className="rounded bg-surface-2 px-1.5 font-mono">GIFT-DEMO-5000</code>.</p>
      <form onSubmit={check} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="gc-code" className="sr-only">Gift card code</label>
        <Input id="gc-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="GIFT-XXXX-XXXX" className="font-mono" required />
        <Button type="submit" loading={busy} className="shrink-0"><Search size={16} /> Check balance</Button>
      </form>
      <AnimatePresence>
        {res && (
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-blush p-5">
            <div><p className="font-mono text-sm">{res.code}</p><p className="font-display text-3xl">{money(res.balance)} <span className="text-base text-muted">of {money(res.initialBalance)}</span></p></div>
            <Button variant="gold" onClick={() => { apply(res.code); toast({ title: "Gift card will be applied at checkout", description: res.code }); }}>Apply to my bag</Button>
          </m.div>
        )}
        {err && <m.p role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, -6, 6, 0] }} className="mt-4 text-sm text-rose">{err}</m.p>}
      </AnimatePresence>
    </div>
  );
}
