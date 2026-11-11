import type { Metadata } from "next";
import { BalanceChecker, GiftCardBuilder } from "@/components/gift-cards";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Digital Gift Cards", description: "Send a Gifts & Surprises USA digital gift card instantly by email. Any amount from $10 to $1,000 — never expires." };

export default function GiftCardsPage() {
  return (
    <Container className="space-y-16 py-10 sm:py-14">
      <div className="max-w-2xl">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Gift cards</p>
        <h1 className="mt-2 text-4xl sm:text-6xl">Let them choose the <em className="gold-text">surprise</em></h1>
        <p className="mt-4 text-muted">A beautiful digital gift card, delivered instantly by email with your personal message. Perfect when you&apos;re not sure what they&apos;ll love — or for last-minute heroes.</p>
      </div>
      <GiftCardBuilder />
      <BalanceChecker />
    </Container>
  );
}
