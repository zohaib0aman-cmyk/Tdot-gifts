"use client";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown, CreditCard, Gift, Tag, X } from "lucide-react";
import { useState } from "react";
import { ProductImage } from "../product-image";
import { Button, Input } from "../ui";
import { useCart } from "@/lib/client-store";
import type { CartLine, Quote } from "@/lib/types";
import { cn, money } from "@/lib/utils";

function AnimatedMoney({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span key={value.toFixed(2)} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.25 }}>{money(value)}</m.span>
      </AnimatePresence>
    </span>
  );
}

export function CodeInputs({ quote }: { quote: Quote | null }) {
  const { promoCode, giftCardCode, setPromo, setGiftCard } = useCart();
  const [promo, setPromoInput] = useState("");
  const [gift, setGiftInput] = useState("");
  const [open, setOpen] = useState<"promo" | "gift" | null>(null);
  const promoErr = quote?.errors.find((e) => e.toLowerCase().includes("promo") || e.includes("needs a subtotal"));
  const giftErr = quote?.errors.find((e) => e.toLowerCase().includes("gift card"));
  return (
    <div className="space-y-3">
      {[
        { k: "promo" as const, icon: Tag, label: "Promo code", applied: promoCode, ok: quote?.promo, err: promoErr, val: promo, set: setPromoInput, apply: () => setPromo(promo.trim().toUpperCase() || undefined), remove: () => setPromo(undefined), ph: "WELCOME10" },
        { k: "gift" as const, icon: Gift, label: "Gift card", applied: giftCardCode, ok: quote?.giftCard, err: giftErr, val: gift, set: setGiftInput, apply: () => setGiftCard(gift.trim().toUpperCase() || undefined), remove: () => setGiftCard(undefined), ph: "GIFT-XXXX-XXXX" },
      ].map((c) => (
        <div key={c.k}>
          {c.applied && c.ok ? (
            <m.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex min-h-12 items-center justify-between rounded-2xl border border-dashed border-gold bg-gold/10 px-4 text-sm">
              <span className="flex items-center gap-2"><c.icon size={16} className="text-gold-ink" /><strong>{c.applied}</strong><span className="text-muted">{c.k === "promo" ? quote?.promo?.description : `${money(quote?.giftCard?.remaining ?? 0)} left after this order`}</span></span>
              <button type="button" onClick={c.remove} aria-label={`Remove ${c.label}`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface"><X size={15} /></button>
            </m.div>
          ) : (
            <>
              <button type="button" onClick={() => setOpen(open === c.k ? null : c.k)} aria-expanded={open === c.k} className="flex min-h-11 w-full items-center justify-between text-sm font-semibold">
                <span className="flex items-center gap-2"><c.icon size={16} className="text-gold-ink" /> Add {c.label.toLowerCase()}</span>
                <m.span animate={{ rotate: open === c.k ? 180 : 0 }}><ChevronDown size={16} /></m.span>
              </button>
              <AnimatePresence initial={false}>
                {(open === c.k || (c.applied && c.err)) && (
                  <m.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" onSubmit={(e) => { e.preventDefault(); c.apply(); }}>
                    <div className="flex gap-2 pt-1">
                      <Input aria-label={c.label} value={c.val} onChange={(e) => c.set(e.target.value)} placeholder={c.ph} className="uppercase placeholder:normal-case" />
                      <Button type="submit" variant="outline" className="shrink-0">Apply</Button>
                    </div>
                    {c.applied && c.err && <m.p initial={{ x: -6 }} animate={{ x: [0, -6, 6, -3, 0] }} className="mt-2 text-sm text-rose" role="alert">{c.err}</m.p>}
                  </m.form>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function Totals({ quote, loading }: { quote: Quote | null; loading?: boolean }) {
  if (!quote) return <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-4 rounded" />)}<div className="skeleton h-7 rounded" /></div>;
  const row = (label: React.ReactNode, v: React.ReactNode, cls = "") => <div className={cn("flex items-center justify-between gap-4", cls)}><dt className="text-muted">{label}</dt><dd className="tabular-nums">{v}</dd></div>;
  return (
    <dl className={cn("space-y-2.5 text-sm transition-opacity", loading && "opacity-60")}>
      {row("Subtotal", <AnimatedMoney value={quote.subtotal} />)}
      {quote.discount > 0 && row(<span>Discount <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-ink">{quote.promo?.code}</span></span>, <span className="text-emerald-700 dark:text-emerald-400">−<AnimatedMoney value={quote.discount} /></span>)}
      {quote.giftWrapTotal > 0 && row("Gift wrap", <AnimatedMoney value={quote.giftWrapTotal} />)}
      {row(<span>Shipping <span className="block text-xs">{quote.shippingLabel}</span></span>, quote.shipping === 0 ? <span className="font-semibold text-emerald-700 dark:text-emerald-400">Free</span> : <AnimatedMoney value={quote.shipping} />)}
      {row(<span>Sales tax{quote.taxRate ? ` (${quote.taxRate}%)` : ""}</span>, quote.taxRate || quote.tax ? <AnimatedMoney value={quote.tax} /> : <span className="text-xs text-muted">Calculated from state</span>)}
      {quote.giftCardApplied > 0 && row("Gift card", <span className="text-emerald-700 dark:text-emerald-400">−<AnimatedMoney value={quote.giftCardApplied} /></span>)}
      <div className="!mt-4 flex items-end justify-between border-t border-line pt-4">
        <dt className="font-display text-xl">Total</dt>
        <dd className="text-right"><span className="mr-1.5 text-xs text-muted">USD</span><AnimatedMoney value={quote.total} className="font-display text-3xl" /></dd>
      </div>
    </dl>
  );
}

export function OrderSummary({ lines, quote, loading, collapsible }: { lines: CartLine[]; quote: Quote | null; loading?: boolean; collapsible?: boolean }) {
  const [open, setOpen] = useState(!collapsible);
  const body = (
    <div className="space-y-5">
      <ul className="space-y-4">
        {lines.map((l) => (
          <li key={l.key} className="flex items-center gap-3">
            <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
              <ProductImage src={l.image} alt={l.name} fill sizes="56px" />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-on-ink">{l.quantity}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{l.name}</p>
              <p className="truncate text-xs text-muted">{[l.variantLabel, l.giftWrap && "Gift wrapped", l.giftCard && `To ${l.giftCard.recipientEmail}`].filter(Boolean).join(" · ")}</p>
            </div>
            <span className="text-sm tabular-nums">{money(l.unitPrice * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-line pt-4"><CodeInputs quote={quote} /></div>
      <div className="border-t border-line pt-4"><Totals quote={quote} loading={loading} /></div>
      <p className="flex items-center gap-2 text-xs text-muted"><CreditCard size={14} /> Prices in USD. International cards welcome.</p>
    </div>
  );
  if (!collapsible) return body;
  return (
    <div className="rounded-3xl border border-line bg-surface">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-14 w-full items-center justify-between px-4 text-sm font-semibold">
        <span className="flex items-center gap-2">{open ? "Hide" : "Show"} order summary <m.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={16} /></m.span></span>
        {quote ? <AnimatedMoney value={quote.total} className="font-display text-xl" /> : <span className="skeleton h-5 w-16 rounded" />}
      </button>
      <AnimatePresence initial={false}>
        {open && <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="border-t border-line p-4">{body}</div></m.div>}
      </AnimatePresence>
    </div>
  );
}
