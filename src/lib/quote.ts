import "server-only";
import { z } from "zod";
import { findGiftCard, findPromo, getSettings, listProducts } from "./db";
import type { OrderLine, Quote, ShippingRate, SiteSettings } from "./types";
import { round2 } from "./utils";

export const lineInputSchema = z.object({
  productId: z.string().min(1).max(64),
  variantId: z.string().max(64).optional(),
  quantity: z.number().int().min(1).max(20),
  giftWrap: z.boolean().optional(),
  giftMessage: z.string().max(300).optional(),
  giftCard: z
    .object({
      amount: z.number().min(10).max(1000),
      recipientName: z.string().min(1).max(80),
      recipientEmail: z.email().max(160),
      senderName: z.string().min(1).max(80),
      message: z.string().max(300).optional(),
    })
    .optional(),
});

export const quoteInputSchema = z.object({
  lines: z.array(lineInputSchema).min(1).max(50),
  state: z.string().length(2).optional(),
  shippingRateId: z.string().max(40).optional(),
  promoCode: z.string().max(40).optional(),
  giftCardCode: z.string().max(40).optional(),
});
export type QuoteInput = z.infer<typeof quoteInputSchema>;

export const GIFT_CARD_PRODUCT_ID = "giftcard";

export function enabledRates(s: SiteSettings): ShippingRate[] {
  return s.shippingRates.filter((r) => r.enabled).sort((a, b) => a.price - b.price);
}

export async function computeQuote(input: QuoteInput): Promise<Quote> {
  const [settings, products] = await Promise.all([getSettings(), listProducts()]);
  const errors: string[] = [];
  const lines: OrderLine[] = [];
  let physicalSubtotal = 0;
  let giftCardSubtotal = 0;
  let wrapCount = 0;

  for (const li of input.lines) {
    if (li.productId === GIFT_CARD_PRODUCT_ID) {
      if (!li.giftCard) { errors.push("Gift card details are missing."); continue; }
      const amt = round2(li.giftCard.amount);
      lines.push({ productId: GIFT_CARD_PRODUCT_ID, slug: "gift-cards", name: `Digital Gift Card — $${amt}`, image: "/brand/gift-card.svg", unitPrice: amt, quantity: li.quantity, giftCard: li.giftCard });
      giftCardSubtotal += amt * li.quantity;
      continue;
    }
    const p = products.find((x) => x.id === li.productId);
    if (!p) { errors.push("An item in your cart is no longer available."); continue; }
    let price = p.price;
    let label: string | undefined;
    let stock = p.stock;
    if (p.variants?.options.length) {
      const v = p.variants.options.find((o) => o.id === li.variantId) ?? p.variants.options[0];
      price = v.price;
      label = v.label;
      stock = v.stock;
    }
    if (stock <= 0) { errors.push(`${p.name}${label ? ` (${label})` : ""} is sold out.`); continue; }
    const qty = Math.min(li.quantity, stock);
    if (qty < li.quantity) errors.push(`Only ${stock} left of ${p.name}${label ? ` (${label})` : ""}; quantity adjusted.`);
    lines.push({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], variantLabel: label, unitPrice: price, quantity: qty, giftWrap: !!li.giftWrap, giftMessage: li.giftMessage?.trim() || undefined });
    physicalSubtotal += price * qty;
    if (li.giftWrap) wrapCount += qty;
  }

  physicalSubtotal = round2(physicalSubtotal);
  const subtotal = round2(physicalSubtotal + giftCardSubtotal);
  const giftWrapTotal = round2(wrapCount * settings.giftWrapPrice);

  // ---- promo
  let discount = 0;
  let freeShipPromo = false;
  let promo: Quote["promo"];
  if (input.promoCode?.trim()) {
    const pc = await findPromo(input.promoCode);
    const expired = pc?.expiresAt && Date.parse(pc.expiresAt) < Date.now();
    const exhausted = pc?.usageLimit != null && pc.used >= pc.usageLimit;
    if (!pc || !pc.active || expired || exhausted) errors.push("That promo code isn't valid or has expired.");
    else if (pc.minSubtotal && physicalSubtotal < pc.minSubtotal) errors.push(`${pc.code} needs a subtotal of $${pc.minSubtotal} or more.`);
    else {
      if (pc.type === "percent") discount = round2((physicalSubtotal * pc.value) / 100);
      else if (pc.type === "fixed") discount = Math.min(pc.value, physicalSubtotal);
      else freeShipPromo = true;
      promo = { code: pc.code, description: pc.description || (pc.type === "percent" ? `${pc.value}% off` : pc.type === "fixed" ? `$${pc.value} off` : "Free shipping") };
    }
  }

  // ---- shipping
  const rates = enabledRates(settings);
  const needsShipping = physicalSubtotal > 0;
  let shipping = 0;
  let shippingRateId = "email";
  let shippingLabel = "Email delivery";
  if (needsShipping && rates.length) {
    const rate = rates.find((r) => r.id === input.shippingRateId) ?? rates[0];
    const standard = rates[0];
    const qualifiesFree = freeShipPromo || physicalSubtotal - discount >= settings.freeShippingThreshold;
    shipping = qualifiesFree ? round2(Math.max(0, rate.price - standard.price)) : rate.price;
    shippingRateId = rate.id;
    shippingLabel = rate.name;
  }
  const freeShippingRemaining = needsShipping ? round2(Math.max(0, settings.freeShippingThreshold - (physicalSubtotal - discount))) : 0;

  // ---- tax (physical goods + wrap; gift cards are not taxable)
  const taxRate = input.state ? settings.taxRates[input.state.toUpperCase()] ?? 0 : 0;
  const tax = round2(((physicalSubtotal - discount + giftWrapTotal) * taxRate) / 100);

  let total = round2(subtotal - discount + giftWrapTotal + shipping + tax);

  // ---- gift card redemption
  let giftCardApplied = 0;
  let giftCard: Quote["giftCard"];
  if (input.giftCardCode?.trim()) {
    const gc = await findGiftCard(input.giftCardCode);
    if (!gc || !gc.active || gc.balance <= 0) errors.push("That gift card code isn't valid or has no balance.");
    else {
      giftCardApplied = round2(Math.min(gc.balance, total));
      total = round2(total - giftCardApplied);
      giftCard = { code: gc.code, remaining: round2(gc.balance - giftCardApplied) };
    }
  }

  return { lines, subtotal, discount, giftWrapTotal, shipping, shippingRateId, shippingLabel, tax, taxRate, giftCardApplied, total, promo, giftCard, freeShippingRemaining, errors };
}
