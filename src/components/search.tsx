"use client";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ProductImage } from "./product-image";
import { useUI } from "@/lib/client-store";
import { cn, money } from "@/lib/utils";

type Hit = { id: string; slug: string; name: string; price: number; image: string; category: string };
const POPULAR = ["Roses", "Heart box", "Teddy", "Cake", "Cupcakes", "Basket"];

function useSuggestions(q: string) {
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const term = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (term.length < 2) { setHits([]); setLoading(false); return; }
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const j = await r.json();
        setHits(j.results ?? []);
      } catch { /* aborted */ }
      setLoading(false);
    }, 160);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);
  return { hits, loading };
}

function Suggestions({ q, hits, loading, active, onPick, listId }: { q: string; hits: Hit[]; loading: boolean; active: number; onPick: () => void; listId: string }) {
  if (q.trim().length < 2)
    return (
      <div className="p-4">
        <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-muted">Popular searches</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map((p) => (
            <Link key={p} href={`/shop?q=${encodeURIComponent(p)}`} onClick={onPick} className="min-h-11 rounded-full border border-line px-4 py-2.5 text-sm transition hover:border-gold hover:text-gold-ink">{p}</Link>
          ))}
        </div>
      </div>
    );
  return (
    <ul id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
      {loading && !hits.length && [0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-3 p-2"><div className="skeleton h-14 w-12 rounded-xl" /><div className="flex-1 space-y-2"><div className="skeleton h-3 w-2/3 rounded" /><div className="skeleton h-3 w-1/4 rounded" /></div></li>
      ))}
      {!loading && !hits.length && <li className="p-4 text-sm text-muted">No gifts match “{q}”. Try “roses” or “birthday”.</li>}
      {hits.map((h, i) => (
        <m.li key={h.id} role="option" aria-selected={i === active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <Link href={`/product/${h.slug}`} onClick={onPick} className={cn("flex min-h-14 items-center gap-3 rounded-2xl p-2 transition hover:bg-surface-2", i === active && "bg-surface-2")}>
            <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-2"><ProductImage src={h.image} alt="" fill sizes="48px" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{h.name}</span>
              <span className="text-xs text-muted">{h.category}</span>
            </span>
            <span className="text-sm font-semibold tabular-nums">{money(h.price)}</span>
          </Link>
        </m.li>
      ))}
      {hits.length > 0 && (
        <li>
          <Link href={`/shop?q=${encodeURIComponent(q)}`} onClick={onPick} className="mt-1 flex min-h-11 items-center justify-center gap-2 rounded-2xl p-3 text-sm font-semibold text-gold-ink hover:bg-surface-2">
            See all results <ArrowRight size={16} />
          </Link>
        </li>
      )}
    </ul>
  );
}

function useSearchKeys(hits: Hit[], q: string, close: () => void) {
  const router = useRouter();
  const [active, setActive] = useState(-1);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(hits.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
    else if (e.key === "Escape") close();
    else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && hits[active]) router.push(`/product/${hits[active].slug}`);
      else if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
      close();
    }
  };
  return { active, setActive, onKeyDown };
}

/** Desktop: the search icon expands into a search bar with live suggestions. */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { hits, loading } = useSuggestions(q);
  const close = () => { setOpen(false); setQ(""); };
  const { active, onKeyDown } = useSearchKeys(hits, q, close);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDoc = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden lg:block">
      <m.div
        className={cn("flex h-11 items-center overflow-hidden rounded-full", open ? "border border-line bg-surface shadow-soft" : "")}
        initial={false}
        animate={{ width: open ? 300 : 44 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <button type="button" aria-label={open ? "Close search" : "Search gifts"} aria-expanded={open} onClick={() => (open ? close() : setOpen(true))} className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:text-gold-ink">
          <m.span animate={{ rotate: open ? 90 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>{open ? <X size={19} /> : <Search size={20} />}</m.span>
        </button>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search roses, teddy, cake…"
          aria-label="Search products"
          aria-controls={listId}
          aria-autocomplete="list"
          tabIndex={open ? 0 : -1}
          className="h-full min-w-0 flex-1 bg-transparent pr-4 text-sm outline-none placeholder:text-muted"
        />
      </m.div>
      <AnimatePresence>
        {open && (
          <m.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.2 }} className="absolute right-0 top-14 z-50 w-[380px] overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
            <Suggestions q={q} hits={hits} loading={loading} active={active} onPick={close} listId={listId} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Mobile / tablet: full-width search sheet opened from the header or bottom bar. */
export function SearchSheet() {
  const { searchOpen, setSearch } = useUI();
  const [q, setQ] = useState("");
  const { hits, loading } = useSuggestions(q);
  const close = () => { setSearch(false); setQ(""); };
  const { active, onKeyDown } = useSearchKeys(hits, q, close);
  const listId = useId();
  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <m.div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <m.div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-x-0 top-0 z-[61] rounded-b-[2rem] border-b border-line bg-surface pt-[env(safe-area-inset-top)] shadow-lift" initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ type: "spring", stiffness: 340, damping: 34 }}>
            <div className="flex items-center gap-2 border-b border-line p-3">
              <m.span initial={{ scale: 0.6, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} className="grid h-11 w-11 place-items-center text-gold-ink"><Search size={20} /></m.span>
              <m.input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search gifts…"
                aria-label="Search products"
                aria-controls={listId}
                className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.35 }}
              />
              <button onClick={close} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2" aria-label="Close search"><X size={20} /></button>
            </div>
            <Suggestions q={q} hits={hits} loading={loading} active={active} onPick={close} listId={listId} />
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
