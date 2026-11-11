import type { Metadata } from "next";
import { FaqList } from "@/components/faq-list";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = { title: "FAQ", description: "Answers about ordering from abroad, same-day delivery, surprise setups, payments, gift cards and returns." };

const GROUPS = [
  { title: "Ordering", items: [
    { q: "Can I order from outside the USA?", a: "Absolutely — most of our customers do! Pay with any international Visa, Mastercard, Amex, Apple Pay, Google Pay or PayPal. Just enter your recipient's US address at checkout and we'll handle the rest." },
    { q: "Can I add a personal message?", a: "Yes. Every gift includes a free handwritten card. Add your message on the product page — we'll write it neatly on premium card stock." },
    { q: "Do I need an account to order?", a: "No. Guest checkout is quick and easy. An account simply lets you track orders, save addresses and keep a wishlist." },
  ] },
  { title: "Delivery", items: [
    { q: "Do you offer same-day delivery?", a: "Yes, in 40+ US metros for orders placed before 2pm local time. Flowers, cakes and cupcakes are delivered by hand. Everywhere else ships with USPS, UPS or FedEx." },
    { q: "How much is shipping?", a: "Standard delivery is free on orders over the threshold shown in your bag. Express options (UPS 2nd Day Air, FedEx Overnight) are available at checkout." },
    { q: "Will I know when it's delivered?", a: "Yes — you'll get email updates at every step and can track your order any time. For surprise packages we'll even send photos and a reaction video." },
  ] },
  { title: "Surprise packages", items: [
    { q: "How do surprise setups work?", a: "After you order, a surprise planner contacts you to confirm the address, timing and any special requests. Our team arrives early, sets everything up, and slips away before the big reveal." },
    { q: "Can you customize a package?", a: "Of course. Message us with your idea, date and budget and we'll design a custom surprise — proposals, gender reveals, office celebrations and more." },
  ] },
  { title: "Payments, gift cards & returns", items: [
    { q: "Is checkout secure?", a: "Payments are processed by Stripe and PayPal using bank-level encryption. We never see or store your full card number." },
    { q: "Do gift cards expire?", a: "Never. Digital gift cards are emailed instantly and can be used on anything in the store." },
    { q: "What if something isn't perfect?", a: "Tell us within 48 hours with a photo and we'll replace it or refund you — that's our happiness guarantee. See our Refund Policy for details." },
  ] },
];

export default function FaqPage() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: GROUPS.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))) };
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Help center</p>
      <h1 className="mb-10 mt-2 text-4xl sm:text-6xl">Frequently asked questions</h1>
      <FaqList groups={GROUPS} />
      <div className="mt-14 rounded-[2rem] bg-blush p-8 text-center">
        <p className="font-display text-2xl">Still have a question?</p>
        <p className="mt-2 text-sm text-muted">Our surprise planners reply within minutes during business hours.</p>
        <ButtonLink href="/contact" className="mt-5">Message us</ButtonLink>
      </div>
    </Container>
  );
}
