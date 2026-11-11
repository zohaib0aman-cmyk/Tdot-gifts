"use client";
import { animate, AnimatePresence, m, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, type SVGProps } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ count-up number */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) { mv.set(value); return; }
    const c = animate(mv, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [value, mv, reduce]);
  return <m.span className={className}>{rounded}</m.span>;
}

/* ------------------------------------------------------------ cart (bag) icon with bounce + badge */
export function CartIcon({ count, bump, className }: { count: number; bump: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("relative inline-flex", className)}>
      <m.svg
        key={bump}
        viewBox="0 0 24 24"
        className="h-[22px] w-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={bump && !reduce ? { y: [0, -7, 0, -3, 0], rotate: [0, -10, 8, -4, 0], scale: [1, 1.12, 0.96, 1.04, 1] } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        aria-hidden
      >
        <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
        <m.path d="M9 10V6.5a3 3 0 0 1 6 0V10" animate={bump && !reduce ? { y: [0, -2, 0] } : {}} transition={{ duration: 0.5 }} />
      </m.svg>
      <AnimatePresence>
        {count > 0 && (
          <m.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute -right-2.5 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose px-1 text-[10px] font-bold leading-none text-white ring-2 ring-bg"
          >
            <CountUp value={count} />
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------ heart with fill pop + burst */
/** CSS-only animated heart (cheap enough to render on every product card). `burst` increments when toggled on. */
const HEART = "M12 20.5s-7.5-4.6-9.4-9.3C1.2 7.9 3.4 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.5 0 5.7 3.4 4.3 6.7-1.9 4.7-9.4 9.3-9.4 9.3Z";
export function HeartIcon({ active, burst = 0, size = 20, className }: { active: boolean; burst?: number; size?: number; className?: string }) {
  return (
    <span className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg key={burst} viewBox="0 0 24 24" width={size} height={size} className={burst && active ? "heart-pop" : undefined} aria-hidden>
        <path d={HEART} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
        <path d={HEART} fill="var(--rose)" stroke="var(--rose)" strokeWidth={1.7} className="heart-fill" data-on={active ? "" : undefined} />
      </svg>
      {burst > 0 && active && (
        <span key={`b${burst}`} className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <span key={i} className="heart-burst absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full" style={{ background: i % 2 ? "var(--rose)" : "var(--gold)", "--dx": `${Math.cos(a) * size * 0.95}px`, "--dy": `${Math.sin(a) * size * 0.95}px` } as React.CSSProperties} />;
          })}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------ hamburger that morphs to X */
export function MenuIcon({ open }: { open: boolean }) {
  const t = { type: "spring" as const, stiffness: 380, damping: 26 };
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <m.line x1="4" x2="20" initial={false} animate={open ? { y1: 12, y2: 12, rotate: 45 } : { y1: 7, y2: 7, rotate: 0 }} style={{ transformOrigin: "12px 12px" }} transition={t} />
      <m.line x1="4" x2="20" y1="12" y2="12" initial={false} animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.2 : 1 }} style={{ transformOrigin: "12px 12px" }} transition={t} />
      <m.line x1="4" x2="20" initial={false} animate={open ? { y1: 12, y2: 12, rotate: -45 } : { y1: 17, y2: 17, rotate: 0 }} style={{ transformOrigin: "12px 12px" }} transition={t} />
    </svg>
  );
}

/* ------------------------------------------------------------ self-drawing check */
export function DrawCheck({ size = 96, className, delay = 0 }: { size?: number; className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <m.circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0, rotate: -90 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay, ease: [0.65, 0, 0.35, 1] }} style={{ transformOrigin: "50% 50%" }} />
      <m.circle cx="50" cy="50" r="36" fill="var(--gold)" opacity={0.12} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.5, type: "spring", stiffness: 200, damping: 14 }} style={{ transformOrigin: "50% 50%" }} />
      <m.path d="M31 52 L45 65 L70 37" fill="none" stroke="var(--gold-ink)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: delay + 0.7, ease: "easeOut" }} />
    </svg>
  );
}

/* ------------------------------------------------------------ brand / social glyphs (not in lucide) */
type P = SVGProps<SVGSVGElement>;
export const InstagramGlyph = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" /></svg>
);
export const FacebookGlyph = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4A21 21 0 0 0 14.4 4C12 4 10.5 5.4 10.5 8.1v2.4H8v3h2.5V21h3Z" /></svg>
);
export const TikTokGlyph = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.7c-1.4.1-2.6-.3-3.9-1.1v5.2c0 6.6-7.2 8.7-10.1 4-1.9-3-.7-8.3 5.4-8.5v2.8c-.5.1-1 .2-1.4.4-1.4.5-2.2 1.4-2 3 .4 3.1 6.1 4 5.6-2V3h2.5Z" /></svg>
);
export const PinterestGlyph = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.9 0-2.6-1.8-4.4-4.5-4.4-3 0-4.8 2.3-4.8 4.6 0 .9.4 1.9.8 2.5l.1.4-.3 1.2c0 .2-.2.3-.4.2-1.4-.7-2.2-2.7-2.2-4.3 0-3.5 2.5-6.7 7.3-6.7 3.8 0 6.8 2.7 6.8 6.4 0 3.8-2.4 6.9-5.8 6.9-1.1 0-2.2-.6-2.5-1.3l-.7 2.6c-.3 1-.9 2.2-1.4 2.9A10 10 0 1 0 12 2Z" /></svg>
);
export const WhatsAppGlyph = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .3-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.2 1.4Z" /></svg>
);
