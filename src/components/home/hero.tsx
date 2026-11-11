"use client";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw, Sparkles, Star, Truck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductImage } from "../product-image";
import { buttonClass } from "../ui";
import type { SiteSettings } from "@/lib/types";

const COLORS = ["#c9a14a", "#e9cf7f", "#b3123a", "#f2b8c3", "#ffffff", "#1d1416"];

function seeded(n: number) {
  let s = 1337;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.25;
    const dist = 120 + r() * 170;
    return { i, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 40, rot: r() * 720 - 360, w: 6 + r() * 8, h: 4 + r() * 6, c: COLORS[i % COLORS.length], round: r() > 0.6, d: r() * 0.15 };
  });
}

/** Animated gift box that opens with a confetti burst. */
function GiftBox() {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const confetti = useMemo(() => seeded(42), []);
  const t = (d: number) => (reduce ? 0 : d);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      {/* halo */}
      <div className="anim-halo absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--gold)_45%,transparent),transparent_65%)]" />
      <div className="absolute inset-[14%] rounded-full border border-gold/30" />
      <div className="anim-spin-slow absolute inset-[4%] rounded-full border border-dashed border-gold/25" />

      <svg key={run} viewBox="0 0 400 400" className="relative h-full w-full overflow-visible" role="img" aria-label="An animated black and gold gift box opening with confetti">
        <defs>
          <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e3a1" /><stop offset=".45" stopColor="#c9a14a" /><stop offset=".7" stopColor="#e9cf7f" /><stop offset="1" stopColor="#9c7a2e" /></linearGradient>
          <linearGradient id="hbox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a2022" /><stop offset=".5" stopColor="#151012" /><stop offset="1" stopColor="#0b0809" /></linearGradient>
          <radialGradient id="hglow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff6d8" /><stop offset=".45" stopColor="#ffd27a" stopOpacity=".55" /><stop offset="1" stopColor="#ffb347" stopOpacity="0" /></radialGradient>
          <filter id="hblur"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        <ellipse cx="200" cy="350" rx="120" ry="16" fill="#2a1418" opacity=".25" filter="url(#hblur)" />
        {/* light rays */}
        <m.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: [0, 1, 0.75], scale: 1 }} transition={{ delay: t(1.35), duration: 0.9 }} style={{ transformOrigin: "200px 200px" }}>
          <circle cx="200" cy="190" r="120" fill="url(#hglow)" />
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} className="anim-twinkle" style={{ animationDelay: `${i * 0.12}s` }} x="198" y="60" width="4" height="70" rx="2" fill="#f3dc92" opacity=".55" transform={`rotate(${-70 + i * 15.5} 200 200)`} />
          ))}
        </m.g>
        {/* rising hearts */}
        {!reduce && [0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${200 + (i - 1) * 46} ${190 - i * 8})`}>
            <path className="anim-heart" style={{ animationDelay: `${1.5 + i * 0.35}s`, opacity: 0 }} d="M0 8 C -12 -2 -8 -14 0 -6 C 8 -14 12 -2 0 8Z" fill={i === 1 ? "#b3123a" : "url(#hg)"} />
          </g>
        ))}
        {/* box body */}
        <m.g initial={{ y: reduce ? 0 : -260, opacity: reduce ? 1 : 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 13, delay: t(0.1) }}>
          <rect x="110" y="200" width="180" height="140" rx="10" fill="url(#hbox)" />
          <rect x="182" y="200" width="36" height="140" fill="url(#hg)" />
          <rect x="110" y="250" width="180" height="26" fill="url(#hg)" opacity=".95" />
          <rect x="110" y="200" width="40" height="140" rx="10" fill="#fff" opacity=".05" />
          {/* tag */}
          <m.g initial={{ rotate: 0 }} animate={reduce ? {} : { rotate: [0, 8, -6, 0] }} transition={{ delay: t(1.4), duration: 1.2 }} style={{ transformOrigin: "290px 262px" }}>
            <path d="M290 262 L 318 296" stroke="#c9a14a" strokeWidth="2" />
            <g transform="translate(300 292) rotate(18)"><rect width="46" height="30" rx="4" fill="#fbf4e6" stroke="#c9a14a" strokeWidth="1.5" /><path d="M23 21 c -7 -5 -9 -10 -5 -12 c 3 -2 5 1 5 3 c 0 -2 2 -5 5 -3 c 4 2 2 7 -5 12z" fill="#b3123a" /></g>
          </m.g>
          {/* lid */}
          <m.g
            initial={{ y: 0, rotate: 0 }}
            animate={reduce ? { y: -36, rotate: -10 } : { y: [0, -4, 0, -4, 0, -90, -70], x: [0, 0, 0, 0, 0, -30, -46], rotate: [0, -3, 3, -3, 0, -22, -16] }}
            transition={{ delay: t(0.75), duration: 1.25, times: [0, 0.12, 0.24, 0.36, 0.48, 0.8, 1], ease: "easeOut" }}
            style={{ transformOrigin: "200px 200px" }}
          >
            <rect x="100" y="172" width="200" height="38" rx="8" fill="#1f181a" />
            <rect x="100" y="172" width="200" height="12" rx="6" fill="#fff" opacity=".07" />
            <rect x="182" y="172" width="36" height="38" fill="url(#hg)" />
            <path d="M200 174 C 168 132 128 150 140 172 C 148 186 176 182 200 174Z" fill="url(#hg)" />
            <path d="M200 174 C 232 132 272 150 260 172 C 252 186 224 182 200 174Z" fill="url(#hg)" />
            <path d="M200 174 C 180 150 154 154 150 168" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="2" />
            <path d="M200 174 C 220 150 246 154 250 168" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="2" />
            <ellipse cx="200" cy="175" rx="12" ry="10" fill="url(#hg)" stroke="#9c7a2e" strokeOpacity=".4" />
          </m.g>
        </m.g>
        {/* confetti burst (pure CSS — keeps the main thread free) */}
        {!reduce && confetti.map((c) => (
          <rect
            key={c.i}
            className="anim-confetti"
            x={200 - c.w / 2}
            y={190}
            width={c.w}
            height={c.round ? c.w : c.h}
            rx={c.round ? c.w / 2 : 1.5}
            fill={c.c}
            stroke={c.c === "#ffffff" ? "#e9cf7f" : "none"}
            style={{ "--x": `${c.x}px`, "--y": `${c.y}px`, "--x2": `${c.x * 1.1}px`, "--y2": `${c.y + 160}px`, "--r": `${c.rot}deg`, animationDelay: `${1.45 + c.d}s` } as React.CSSProperties}
          />
        ))}
      </svg>

      {/* floating keepsakes */}
      <div className="anim-float absolute -left-2 top-[10%] w-[30%] sm:-left-6">
        <div className="relative aspect-[4/5] rotate-[-8deg] overflow-hidden rounded-2xl border-4 border-surface shadow-lift"><ProductImage src="/photos/cake-19.webp" alt="" fill sizes="140px" priority /></div>
      </div>
      <div className="anim-float-slow absolute -right-1 bottom-[12%] w-[28%] sm:-right-4">
        <div className="relative aspect-[4/5] rotate-[7deg] overflow-hidden rounded-2xl border-4 border-surface shadow-lift"><ProductImage src="/photos/teddy-15.webp" alt="" fill sizes="130px" priority /></div>
      </div>
      <div key={run} className="fade-rise absolute right-[6%] top-[4%] flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3 py-2 text-xs font-semibold shadow-soft backdrop-blur" style={{ "--d": "2.4s" } as React.CSSProperties}>
        <Sparkles size={14} className="text-gold-ink" /> Surprise unlocked!
      </div>
      <button type="button" onClick={() => setRun((r) => r + 1)} className="absolute bottom-0 left-1/2 flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full px-4 text-xs font-semibold text-muted transition hover:text-gold-ink">
        <RotateCcw size={14} /> Open again
      </button>
    </div>
  );
}

export function Hero({ hero }: { hero: SiteSettings["hero"] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="paper pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-blush blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-[color-mix(in_oklab,var(--gold)_18%,transparent)] blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pb-14 pt-6 sm:px-6 sm:pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-14">
        <div className="relative z-10 text-center lg:text-left">
          <p className="rise-in mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface/70 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold-ink backdrop-blur lg:mx-0">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose" /> {hero.eyebrow}
          </p>
          <h1 className="text-[2.75rem] leading-[0.98] sm:text-6xl lg:text-[5.2rem]">
            <span className="rise-in block">{hero.title}</span>
            <span className="rise-in gold-text block italic" style={{ "--d": ".08s", "--rise": "30px" } as React.CSSProperties}>{hero.highlight}</span>
          </h1>
          <p className="rise-in mx-auto mt-6 max-w-xl text-[1.02rem] leading-relaxed text-muted sm:text-lg lg:mx-0" style={{ "--d": ".15s", "--rise": "16px" } as React.CSSProperties}>{hero.subtitle}</p>
          <div className="rise-in mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start" style={{ "--d": ".25s", "--rise": "16px" } as React.CSSProperties}>
            <Link href={hero.ctaHref} className={buttonClass("primary", "lg", "group")}>
              {hero.ctaLabel} <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href={hero.secondaryHref} className={buttonClass("outline", "lg")}>{hero.secondaryLabel}</Link>
          </div>
          <ul className="rise-in mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted lg:justify-start" style={{ "--d": ".3s", "--rise": "10px" } as React.CSSProperties}>
            <li className="flex items-center gap-1.5"><span className="flex text-gold">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}</span><strong className="text-fg">4.9</strong> from 2,000+ surprises</li>
            <li className="flex items-center gap-1.5"><Truck size={16} className="text-gold-ink" /> Same-day in 40+ US cities</li>
          </ul>
        </div>
        <div className="relative">
          <GiftBox />
        </div>
      </div>
    </section>
  );
}
