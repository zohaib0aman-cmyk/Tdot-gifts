import type { Customer, GiftCard, Order, OrderStatus, PromoCode } from "@/lib/types";
import { SEED_PRODUCTS } from "./catalog";

/** Deterministic demo history so the admin dashboard has meaningful charts on first launch. */
let s = 42;
const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];

const FIRST = ["Jasmine", "Michael", "Priya", "Danielle", "Carlos", "Ayesha", "Brittany", "Omar", "Sarah", "Kevin", "Fatima", "Lauren", "Hamza", "Emily", "Marcus", "Sofia", "Zara", "Tyler"];
const LAST = ["Robinson", "Thompson", "Shah", "Williams", "Martinez", "Khan", "Lee", "Farooq", "Johnson", "O'Brien", "Zaidi", "Parker", "Ali", "Chen", "Brown", "Garcia", "Hussain", "Nguyen"];
const PLACES: [string, string, string][] = [
  ["Atlanta", "GA", "30303"], ["Houston", "TX", "77002"], ["Edison", "NJ", "08817"], ["Charlotte", "NC", "28202"], ["Miami", "FL", "33130"],
  ["Chicago", "IL", "60601"], ["Phoenix", "AZ", "85004"], ["Dallas", "TX", "75201"], ["Brooklyn", "NY", "11201"], ["Seattle", "WA", "98101"],
  ["Dearborn", "MI", "48126"], ["Nashville", "TN", "37203"], ["Austin", "TX", "78701"], ["San Diego", "CA", "92101"], ["Baltimore", "MD", "21201"],
  ["Los Angeles", "CA", "90012"], ["Orlando", "FL", "32801"], ["Denver", "CO", "80202"],
];
const STREETS = ["Peachtree St", "Main St", "Oak Ave", "Maple Dr", "Sunset Blvd", "Lakeview Rd", "Elm St", "Cedar Ln", "Park Ave", "Magnolia Way"];

const NOW = Date.parse("2026-11-10T15:00:00Z");
const DAY = 86_400_000;

export const DEMO_CUSTOMERS: Customer[] = FIRST.map((f, i) => ({
  id: `c_${String(i + 1).padStart(3, "0")}`,
  email: `${f.toLowerCase()}.${LAST[i].toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
  firstName: f,
  lastName: LAST[i],
  addresses: [{
    id: `a_${i}`, label: "Home", firstName: f, lastName: LAST[i], line1: `${100 + Math.floor(r() * 9000)} ${pick(STREETS)}`,
    city: PLACES[i][0], state: PLACES[i][1], zip: PLACES[i][2], phone: `(555) 01${String(i).padStart(2, "0")}-${1000 + i * 37}`, isDefault: true,
  }],
  wishlist: [],
  marketing: r() > 0.4,
  createdAt: new Date(NOW - (60 + i * 4) * DAY).toISOString(),
}));

const RATES = [
  { id: "usps-ground", label: "USPS Ground Advantage", price: 7.95 },
  { id: "ups-ground", label: "UPS Ground", price: 10.95 },
  { id: "usps-priority", label: "USPS Priority Mail", price: 12.95 },
  { id: "fedex-overnight", label: "FedEx Priority Overnight", price: 34.95 },
];

function statusFor(ageDays: number): OrderStatus {
  if (ageDays < 1) return pick(["paid", "processing"] as const);
  if (ageDays < 3) return pick(["processing", "shipped", "out_for_delivery"] as const);
  const x = r();
  if (x < 0.04) return "refunded";
  if (x < 0.07) return "cancelled";
  return "delivered";
}

export const DEMO_ORDERS: Order[] = [];
for (let i = 0; i < 90; i++) {
  const age = Math.pow(r(), 1.1) * 60; // more recent orders weighted
  const created = NOW - age * DAY;
  const cust = DEMO_CUSTOMERS[Math.floor(r() * DEMO_CUSTOMERS.length)];
  const nLines = 1 + Math.floor(r() * 2.2);
  const lines = Array.from({ length: nLines }, () => {
    const p = SEED_PRODUCTS[Math.floor(Math.pow(r(), 1.6) * SEED_PRODUCTS.length)];
    const v = p.variants?.options[Math.floor(r() * p.variants.options.length)];
    return { productId: p.id, slug: p.slug, name: p.name, image: p.images[0], variantLabel: v?.label, unitPrice: v?.price ?? p.price, quantity: r() > 0.85 ? 2 : 1, giftWrap: r() > 0.6, giftMessage: r() > 0.5 ? "Happy birthday, my love! ❤️" : undefined };
  });
  const subtotal = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
  const giftWrapTotal = lines.filter((l) => l.giftWrap).length * 6.95;
  const rate = pick(RATES);
  const shipping = subtotal >= 99 && rate.id === "usps-ground" ? 0 : rate.price;
  const discount = r() > 0.8 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const addr = cust.addresses[0];
  const tax = Math.round((subtotal - discount + giftWrapTotal) * 0.065 * 100) / 100;
  const total = Math.round((subtotal - discount + giftWrapTotal + shipping + tax) * 100) / 100;
  const status = statusFor(age);
  const at = (h: number) => new Date(created + h * 3_600_000).toISOString();
  const events: Order["events"] = [{ status: "paid", message: "Payment received", at: at(0) }];
  if (["processing", "shipped", "out_for_delivery", "delivered"].includes(status)) events.push({ status: "processing", message: "Our florists & gift stylists are preparing your order", at: at(3) });
  if (["shipped", "out_for_delivery", "delivered"].includes(status)) events.push({ status: "shipped", message: `Shipped via ${rate.label}`, at: at(20) });
  if (["out_for_delivery", "delivered"].includes(status)) events.push({ status: "out_for_delivery", message: "Out for delivery", at: at(40) });
  if (status === "delivered") events.push({ status: "delivered", message: "Delivered — front door, handed to recipient", at: at(46) });
  if (status === "refunded") events.push({ status: "refunded", message: "Refund issued to original payment method", at: at(30) });
  if (status === "cancelled") events.push({ status: "cancelled", message: "Cancelled at customer's request", at: at(2) });
  DEMO_ORDERS.push({
    id: `o_demo_${i}`,
    number: `GS-${10120 + i}`,
    email: cust.email,
    customerId: cust.id,
    shippingAddress: { ...addr },
    lines,
    subtotal, discount, giftWrapTotal, shipping, tax, giftCardApplied: 0, total,
    promoCode: discount ? "WELCOME10" : undefined,
    shippingRateId: rate.id,
    shippingLabel: rate.label,
    status,
    paymentMethod: pick(["card", "card", "card", "apple_pay", "google_pay", "paypal"] as const),
    trackingNumber: ["shipped", "out_for_delivery", "delivered"].includes(status) ? `9400${Math.floor(1e11 + r() * 9e11)}` : undefined,
    trackingCarrier: rate.id.startsWith("ups") ? "ups" : rate.id.startsWith("fedex") ? "fedex" : "usps",
    refundedAmount: status === "refunded" ? total : undefined,
    events,
    createdAt: new Date(created).toISOString(),
    updatedAt: events[events.length - 1].at,
  });
}
DEMO_ORDERS.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const DEMO_PROMOS: PromoCode[] = [
  { id: "pc_1", code: "WELCOME10", type: "percent", value: 10, active: true, used: 38, description: "10% off your first order" },
  { id: "pc_2", code: "LOVE20", type: "fixed", value: 20, minSubtotal: 120, active: true, used: 12, description: "$20 off orders over $120" },
  { id: "pc_3", code: "FREESHIP", type: "free_shipping", value: 0, active: true, used: 21, description: "Free shipping on any order" },
  { id: "pc_4", code: "SUMMER15", type: "percent", value: 15, active: false, used: 64, expiresAt: "2026-09-01T00:00:00Z", description: "Summer sale (expired)" },
];

export const DEMO_GIFT_CARDS: GiftCard[] = [
  { id: "gc_1", code: "GIFT-DEMO-5000", initialBalance: 50, balance: 50, recipientName: "Demo Recipient", recipientEmail: "demo@example.com", senderName: "Gifts & Surprises", active: true, createdAt: new Date(NOW - 10 * DAY).toISOString() },
  { id: "gc_2", code: "GIFT-LOVE-2500", initialBalance: 100, balance: 25, recipientName: "Ayesha Khan", recipientEmail: "ayesha.khan@example.com", senderName: "Omar", active: true, createdAt: new Date(NOW - 30 * DAY).toISOString() },
];
