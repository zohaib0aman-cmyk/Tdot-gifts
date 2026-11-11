"use client";
import { m, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useCart } from "@/lib/client-store";

export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => { clear(); }, [clear]);
  return null;
}

function makePieces(count: number) {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const colors = ["#c9a14a", "#e9cf7f", "#b3123a", "#f2b8c3", "#1d1416"];
  return Array.from({ length: count }, (_, i) => ({ i, left: r() * 100, delay: r() * 0.8, dur: 2.4 + r() * 1.8, rot: r() * 720, size: 6 + r() * 8, c: colors[i % colors.length], drift: (r() - 0.5) * 140, round: r() > 0.6 }));
}

export function ConfettiRain({ count = 60 }: { count?: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(() => makePieces(count), [count]);
  if (reduce) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <m.span key={p.i} className="absolute top-0" style={{ left: `${p.left}%`, width: p.size, height: p.round ? p.size : p.size * 0.5, background: p.c, borderRadius: p.round ? 999 : 2 }}
          initial={{ y: -40, x: 0, rotate: 0, opacity: 1 }} animate={{ y: "105vh", x: p.drift, rotate: p.rot, opacity: [1, 1, 0] }} transition={{ duration: p.dur, delay: p.delay, ease: [0.25, 0.4, 0.5, 1] }} />
      ))}
    </div>
  );
}
