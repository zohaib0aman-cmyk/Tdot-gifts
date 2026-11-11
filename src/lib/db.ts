import "server-only";
import { cache } from "react";
import { store, newId } from "./store";
import { DEFAULT_SETTINGS } from "@/data/settings";
import type { ContactMessage, Customer, EmailLog, GiftCard, Order, Product, PromoCode, Review, SiteSettings, Subscriber } from "./types";

/* ------------------------------------------------------------ settings */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const s = await store.get<SiteSettings & { id: string }>("settings", "site");
  if (!s) return DEFAULT_SETTINGS;
  // merge so newly-introduced settings keys always have defaults
  const { id: _id, ...rest } = s;
  void _id;
  return { ...DEFAULT_SETTINGS, ...rest, policies: { ...DEFAULT_SETTINGS.policies, ...rest.policies } };
});
export async function saveSettings(next: SiteSettings) {
  await store.put("settings", { id: "site", ...next });
  return next;
}

/* ------------------------------------------------------------ products */
export const productStock = (p: Product) => (p.variants?.options.length ? p.variants.options.reduce((a, o) => a + o.stock, 0) : p.stock);

function withRatings(products: Product[], reviews: Review[]) {
  const agg = new Map<string, { sum: number; n: number }>();
  for (const r of reviews) {
    if (r.status !== "approved") continue;
    const a = agg.get(r.productId) ?? { sum: 0, n: 0 };
    a.sum += r.rating;
    a.n++;
    agg.set(r.productId, a);
  }
  return products.map((p) => {
    const a = agg.get(p.id);
    return { ...p, rating: a ? Math.round((a.sum / a.n) * 10) / 10 : 0, reviewCount: a?.n ?? 0 };
  });
}

export const listProducts = cache(async (opts: { includeInactive?: boolean } = {}) => {
  const [products, reviews] = await Promise.all([store.all<Product>("products"), store.all<Review>("reviews")]);
  return withRatings(products, reviews)
    .filter((p) => opts.includeInactive || p.status === "active")
    .sort((a, b) => a.id.localeCompare(b.id));
});
/** Card-sized product for client components (keeps RSC payload / HTML small). */
export const slimProduct = (p: Product): Product => ({ ...p, description: "", details: [] });

export const getProductBySlug = cache(async (slug: string) => (await listProducts({ includeInactive: true })).find((p) => p.slug === slug) ?? null);
export const getProductById = async (id: string) => (await listProducts({ includeInactive: true })).find((p) => p.id === id) ?? null;
export async function saveProduct(p: Product) {
  return store.put("products", { ...p, updatedAt: new Date().toISOString() });
}
export const deleteProduct = (id: string) => store.remove("products", id);

/* ------------------------------------------------------------ reviews */
export async function listReviews(opts: { productId?: string; includeAll?: boolean } = {}) {
  const all = await store.all<Review>("reviews");
  return all
    .filter((r) => (!opts.productId || r.productId === opts.productId) && (opts.includeAll || r.status === "approved"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export const saveReview = (r: Review) => store.put("reviews", r);
export const deleteReview = (id: string) => store.remove("reviews", id);

/* ------------------------------------------------------------ orders */
export async function listOrders() {
  return (await store.all<Order>("orders")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export const getOrder = (id: string) => store.get<Order>("orders", id);
export async function findOrder(number: string, email: string) {
  const n = number.trim().toUpperCase();
  const e = email.trim().toLowerCase();
  return (await store.all<Order>("orders")).find((o) => o.number.toUpperCase() === n && o.email.toLowerCase() === e) ?? null;
}
export async function saveOrder(o: Order) {
  return store.put("orders", { ...o, updatedAt: new Date().toISOString() });
}
export async function nextOrderNumber() {
  const orders = await store.all<Order>("orders");
  const max = orders.reduce((m, o) => Math.max(m, Number(o.number.replace(/\D/g, "")) || 0), 10200);
  return `GS-${max + 1}`;
}

/* ------------------------------------------------------------ customers */
export const listCustomers = async () => (await store.all<Customer>("customers")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getCustomer = (id: string) => store.get<Customer>("customers", id);
export async function getCustomerByEmail(email: string) {
  const e = email.trim().toLowerCase();
  return (await store.all<Customer>("customers")).find((c) => c.email.toLowerCase() === e) ?? null;
}
export const saveCustomer = (c: Customer) => store.put("customers", c);

/* ------------------------------------------------------------ promos & gift cards */
export const listPromos = () => store.all<PromoCode>("promos");
export const savePromo = (p: PromoCode) => store.put("promos", p);
export const deletePromo = (id: string) => store.remove("promos", id);
export async function findPromo(code: string) {
  const c = code.trim().toUpperCase();
  return (await store.all<PromoCode>("promos")).find((p) => p.code.toUpperCase() === c) ?? null;
}
export const listGiftCards = async () => (await store.all<GiftCard>("giftcards")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const saveGiftCard = (g: GiftCard) => store.put("giftcards", g);
export async function findGiftCard(code: string) {
  const c = code.trim().toUpperCase();
  return (await store.all<GiftCard>("giftcards")).find((g) => g.code.toUpperCase() === c) ?? null;
}
export function generateGiftCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  return `GIFT-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

/* ------------------------------------------------------------ misc */
export const listEmails = async () => (await store.all<EmailLog>("emails")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const logEmail = (e: Omit<EmailLog, "id" | "createdAt">) => store.put("emails", { ...e, id: newId("em"), createdAt: new Date().toISOString() });
export const saveMessage = (m: Omit<ContactMessage, "id" | "createdAt" | "handled">) =>
  store.put("messages", { ...m, id: newId("msg"), createdAt: new Date().toISOString(), handled: false });
export const listMessages = async () => (await store.all<ContactMessage>("messages")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const updateMessage = (m: ContactMessage) => store.put("messages", m);
export async function addSubscriber(email: string) {
  const e = email.trim().toLowerCase();
  const all = await store.all<Subscriber>("subscribers");
  if (all.some((s) => s.email === e)) return { already: true };
  await store.put("subscribers", { id: newId("sub"), email: e, createdAt: new Date().toISOString() });
  return { already: false };
}
export const listSubscribers = () => store.all<Subscriber>("subscribers");
export { newId };
