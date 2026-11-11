import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default function CancelledPage() {
  return (
    <Container className="max-w-xl py-16 text-center sm:py-24">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-blush text-gold-ink"><ShoppingBag size={44} strokeWidth={1.4} /></div>
      <p className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Payment cancelled</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Changed your mind? That&apos;s okay.</h1>
      <p className="mt-4 text-muted">You cancelled the payment, so nothing was charged. Everything is still waiting in your bag whenever you&apos;re ready.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/checkout" size="lg">Return to checkout</ButtonLink>
        <ButtonLink href="/shop" variant="outline" size="lg">Keep browsing</ButtonLink>
      </div>
    </Container>
  );
}
