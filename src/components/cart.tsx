"use client";
import { AnimatePresence, m } from "framer-motion";
import { Gift, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { ProductImage } from "./product-image";
import { useSettings } from "./providers";
import { ButtonLink } from "./ui";
import { cartCount, cartSubtotal, useCart, useHydrated, useUI } from "@/lib/client-store";
import type { CartLine } from "@/lib/types";
import { cn, money } from "@/lib/utils";

export function FreeShippingBar({ subtotal, className }: { subtotal: number; className?: string }) {
  const { freeShippingThreshold: t } = useSettings();
  const pct = Math.min(1, subtotal / t);
  const remaining = Math.max(0, t - subtotal);
  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex items-center gap-2 text-sm">
        <Truck size={16} className="text-gold-ink" />
        {remaining > 0 ? (
          <span>You&apos;re <strong className="tabular-nums">{money(remaining)}</strong> away from <strong>free delivery</strong></span>
        ) : (
          <span><strong>Yay!</strong> Your order ships free 🎉</span>
        )}
      </p>
      <div className="relative h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
        <m.div className="gold-bg absolute inset-y-0 left-0 rounded-full" initial={false} animate={{ width: `${pct * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        {pct >= 1 && <m.div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)]" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.2, repeat: 2 }} />}
      </div>
    </div>
  );
}

export function QtyStepper({ value, onChange, min = 1, max = 20, size = "md" }: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-10" : "h-12";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-surface", h)}>
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)} className={cn("grid place-items-center rounded-full transition hover:bg-surface-2 disabled:opacity-40", size === "sm" ? "h-10 w-10" : "h-12 w-12")}><Minus size={15} /></button>
      <span className="relative w-7 overflow-hidden text-center text-sm font-semibold tabular-nums" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span key={value} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.18 }}>{value}</m.span>
        </AnimatePresence>
      </span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className={cn("grid place-items-center rounded-full transition hover:bg-surface-2 disabled:opacity-40", size === "sm" ? "h-10 w-10" : "h-12 w-12")}><Plus size={15} /></button>
    </div>
  );
}

export function CartLineRow({ line, compact }: { line: CartLine; compact?: boolean }) {
  const { setQty, remove } = useCart();
  const { setCart } = useUI();
  const href = line.giftCard ? "/gift-cards" : `/product/${line.slug}`;
  return (
    <m.li layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }} transition={{ type: "spring", stiffness: 380, damping: 34 }} className="flex gap-4 overflow-hidden py-4">
      <Link href={href} onClick={() => setCart(false)} className={cn("relative shrink-0 overflow-hidden rounded-2xl bg-surface-2", compact ? "h-24 w-20" : "h-32 w-28")}>
        <ProductImage src={line.image} alt={line.name} fill sizes="112px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={href} onClick={() => setCart(false)} className="line-clamp-2 font-display text-[1.02rem] leading-snug hover:text-gold-ink">{line.name}</Link>
            {line.variantLabel && <p className="mt-0.5 text-xs text-muted">{line.variantLabel}</p>}
            {line.giftCard && <p className="mt-0.5 truncate text-xs text-muted">To {line.giftCard.recipientName} · {line.giftCard.recipientEmail}</p>}
          </div>
          <button type="button" onClick={() => remove(line.key)} aria-label={`Remove ${line.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-rose/10 hover:text-rose"><Trash2 size={16} /></button>
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {line.giftWrap && <span className="inline-flex items-center gap-1 rounded-full bg-blush px-2 py-0.5 text-[0.68rem] font-semibold"><Gift size={11} /> Gift wrapped</span>}
          {line.giftMessage && <span className="max-w-full truncate rounded-full bg-surface-2 px-2 py-0.5 text-[0.68rem] italic text-muted">“{line.giftMessage}”</span>}
          {line.deliveryDate && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.68rem] text-muted">Deliver {new Date(line.deliveryDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <QtyStepper size="sm" value={line.quantity} onChange={(q) => setQty(line.key, q)} />
          <span className="font-semibold tabular-nums">{money(line.unitPrice * line.quantity)}</span>
        </div>
      </div>
    </m.li>
  );
}

export function EmptyCart({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <m.div className="relative mb-6 grid h-28 w-28 place-items-center rounded-full bg-blush" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
        <m.span animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}><ShoppingBag size={44} strokeWidth={1.3} className="text-gold-ink" /></m.span>
        <m.span className="absolute right-3 top-3 text-xl" animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>✨</m.span>
      </m.div>
      <h3 className="font-display text-2xl">Your bag is waiting for something special</h3>
      <p className="mt-2 max-w-xs text-sm text-muted">Roses, teddy bears, cakes or a full surprise setup — let&apos;s make someone smile today.</p>
      <ButtonLink href="/shop" onClick={onBrowse} className="mt-6">Explore gifts</ButtonLink>
      <Link href="/shop?category=surprise-packages" onClick={onBrowse} className="mt-3 min-h-11 py-3 text-sm font-semibold text-gold-ink underline-offset-4 hover:underline">See surprise packages</Link>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, setCart } = useUI();
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();
  const items = hydrated ? lines : [];
  const subtotal = cartSubtotal(items);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCart(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [cartOpen, setCart]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <m.div className="fixed inset-0 z-[65] bg-black/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCart(false)} />
          <m.aside role="dialog" aria-modal="true" aria-label="Shopping bag" className="fixed inset-y-0 right-0 z-[66] flex w-full max-w-md flex-col bg-surface shadow-lift sm:rounded-l-[2rem]" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 330, damping: 36 }}>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-2xl">Your bag <span className="align-middle text-sm font-sans font-semibold text-muted">({cartCount(items)})</span></h2>
              <button autoFocus onClick={() => setCart(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2" aria-label="Close bag"><m.span whileHover={{ rotate: 90 }}><X size={20} /></m.span></button>
            </div>
            {items.length === 0 ? (
              <EmptyCart onBrowse={() => setCart(false)} />
            ) : (
              <>
                <div className="border-b border-line px-5 py-4"><FreeShippingBar subtotal={subtotal} /></div>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {items.map((l) => <CartLineRow key={l.key} line={l} compact />)}
                  </AnimatePresence>
                </ul>
                <div className="space-y-3 border-t border-line bg-surface-2/50 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Subtotal</span>
                    <m.span key={subtotal} initial={{ scale: 1.08 }} animate={{ scale: 1 }} className="font-display text-2xl tabular-nums">{money(subtotal)}</m.span>
                  </div>
                  <p className="text-xs text-muted">Shipping, taxes and promo codes are calculated at checkout.</p>
                  <ButtonLink href="/checkout" onClick={() => setCart(false)} size="lg" className="w-full">Secure checkout</ButtonLink>
                  <ButtonLink href="/cart" onClick={() => setCart(false)} variant="outline" className="w-full">View full bag</ButtonLink>
                </div>
              </>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
