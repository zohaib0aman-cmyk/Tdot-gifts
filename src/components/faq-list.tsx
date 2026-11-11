"use client";
import { AnimatePresence, m } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

export function FaqList({ groups }: { groups: { title: string; items: { q: string; a: string }[] }[] }) {
  const [open, setOpen] = useState<string | null>(groups[0]?.items[0]?.q ?? null);
  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.title}>
          <h2 className="mb-4 text-2xl sm:text-3xl">{g.title}</h2>
          <ul className="divide-y divide-line rounded-3xl border border-line bg-surface px-5 shadow-soft sm:px-7">
            {g.items.map((it) => {
              const isOpen = open === it.q;
              return (
                <li key={it.q}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : it.q)} aria-expanded={isOpen} className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left font-semibold">
                    {it.q}
                    <m.span animate={{ rotate: isOpen ? 45 : 0 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2"><Plus size={16} /></m.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="pb-5 pr-10 text-sm leading-relaxed text-muted">{it.a}</p></m.div>}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
