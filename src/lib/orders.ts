import "server-only";
import { findGiftCard, findPromo, generateGiftCode, getCustomerByEmail, getOrder, getProductById, newId, saveGiftCard, saveOrder, savePromo, saveProduct } from "./db";
import { sendGiftCardEmail, sendOrderConfirmation } from "./email";
import { GIFT_CARD_PRODUCT_ID } from "./quote";
import type { Order, OrderStatus } from "./types";

/** Marks an order paid exactly once: stock, promo usage, gift cards, confirmation email. */
export async function finalizeOrder(orderId: string, patch: Partial<Order> = {}) {
  const order = await getOrder(orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.status !== "pending" && order.status !== "failed") return order; // idempotent

  // inventory
  for (const line of order.lines) {
    if (line.productId === GIFT_CARD_PRODUCT_ID) continue;
    const p = await getProductById(line.productId);
    if (!p) continue;
    if (p.variants?.options.length) {
      const v = p.variants.options.find((o) => o.label === line.variantLabel);
      if (v) v.stock = Math.max(0, v.stock - line.quantity);
    } else p.stock = Math.max(0, p.stock - line.quantity);
    const { rating: _r, reviewCount: _c, ...rest } = p;
    void _r; void _c;
    await saveProduct({ ...rest, rating: 0, reviewCount: 0 });
  }
  // promo usage
  if (order.promoCode) {
    const pc = await findPromo(order.promoCode);
    if (pc) await savePromo({ ...pc, used: pc.used + 1 });
  }
  // gift card redemption
  if (order.giftCardCode && order.giftCardApplied > 0) {
    const gc = await findGiftCard(order.giftCardCode);
    if (gc) await saveGiftCard({ ...gc, balance: Math.max(0, Math.round((gc.balance - order.giftCardApplied) * 100) / 100) });
  }
  // issue purchased gift cards
  for (const line of order.lines) {
    if (line.productId !== GIFT_CARD_PRODUCT_ID || !line.giftCard) continue;
    for (let i = 0; i < line.quantity; i++) {
      const card = { id: newId("gc"), code: generateGiftCode(), initialBalance: line.unitPrice, balance: line.unitPrice, recipientEmail: line.giftCard.recipientEmail, recipientName: line.giftCard.recipientName, senderName: line.giftCard.senderName, message: line.giftCard.message, orderId: order.id, active: true, createdAt: new Date().toISOString() };
      await saveGiftCard(card);
      await sendGiftCardEmail(card);
    }
  }
  const customer = order.customerId ? null : await getCustomerByEmail(order.email);
  const paid: Order = {
    ...order,
    ...patch,
    customerId: order.customerId ?? customer?.id,
    status: "paid",
    events: [...order.events, { status: "paid", message: "Payment received — thank you!", at: new Date().toISOString() }],
  };
  await saveOrder(paid);
  await sendOrderConfirmation(paid);
  return paid;
}

export async function markOrder(orderId: string, status: OrderStatus, message: string, patch: Partial<Order> = {}) {
  const order = await getOrder(orderId);
  if (!order) return null;
  const next: Order = { ...order, ...patch, status, events: [...order.events, { status, message, at: new Date().toISOString() }] };
  await saveOrder(next);
  return next;
}
