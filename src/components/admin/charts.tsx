"use client";
import { m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/utils";

/** Single-series revenue area chart with crosshair + tooltip (one series → no legend box; the panel title names it). */
export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(720);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 500 ? 200 : 240, P = { l: 48, r: 12, t: 16, b: 28 };
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const nice = Math.ceil(max / 250) * 250;
  const x = (i: number) => P.l + (i / Math.max(1, data.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - v / nice) * (H - P.t - P.b);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.revenue).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)} ${H - P.b} L${x(0)} ${H - P.b}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * nice);
  const h = hover != null ? data[hover] : null;
  return (
    <div className="relative" ref={box}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Revenue over the last ${data.length} days, total ${money(data.reduce((a, d) => a + d.revenue, 0))}`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; const i = Math.round(((px - P.l) / (W - P.l - P.r)) * (data.length - 1)); setHover(Math.max(0, Math.min(data.length - 1, i))); }}
        onTouchMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const px = ((e.touches[0].clientX - r.left) / r.width) * W; const i = Math.round(((px - P.l) / (W - P.l - P.r)) * (data.length - 1)); setHover(Math.max(0, Math.min(data.length - 1, i))); }}>
        <defs><linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--gold)" stopOpacity=".32" /><stop offset="1" stopColor="var(--gold)" stopOpacity="0" /></linearGradient></defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray={t ? "3 4" : undefined} />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{t >= 1000 ? `$${(t / 1000).toFixed(1)}k` : `$${t}`}</text>
          </g>
        ))}
        {data.map((d, i) => (i % (W < 500 ? 10 : 7) === 0 || i === data.length - 1) && <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--muted)">{new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</text>)}
        <m.path d={area} fill="url(#rev-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
        <m.path d={line} fill="none" stroke="var(--gold-ink)" strokeWidth="2" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
        {h && hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="var(--muted)" strokeOpacity=".5" />
            <circle cx={x(hover)} cy={y(h.revenue)} r="5" fill="var(--gold-ink)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {h && hover != null && (
        <div className="pointer-events-none absolute top-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lift" style={{ left: `clamp(0px, calc(${(x(hover) / W) * 100}% - 70px), calc(100% - 140px))` }}>
          <p className="text-muted">{new Date(h.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
          <p className="font-semibold tabular-nums">{money(h.revenue)}</p>
          <p className="text-muted">{h.orders} order{h.orders === 1 ? "" : "s"}</p>
        </div>
      )}
    </div>
  );
}

/** Horizontal bar list — magnitude in a single hue, value labels in text ink. */
export function BarList({ rows, money: asMoney }: { rows: { label: string; value: number; sub?: string }[]; money?: boolean }) {
  const format = (n: number) => (asMoney ? money(n) : String(n));
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.label} className="group" title={`${r.label}: ${format(r.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm"><span className="truncate">{r.label}{r.sub && <span className="ml-1.5 text-xs text-muted">{r.sub}</span>}</span><span className="shrink-0 font-semibold tabular-nums">{format(r.value)}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2"><m.div className="h-full rounded-full bg-gold group-hover:brightness-110" initial={{ width: 0 }} animate={{ width: `${(r.value / max) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }} /></div>
        </li>
      ))}
    </ul>
  );
}
