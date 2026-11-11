"use client";
import { Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HeartIcon } from "./icons";
import { ProductImage } from "./product-image";
import { Badge, Price, Stars } from "./ui";
import { lineKey, toast, useCart, useHydrated, useUI, useWishlist } from "@/lib/client-store";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export const totalStock = (p: Product) => (p.variants?.options.length ? p.variants.options.reduce((a, o) => a + o.stock, 0) : p.stock);
export const defaultVariant = (p: Product) => p.variants?.options.find((o) => o.stock > 0) ?? p.variants?.options[0];
export const fromPrice = (p: Product) => (p.variants?.options.length ? Math.min(...p.variants.options.map((o) => o.price)) : p.price);

export function WishlistButton({ product, className, size = 20 }: { product: Product; className?: string; size?: number }) {
  const hydrated = useHydrated();
  const on = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const [burst, setBurst] = useState(0);
  const active = hydrated && on;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowOn = toggle(product.id);
        if (nowOn) setBurst((b) => b + 1);
        toast({ title: nowOn ? "Saved to wishlist" : "Removed from wishlist", description: product.name, image: product.images[0], action: nowOn ? { label: "View", href: "/account/wishlist" } : undefined });
      }}
      className={cn("grid h-11 w-11 place-items-center rounded-full bg-surface/85 text-fg shadow-soft backdrop-blur transition hover:scale-105 active:scale-90", className)}
    >
      <HeartIcon active={active} burst={burst} size={size} />
    </button>
  );
}

export function useQuickAdd() {
  const add = useCart((s) => s.add);
  const setCart = useUI((s) => s.setCart);
  return (p: Product) => {
    const v = defaultVariant(p);
    if (totalStock(p) <= 0 || (v && v.stock <= 0)) {
      toast({ title: "Sold out", description: `${p.name} is currently unavailable`, tone: "error" });
      return;
    }
    add({ key: lineKey(p.id, v?.id), productId: p.id, slug: p.slug, name: p.name, image: p.images[0], variantId: v?.id, variantLabel: v?.label, unitPrice: v?.price ?? p.price, quantity: 1 });
    toast({ title: "Added to your bag", description: `${p.name}${v ? ` · ${v.label}` : ""}`, image: p.images[0], action: { label: "View bag", onClick: () => setCart(true) } });
  };
}

export function ProductCard({ product: p, priority, layout = "grid" }: { product: Product; priority?: boolean; layout?: "grid" | "list" }) {
  const quickAdd = useQuickAdd();
  const stock = totalStock(p);
  const soldOut = stock <= 0;
  const price = fromPrice(p);
  const discount = p.compareAtPrice && p.compareAtPrice > p.price ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  const compareAt = price === p.price ? p.compareAtPrice : undefined;

  if (layout === "list") {
    return (
      <article className="group relative flex gap-4 rounded-3xl border border-line bg-surface p-3 shadow-soft transition hover:shadow-lift sm:gap-6 sm:p-4">
        <Link href={`/product/${p.slug}`} className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-2xl bg-surface-2 sm:w-44">
          <ProductImage src={p.images[0]} alt={p.name} fill sizes="176px" className="transition duration-700 ease-out-expo group-hover:scale-110" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {p.bestseller && <Badge tone="gold" className="mb-2">Best seller</Badge>}
              <h3 className="font-display text-lg leading-snug sm:text-xl"><Link href={`/product/${p.slug}`} className="after:absolute after:inset-0">{p.name}</Link></h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{p.subtitle}</p>
            </div>
            <WishlistButton product={p} className="relative z-10 shrink-0 bg-surface-2" />
          </div>
          {p.reviewCount > 0 && <div className="mt-2 flex items-center gap-2 text-xs text-muted"><Stars rating={p.rating} size={13} /> {p.rating} · {p.reviewCount} reviews</div>}
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <Price value={price} compareAt={compareAt} />
            <button type="button" disabled={soldOut} onClick={() => quickAdd(p)} className="relative z-10 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-on-ink transition active:scale-95 disabled:opacity-50">
              <ShoppingBag size={16} /> {soldOut ? "Sold out" : "Add"}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-surface-2 shadow-soft transition-shadow duration-500 group-hover:shadow-lift">
        <Link href={`/product/${p.slug}`} aria-label={p.name} className="absolute inset-0 z-[1]" />
        <ProductImage src={p.images[0]} alt={p.name} fill priority={priority} sizes="(min-width:1280px) 300px, (min-width:768px) 33vw, 50vw" className="transition duration-[900ms] ease-out-expo group-hover:scale-110" />
        {p.images[1] && <ProductImage src={p.images[1]} alt="" aria-hidden fill sizes="(min-width:1280px) 300px, (min-width:768px) 33vw, 50vw" className="opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />}
        <div className="pointer-events-none absolute left-3 top-3 z-[2] flex flex-col items-start gap-1.5">
          {soldOut ? <Badge tone="ink">Sold out</Badge> : discount ? <Badge tone="rose">−{discount}%</Badge> : p.isNew ? <Badge tone="ink">New</Badge> : p.bestseller ? <Badge tone="gold">Best seller</Badge> : null}
          {!soldOut && stock <= 5 && <Badge>Only {stock} left</Badge>}
        </div>
        <WishlistButton product={p} className="absolute right-3 top-3 z-[3]" />
        {/* quick add: slides up on hover (desktop); compact button on touch */}
        <div className="absolute inset-x-3 bottom-3 z-[3] hidden translate-y-[130%] transition duration-500 ease-out-expo group-focus-within:translate-y-0 group-hover:translate-y-0 md:block">
          <button type="button" disabled={soldOut} onClick={() => quickAdd(p)} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-surface/95 text-sm font-semibold shadow-lift backdrop-blur transition hover:bg-ink hover:text-on-ink active:scale-[0.98] disabled:opacity-60">
            <ShoppingBag size={16} /> {soldOut ? "Sold out" : "Quick add"}
          </button>
        </div>
        <button type="button" disabled={soldOut} onClick={() => quickAdd(p)} aria-label={`Quick add ${p.name}`} className="absolute bottom-3 right-3 z-[3] grid h-11 w-11 place-items-center rounded-full bg-ink text-on-ink shadow-lift transition active:scale-[0.85] disabled:opacity-50 md:hidden">
          <Plus size={20} />
        </button>
      </div>
      <div className="mt-3.5 space-y-1 px-1">
        {p.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-[0.72rem] text-muted"><Stars rating={p.rating} size={12} /> <span className="tabular-nums">({p.reviewCount})</span></div>
        )}
        <h3 className="line-clamp-2 font-display text-[1.02rem] leading-snug sm:text-[1.12rem]">
          <Link href={`/product/${p.slug}`} className="transition hover:text-gold-ink">{p.name}</Link>
        </h3>
        <div className="flex items-baseline gap-1 text-sm">
          {p.variants?.options.length ? <span className="text-xs text-muted">from</span> : null}
          <Price value={price} compareAt={compareAt} size="sm" />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton aspect-[4/5] rounded-[1.75rem]" />
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-4 w-4/5 rounded" />
      <div className="skeleton h-4 w-16 rounded" />
    </div>
  );
}
