"use client";
import { AnimatePresence, m } from "framer-motion";
import { CalendarDays, Check, ChevronDown, Gift, MessageSquareHeart, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { QtyStepper } from "../cart";
import { WishlistButton } from "../product-card";
import { useSettings } from "../providers";
import { Badge, Button, Price, Stars, Textarea } from "../ui";
import { lineKey, toast, useCart, useUI } from "@/lib/client-store";
import type { Product } from "@/lib/types";
import { addDeliveryDays, cn, isoDate, money } from "@/lib/utils";

const subscribeClock = (cb: () => void) => { const t = setInterval(cb, 30_000); return () => clearInterval(t); };
const minuteNow = () => Math.floor(Date.now() / 60_000);

function DeliveryEstimate({ days, onPick, value }: { days: number; onPick: (d: string) => void; value: string }) {
  const nowMin = useSyncExternalStore(subscribeClock, minuteNow, () => 0);
  const now = nowMin ? new Date(nowMin * 60_000) : null;
  const cutoff = now ? new Date(now) : null;
  cutoff?.setHours(14, 0, 0, 0);
  const afterCutoff = now && cutoff ? now > cutoff : false;
  const lead = Math.max(0, days - 1) + (afterCutoff ? 1 : 0);
  const earliest = now ? (lead === 0 && now.getDay() !== 0 ? now : addDeliveryDays(now, Math.max(1, lead))) : null;
  const left = now && cutoff && !afterCutoff ? cutoff.getTime() - now.getTime() : 0;
  const options = earliest ? [earliest, ...Array.from({ length: 5 }, (_, i) => addDeliveryDays(earliest, i + 1))] : [];
  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <p className="flex items-start gap-2 text-sm">
        <Truck size={18} className="mt-0.5 shrink-0 text-gold-ink" />
        {earliest ? (
          <span>
            {left > 0 && <>Order within <strong className="text-rose">{Math.floor(left / 3_600_000)}h {Math.floor((left % 3_600_000) / 60_000)}m</strong> and </>}
            {left > 0 ? "it" : "It"} can arrive as soon as <strong>{earliest.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</strong>
          </span>
        ) : (
          <span className="skeleton h-4 w-56 rounded" />
        )}
      </p>
      <p className="mb-2 mt-4 flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted"><CalendarDays size={14} /> Choose a delivery date</p>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Delivery date">
        {options.map((d) => {
          const iso = isoDate(d);
          const sel = value === iso;
          return (
            <button key={iso} type="button" role="radio" aria-checked={sel} onClick={() => onPick(iso)} className={cn("flex min-h-[64px] min-w-[64px] flex-col items-center justify-center rounded-2xl border px-2 text-center transition", sel ? "border-ink bg-ink text-on-ink" : "border-line hover:border-gold")}>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider opacity-70">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
              <span className="font-display text-xl leading-none">{d.getDate()}</span>
              <span className="text-[0.65rem] opacity-70">{d.toLocaleDateString("en-US", { month: "short" })}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-14 w-full items-center justify-between text-left font-display text-lg">
        {title}<m.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={18} /></m.span>
      </button>
      <AnimatePresence initial={false}>
        {open && <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="pb-5 text-sm leading-relaxed text-muted">{children}</div></m.div>}
      </AnimatePresence>
    </div>
  );
}

export function PurchasePanel({ product: p, categoryName }: { product: Product; categoryName: string }) {
  const { giftWrapPrice } = useSettings();
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  const router = useRouter();
  const options = p.variants?.options ?? [];
  const [variantId, setVariantId] = useState(options.find((o) => o.stock > 0)?.id ?? options[0]?.id);
  const variant = options.find((o) => o.id === variantId);
  const [qty, setQty] = useState(1);
  const [wrap, setWrap] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [added, setAdded] = useState(false);
  const price = variant?.price ?? p.price;
  const stock = variant ? variant.stock : p.stock;
  const soldOut = stock <= 0;

  const doAdd = (buyNow = false) => {
    if (soldOut) return;
    add({
      key: lineKey(p.id, variant?.id, `${wrap ? "w" : ""}${message ? `m${message.length}${message.slice(0, 8)}` : ""}${date}`),
      productId: p.id, slug: p.slug, name: p.name, image: p.images[0], variantId: variant?.id, variantLabel: variant?.label,
      unitPrice: price, quantity: qty, giftWrap: wrap, giftMessage: message.trim() || undefined, deliveryDate: date || undefined,
    });
    if (buyNow) { router.push("/checkout"); return; }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    toast({ title: "Added to your bag", description: `${qty} × ${p.name}${variant ? ` · ${variant.label}` : ""}`, image: p.images[0], action: { label: "View bag", onClick: () => setCart(true) } });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="muted">{categoryName}</Badge>
          {p.bestseller && <Badge tone="gold">Best seller</Badge>}
          {p.isNew && <Badge tone="ink">New</Badge>}
        </div>
        <h1 className="text-[2.1rem] leading-[1.08] sm:text-5xl">{p.name}</h1>
        <p className="mt-3 text-muted">{p.subtitle}</p>
        {p.reviewCount > 0 && (
          <a href="#reviews" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm"><Stars rating={p.rating} /> <strong>{p.rating}</strong> <span className="text-muted underline underline-offset-4">{p.reviewCount} reviews</span></a>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span key={price} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
            <Price value={price} compareAt={!variant || price === p.price ? p.compareAtPrice : undefined} size="lg" className="[&>span:first-child]:font-display [&>span:first-child]:text-3xl" />
          </m.span>
        </AnimatePresence>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", soldOut ? "bg-rose/10 text-rose" : stock <= 5 ? "bg-amber-500/12 text-amber-900 dark:text-amber-300" : "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", soldOut ? "bg-rose" : stock <= 5 ? "animate-pulse bg-amber-500" : "bg-emerald-500")} />
          {soldOut ? "Sold out" : stock <= 5 ? `Only ${stock} left — order soon` : "In stock, ready to deliver"}
        </span>
      </div>
      <p className="text-xs text-muted">Pay in 4 interest-free installments of <strong className="text-fg">{money(price / 4)}</strong> at checkout.</p>

      {options.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-muted">{p.variants?.name}: <span className="text-fg">{variant?.label}</span></legend>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => {
              const sel = o.id === variantId;
              return (
                <button key={o.id} type="button" onClick={() => { setVariantId(o.id); setQty(1); }} aria-pressed={sel} disabled={o.stock <= 0}
                  className={cn("relative min-h-12 rounded-2xl border px-4 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45", sel ? "border-ink" : "border-line hover:border-gold")}>
                  {sel && <m.span layoutId={`var-${p.id}`} className="absolute inset-0 rounded-2xl bg-blush" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                  <span className="relative block font-semibold">{o.label}</span>
                  <span className="relative block text-xs text-muted">{o.stock <= 0 ? "Sold out" : money(o.price)}</span>
                  {o.stock <= 0 && <span className="absolute inset-x-3 top-1/2 h-px -rotate-6 bg-muted/60" aria-hidden />}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <DeliveryEstimate days={p.deliveryDays} value={date} onPick={setDate} />

      <div className="space-y-3 rounded-3xl border border-line bg-surface p-4">
        <label className="flex min-h-12 cursor-pointer items-center gap-3">
          <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} className="peer sr-only" />
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-line transition peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-4 peer-focus-visible:ring-gold/30">
            <AnimatePresence>{wrap && <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={15} className="text-on-ink" /></m.span>}</AnimatePresence>
          </span>
          <Gift size={18} className="text-gold-ink" />
          <span className="flex-1 text-sm"><strong>Luxury gift wrap</strong><span className="block text-xs text-muted">Black box, gold ribbon & wax seal</span></span>
          <span className="text-sm font-semibold tabular-nums">+{money(giftWrapPrice)}</span>
        </label>
        <div>
          <label htmlFor="gift-msg" className="mb-2 flex items-center gap-2 text-sm font-semibold"><MessageSquareHeart size={17} className="text-gold-ink" /> Free handwritten gift message</label>
          <Textarea id="gift-msg" value={message} maxLength={250} onChange={(e) => setMessage(e.target.value)} placeholder="Happy birthday, my love! Can't wait to celebrate you ❤️" className="min-h-24 text-sm" />
          <p className="mt-1 text-right text-xs tabular-nums text-muted">{message.length}/250</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <QtyStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(20, stock))} />
        <Button size="lg" onClick={() => doAdd()} disabled={soldOut} className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <m.span key="ok" className="flex items-center gap-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><m.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} /></svg> Added!
              </m.span>
            ) : (
              <m.span key="add" className="flex items-center gap-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                <ShoppingBag size={18} /> {soldOut ? "Sold out" : `Add to bag · ${money(price * qty + (wrap ? giftWrapPrice * qty : 0))}`}
              </m.span>
            )}
          </AnimatePresence>
        </Button>
        <WishlistButton product={p} className="h-14 w-14 shrink-0 border border-line bg-surface shadow-none" size={22} />
      </div>
      <Button variant="gold" size="lg" className="w-full" disabled={soldOut} onClick={() => doAdd(true)}><Zap size={17} /> Buy it now</Button>

      <ul className="grid grid-cols-3 gap-2 text-center text-[0.72rem] text-muted">
        {[[ShieldCheck, "Secure checkout"], [Truck, "Tracked delivery"], [Gift, "Happiness guarantee"]].map(([I, t]) => {
          const Icon = I as typeof Truck;
          return <li key={t as string} className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-2/70 p-3"><Icon size={18} className="text-gold-ink" />{t as string}</li>;
        })}
      </ul>

      <div>
        <Accordion title="Description" defaultOpen><p>{p.description}</p></Accordion>
        <Accordion title="What's included"><ul className="list-disc space-y-1 pl-5">{p.details.map((d) => <li key={d}>{d}</li>)}</ul></Accordion>
        <Accordion title="Delivery & care">
          <p>Hand-delivered in 40+ US metros, shipped with USPS, UPS or FedEx everywhere else. Choose your delivery date above — we&apos;ll email tracking as soon as it&apos;s on the way. Perishables (flowers, cakes, berries) are delivered same-day or overnight only. Covered by our 48-hour happiness guarantee.</p>
        </Accordion>
      </div>

      {/* sticky mobile bar */}
      <div className="pb-safe fixed inset-x-0 bottom-[64px] z-40 border-t border-line bg-surface/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-xs text-muted tabular-nums">{money(price)}{variant ? ` · ${variant.label}` : ""}</p></div>
          <Button onClick={() => doAdd()} disabled={soldOut} className="shrink-0"><ShoppingBag size={16} /> {soldOut ? "Sold out" : added ? "Added!" : "Add to bag"}</Button>
        </div>
      </div>
    </div>
  );
}
