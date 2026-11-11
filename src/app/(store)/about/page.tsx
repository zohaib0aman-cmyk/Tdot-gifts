import type { Metadata } from "next";
import { Globe2, HeartHandshake, Sparkles, Truck } from "lucide-react";
import { Reveal } from "@/components/motion";
import { ProductImage } from "@/components/product-image";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Our Story", description: "Gifts & Surprises USA is a team of surprise planners delivering luxury gifts and unforgettable moments across the USA." };

export default function AboutPage() {
  const values = [
    { icon: HeartHandshake, t: "Every gift is personal", d: "We read every message, hand-tie every bow and treat each order as if it were for our own family." },
    { icon: Globe2, t: "Built for distance", d: "Many of our customers live abroad. We become your hands in the USA — with photos and videos so you never miss the moment." },
    { icon: Sparkles, t: "Luxury, not fuss", d: "Premium roses, real ingredients and keepsake packaging — at prices that feel fair." },
    { icon: Truck, t: "On time, every time", d: "Local hand delivery in 40+ metros and trusted USPS, UPS and FedEx shipping everywhere else." },
  ];
  return (
    <>
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Our story</p>
            <h1 className="mt-3 text-5xl leading-[1.02] sm:text-7xl">Small team. <em className="gold-text">Big feelings.</em></h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">Gifts &amp; Surprises USA started with a simple problem: how do you make someone you love feel celebrated when you can&apos;t be there? We began by planning birthday surprises for friends and family living far from home — today we&apos;re a team of florists, bakers and surprise planners delivering joy across the country.</p>
            <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/shop">Shop gifts</ButtonLink><ButtonLink href="/contact" variant="outline">Plan a custom surprise</ButtonLink></div>
          </div>
          <div className="relative grid grid-cols-2 gap-4">
            <Reveal className="relative mt-10 aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift"><ProductImage src="/photos/p19.webp" alt="A rose bouquet and birthday cake prepared by our team" fill sizes="(min-width:1024px) 25vw, 50vw" /></Reveal>
            <Reveal delay={0.15} className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift"><ProductImage src="/photos/p16.webp" alt="A snack basket with a handwritten note" fill sizes="(min-width:1024px) 25vw, 50vw" /></Reveal>
          </div>
        </Container>
      </section>
      <section className="bg-surface-2/60 py-16 sm:py-24">
        <Container>
          <h2 className="max-w-2xl text-4xl sm:text-5xl">What we believe</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.t} delay={i * 0.08} className="rounded-3xl border border-line bg-surface p-6 shadow-soft">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-gold-ink"><v.icon size={22} /></span>
                <h3 className="mt-5 text-xl">{v.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.d}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <Container className="py-16 text-center sm:py-24">
        <p className="mx-auto max-w-3xl font-display text-3xl italic leading-snug sm:text-4xl">“We don&apos;t just deliver gifts. We deliver the moment someone realizes how loved they are.”</p>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-gold-ink">— The Gifts &amp; Surprises team</p>
      </Container>
    </>
  );
}
