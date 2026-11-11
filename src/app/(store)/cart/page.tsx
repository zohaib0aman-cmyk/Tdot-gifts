import type { Metadata } from "next";
import { CartPageView } from "@/components/cart-page";
import { listProducts, slimProduct } from "@/lib/db";

export const metadata: Metadata = { title: "Your Bag", robots: { index: false } };

export default async function CartPage() {
  const products = await listProducts();
  return <CartPageView suggestions={products.map(slimProduct).filter((p) => ["love-you-teddy-bear", "rose-swirl-cupcakes", "fresh-rose-gajra-garland", "chocolate-crunch-basket"].includes(p.slug))} />;
}
