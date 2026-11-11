import type { Metadata } from "next";
import { WishlistGrid } from "@/components/account";
import { Container } from "@/components/ui";
import { listProducts, slimProduct } from "@/lib/db";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const products = (await listProducts()).map(slimProduct);
  return (
    <Container className="py-10 sm:py-14">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Saved for later</p>
      <h1 className="mb-8 mt-2 text-4xl sm:text-5xl">Your wishlist</h1>
      <WishlistGrid products={products} />
    </Container>
  );
}
