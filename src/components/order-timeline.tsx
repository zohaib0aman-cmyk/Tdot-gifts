"use client";
import { m } from "framer-motion";
import { Check, ClipboardCheck, Gift, Home, Package, Truck, XCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { cn, STATUS_LABEL } from "@/lib/utils";

const STEPS = [
  { key: "pending", label: "Order placed", icon: ClipboardCheck },
  { key: "paid", label: "Confirmed", icon: Check },
  { key: "processing", label: "Being prepared", icon: Gift },
  { key: "shipped", label: "Shipped", icon: Package },
  { key: "out_for_delivery", label: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
] as const;

export function OrderTimeline({ order }: { order: Order }) {
  const terminal = ["cancelled", "refunded", "failed"].includes(order.status);
  const idx = terminal ? -1 : STEPS.findIndex((s) => s.key === order.status);
  const at = (k: string) => order.events.findLast((e) => e.status === k)?.at;
  if (terminal)
    return (
      <div className="flex items-center gap-4 rounded-3xl border border-rose/30 bg-rose/5 p-5">
        <XCircle className="shrink-0 text-rose" size={28} />
        <div><p className="font-display text-xl">{STATUS_LABEL[order.status]}</p><p className="text-sm text-muted">{order.events.at(-1)?.message}</p></div>
      </div>
    );
  return (
    <ol className="relative space-y-0">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const current = i === idx;
        const t = at(s.key) ?? (s.key === "pending" ? order.createdAt : undefined);
        return (
          <li key={s.key} className="relative flex gap-4 pb-8 last:pb-0">
            {i < STEPS.length - 1 && (
              <span className="absolute left-[21px] top-11 h-[calc(100%-2.75rem)] w-0.5 overflow-hidden rounded bg-line" aria-hidden>
                <m.span className="gold-bg block w-full" initial={{ height: 0 }} animate={{ height: i < idx ? "100%" : "0%" }} transition={{ delay: 0.3 + i * 0.25, duration: 0.5 }} />
              </span>
            )}
            <m.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 + i * 0.25, type: "spring", stiffness: 260, damping: 18 }}
              className={cn("relative z-[1] grid h-11 w-11 shrink-0 place-items-center rounded-full border-2", done ? "border-transparent bg-gold text-[#2a1d06]" : "border-line bg-surface text-muted")}>
              <s.icon size={19} />
              {current && <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" aria-hidden />}
            </m.span>
            <div className="pt-1.5">
              <p className={cn("font-semibold", !done && "text-muted")}>{s.label}{current && <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">Current</span>}</p>
              <p className="text-sm text-muted">{t && done ? new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : done ? "" : "Upcoming"}</p>
              {done && order.events.findLast((e) => e.status === s.key)?.message && <p className="mt-0.5 text-sm text-muted">{order.events.findLast((e) => e.status === s.key)?.message}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
