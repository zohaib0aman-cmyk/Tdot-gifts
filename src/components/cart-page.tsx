"use client";
import { AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { CartLineRow, EmptyCart, FreeShippingBar } from "./cart";
import { CodeInputs, Totals } from "./checkout/summary";
import { useQuote } from "./checkout/use-quote";
import { ProductCard } from "./product-card";
import { ButtonLink, Container, SectionHeading } from "./ui";
import { cartCount, useCart, useHydrated } from "@/lib/client-store";
import type { Product } from "@/lib/types";

export function CartPageView({ suggestions }: { suggestions: Product[] }) {
  const hydrated = useHydrated();
  const { lines, promoCode, giftCardCode } = useCart();
  const items = hydrated ? lines : [];
  const { quote, loading } = useQuote(items, { promoCode, giftCardCode }, hydrated);
  const inBag = new Set(items.map((l) => l.productId));
  return (
    <Container className="py-8 sm:py-12">
      <h1 className="text-4xl sm:text-6xl">Your bag {items.length > 0 && <span className="align-middle font-sans text-lg text-muted">({cartCount(items)} items)</span>}</h1>
      {!hydrated ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]"><div className="space-y-4">{[0, 1].map((i) => <div key={i} className="skeleton h-36 rounded-3xl" />)}</div><div className="skeleton h-80 rounded-[2rem]" /></div>
      ) : items.length === 0 ? (
        <div className="mx-auto max-w-lg"><EmptyCart /></div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px] [&>*]:min-w-0">
          <div>
            <FreeShippingBar subtotal={quote ? quote.subtotal - quote.discount : 0} className="mb-4 rounded-3xl border border-line bg-surface p-5" />
            <ul className="divide-y divide-line rounded-3xl border border-line bg-surface px-4 sm:px-6">
              <AnimatePresence initial={false}>{items.map((l) => <CartLineRow key={l.key} line={l} />)}</AnimatePresence>
            </ul>
          </div>
          <aside>
            <div className="sticky top-24 space-y-5 rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-7">
              <h2 className="font-display text-2xl">Summary</h2>
              <CodeInputs quote={quote} />
              <div className="border-t border-line pt-4"><Totals quote={quote} loading={loading} /></div>
              <p className="text-xs text-muted">Shipping method & state sales tax are confirmed at checkout.</p>
              <ButtonLink href="/checkout" size="lg" className="w-full"><Lock size={16} /> Secure checkout</ButtonLink>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted"><ShieldCheck size={14} /> Card · Apple Pay · Google Pay · PayPal</p>
            </div>
          </aside>
        </div>
      )}
      {suggestions.filter((p) => !inBag.has(p.id)).length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="Little extras" title="Make it even sweeter" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-4">{suggestions.filter((p) => !inBag.has(p.id)).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </Container>
  );
}
