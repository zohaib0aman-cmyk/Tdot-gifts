"use client";
import { useEffect, useState } from "react";
import type { CartLine, Quote } from "@/lib/types";

export function toQuoteLines(lines: CartLine[]) {
  return lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity, giftWrap: l.giftWrap, giftMessage: l.giftMessage, giftCard: l.giftCard }));
}

/** Server-authoritative pricing (shipping, state tax, promos, gift cards). */
export function useQuote(lines: CartLine[], opts: { state?: string; shippingRateId?: string; promoCode?: string; giftCardCode?: string }, enabled = true) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const key = JSON.stringify([toQuoteLines(lines), opts]);
  useEffect(() => {
    if (!enabled || !lines.length) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json" }, signal: ctrl.signal, body: JSON.stringify({ lines: toQuoteLines(lines), ...opts, state: opts.state || undefined }) });
        if (r.ok) setQuote(await r.json());
      } catch { /* aborted */ }
      setLoading(false);
    }, 120);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return { quote, loading };
}
