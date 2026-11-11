import { ArrowRight, ArrowUpRight, Check, Gift, Heart, MapPin, Package, Video } from "lucide-react";
import Link from "next/link";
import { InstagramGlyph } from "../icons";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { ProductCard } from "../product-card";
import { ProductImage } from "../product-image";
import { buttonClass, Container, SectionHeading, Stars } from "../ui";
import { RailButtons } from "./rail-buttons";
import { OCCASIONS, RECIPIENTS } from "@/data/catalog";
import type { Product, Review } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Server-rendered homepage sections: static markup, only small client islands hydrate. */
/* ------------------------------------------------------------ occasions */
const OCC_ART: Record<string, string> = {
  birthday: "/photos/cake-19.webp",
  anniversary: "/photos/p12.webp",
  valentines: "/photos/heart-07.webp",
  "mothers-day": "/photos/p02.webp",
  graduation: "/photos/p13.webp",
  "new-baby": "/photos/teddy-08.webp",
  "get-well": "/photos/p16.webp",
  "thank-you": "/photos/p11.webp",
  "just-because": "/photos/garland-05.webp",
};

export function OccasionGrid() {
  const list = OCCASIONS.filter((o) => OCC_ART[o.slug]);
  return (
    <section className="py-16 sm:py-24" aria-labelledby="occ-h">
      <Container>
        <SectionHeading eyebrow="Shop by occasion" title={<span id="occ-h">Every moment, <em className="gold-text">beautifully</em> marked</span>} sub="From first birthdays to fiftieth anniversaries — find the gift that fits the feeling." action={<Link href="/shop" className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold-ink">All occasions <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link>} />
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {list.map((o, i) => (
            <StaggerItem key={o.slug} className={cn(i === 0 && "col-span-2 row-span-2 lg:col-span-2")}>
              <Link href={`/shop?occasion=${o.slug}`} className="group relative block h-full overflow-hidden rounded-[1.75rem] bg-surface-2 shadow-soft">
                <div className={cn("relative", i === 0 ? "aspect-square lg:aspect-auto lg:h-full lg:min-h-[520px]" : "aspect-[4/5]")}>
                  <ProductImage src={OCC_ART[o.slug]} alt="" fill sizes={i === 0 ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"} className="transition duration-[1.2s] ease-out-expo group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                    <span className="mb-1 block text-2xl" aria-hidden>{o.emoji}</span>
                    <h3 className={cn("font-display leading-tight", i === 0 ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl")}>{o.name}</h3>
                    <p className="mt-1 hidden text-sm text-white/80 sm:block">{o.blurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#f3dc92]">Shop now <ArrowUpRight size={14} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ recipients */
const REC_IMG: Record<string, string> = {
  her: "/photos/bouquet-02.webp", him: "/photos/lays-05.webp", mom: "/photos/cake-09.webp",
  dad: "/photos/p11.webp", couples: "/photos/p17.webp", kids: "/photos/teddy-15.webp",
  friends: "/photos/p03.webp", colleagues: "/photos/cupcakes-06.webp",
};
export function RecipientRail() {
  return (
    <section className="bg-surface-2/60 py-16 sm:py-24" aria-labelledby="rec-h">
      <Container>
        <SectionHeading eyebrow="Shop by recipient" title={<span id="rec-h">Who are we surprising?</span>} action={<RailButtons target="rec-rail" />} />
      </Container>
      <div id="rec-rail" className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {RECIPIENTS.map((r) => (
          <div key={r.slug} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[19%]">
            <Link href={`/shop?recipient=${r.slug}`} className="group block text-center">
              <div className="relative mx-auto aspect-square overflow-hidden rounded-full border-4 border-surface bg-surface shadow-soft transition duration-500 group-hover:-translate-y-1.5 group-hover:shadow-lift">
                <ProductImage src={REC_IMG[r.slug]} alt="" fill sizes="(min-width:1024px) 20vw, 45vw" className="transition duration-700 group-hover:scale-110" />
              </div>
              <p className="mt-4 font-display text-lg sm:text-xl">{r.name}</p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ product rails */
export function ProductSection({ id, eyebrow, title, sub, products, href }: { id: string; eyebrow: string; title: React.ReactNode; sub?: string; products: Product[]; href: string }) {
  return (
    <section className="py-16 sm:py-24" aria-labelledby={id}>
      <Container>
        <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} sub={sub} action={<Link href={href} className={buttonClass("outline", "sm", "self-start sm:self-auto")}>View all <ArrowRight size={15} /></Link>} />
        <Stagger className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <StaggerItem key={p.id}><ProductCard product={p} /></StaggerItem>)}
        </Stagger>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ how it works / story */
export function HowItWorks() {
  const steps = [
    { icon: Gift, title: "Pick your surprise", body: "Choose a gift or a full setup. Add a handwritten message and gift wrap." },
    { icon: MapPin, title: "Order from anywhere", body: "Pay securely from any country. We deliver across all 50 states." },
    { icon: Package, title: "We plan & prepare", body: "Our florists, bakers and planners craft everything by hand." },
    { icon: Video, title: "Watch the moment", body: "We deliver, set up and send you photos — even the reaction video." },
  ];
  return (
    <section className="relative overflow-hidden bg-[#140e0f] py-20 text-[#f3ebe1] sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,161,74,.22),transparent_60%)]" aria-hidden />
      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-4 flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold"><span className="h-px w-8 bg-gold" />Surprise planners</p>
            <h2 className="text-4xl leading-[1.05] sm:text-5xl">You dream it. <br /><em className="gold-text">We make it happen.</em></h2>
            <p className="mt-5 max-w-lg leading-relaxed text-[#cdbfb3]">Living abroad? Can&apos;t be there in person? Message us and our USA team becomes your hands — choosing the freshest roses, baking the cake, and setting up a moment they&apos;ll never forget.</p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {[["2,000+", "surprises delivered"], ["40+", "US metros"], ["4.9★", "average rating"]].map(([n, l]) => (
                <div key={l}><p className="gold-text font-display text-3xl sm:text-4xl">{n}</p><p className="mt-1 text-xs text-[#a89a8f]">{l}</p></div>
              ))}
            </div>
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold"><s.icon size={22} /></span>
                  <span className="font-display text-3xl text-white/15">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#bfb0a4]">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ reviews */
export function ReviewsSection({ reviews, products }: { reviews: Review[]; products: Product[] }) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const top = reviews.filter((r) => r.rating === 5 && r.body.length > 90).slice(0, 10);
  const row = [...top, ...top];
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, reviews.length);
  return (
    <section className="overflow-hidden bg-surface-2/60 py-16 sm:py-24" aria-labelledby="rev-h">
      <Container>
        <SectionHeading align="center" eyebrow="Loved across the USA" title={<span id="rev-h">Happy tears, delivered</span>} sub={`${avg.toFixed(1)} out of 5 from ${reviews.length.toLocaleString()} verified reviews`} />
      </Container>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--surface-2)] to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--surface-2)] to-transparent sm:w-32" />
        <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {row.map((r, i) => {
            const p = byId.get(r.productId);
            return (
              <li key={`${r.id}-${i}`} aria-hidden={i >= top.length} className="w-[300px] shrink-0 rounded-3xl border border-line bg-surface p-6 shadow-soft sm:w-[360px]">
                <Stars rating={r.rating} />
                <p className="mt-3 font-display text-lg leading-snug">“{r.title}”</p>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">{r.body}</p>
                <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  {p && <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface-2"><ProductImage src={p.images[0]} alt="" fill sizes="44px" /></span>}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-semibold">{r.author}{r.verified && <Check size={13} className="text-emerald-600" aria-label="Verified buyer" />}</p>
                    <p className="truncate text-xs text-muted">{r.location}{p ? ` · ${p.name}` : ""}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ instagram */
export function InstagramFeed({ instagram }: { instagram: string }) {
  const social = { instagram };
  const posts = ["p15", "p03", "p12", "p17", "p19", "p16"].map((n) => `/photos/${n}.webp`);
  const captions = ["Roses, teddy & a name cake for Hayati", "Rose-swirl cupcakes with gold leaf", "A hundred red roses, hand-tied", "Glitter rose heart box & treats", "Pearl & rose birthday cake", "A handwritten note in every basket"];
  return (
    <section className="py-16 sm:py-24" aria-labelledby="ig-h">
      <Container>
        <SectionHeading eyebrow="@gifts.surprises.usa" title={<span id="ig-h">Real surprises, <em className="gold-text">real smiles</em></span>} sub="Straight from our Instagram — tag us in your moments for a chance to be featured." action={<a href={social.instagram} target="_blank" rel="noreferrer" className={buttonClass("primary", "sm")}><InstagramGlyph className="h-4 w-4" /> Follow us</a>} />
        <Stagger className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:grid-cols-6">
          {posts.map((src, i) => (
            <StaggerItem key={src}>
              <a href={social.instagram} target="_blank" rel="noreferrer" className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-surface-2 sm:rounded-2xl" aria-label={`Instagram post: ${captions[i]}`}>
                <ProductImage src={src} alt={captions[i]} fill sizes="(min-width:1024px) 16vw, 33vw" className="transition duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 text-sm font-semibold"><Heart size={16} fill="currentColor" /> View</span>
                </span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

