"use client";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { fromPrice, ProductCard } from "./product-card";
import { Button, Checkbox, Select } from "./ui";
import { CATEGORIES, OCCASIONS, RECIPIENTS } from "@/data/catalog";
import type { Product } from "@/lib/types";
import { parseFilters, PRICE_MAX, type ShopFilters } from "@/lib/shop-filters";
import { cn } from "@/lib/utils";

const SORTS = [
  { v: "featured", label: "Featured" },
  { v: "popular", label: "Best selling" },
  { v: "newest", label: "Newest" },
  { v: "price-asc", label: "Price: low to high" },
  { v: "price-desc", label: "Price: high to low" },
  { v: "rating", label: "Top rated" },
];

function apply(products: Product[], f: ShopFilters) {
  const terms = f.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let list = products.filter((p) => {
    const price = fromPrice(p);
    if (f.category.length && !f.category.includes(p.category)) return false;
    if (f.occasion.length && !f.occasion.some((o) => p.occasions.includes(o))) return false;
    if (f.recipient.length && !f.recipient.some((r) => p.recipients.includes(r))) return false;
    if (price < f.min || (f.max < PRICE_MAX && price > f.max)) return false;
    if (terms.length) {
      const hay = `${p.name} ${p.subtitle} ${p.tags.join(" ")} ${p.occasions.join(" ")} ${p.category} ${p.description}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t) || hay.includes(t.replace(/s$/, "")))) return false;
    }
    return true;
  });
  const by: Record<string, (a: Product, b: Product) => number> = {
    featured: (a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.bestseller) - Number(!!a.bestseller),
    popular: (a, b) => Number(!!b.bestseller) - Number(!!a.bestseller) || b.reviewCount - a.reviewCount,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "price-asc": (a, b) => fromPrice(a) - fromPrice(b),
    "price-desc": (a, b) => fromPrice(b) - fromPrice(a),
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  };
  list = [...list].sort(by[f.sort] ?? by.featured);
  return list;
}

function FilterGroup({ title, items, selected, onToggle }: { title: string; items: { slug: string; name: string; emoji?: string }[]; selected: string[]; onToggle: (s: string) => void }) {
  return (
    <fieldset className="border-b border-line py-5">
      <legend className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-muted">{title}</legend>
      <div className="space-y-0.5">
        {items.map((i) => (
          <Checkbox key={i.slug} checked={selected.includes(i.slug)} onChange={() => onToggle(i.slug)} label={<span>{i.emoji && <span aria-hidden className="mr-1.5">{i.emoji}</span>}{i.name}</span>} />
        ))}
      </div>
    </fieldset>
  );
}

function PriceRange({ min, max, onChange }: { min: number; max: number; onChange: (min: number, max: number) => void }) {
  return (
    <fieldset className="border-b border-line py-5">
      <legend className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-muted">Price</legend>
      <div className="relative h-11">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-surface-2" />
        <div className="gold-bg absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full" style={{ left: `${(min / PRICE_MAX) * 100}%`, right: `${100 - (max / PRICE_MAX) * 100}%` }} />
        {[
          { v: min, label: "Minimum price", set: (v: number) => onChange(Math.min(v, max - 10), max) },
          { v: max, label: "Maximum price", set: (v: number) => onChange(min, Math.max(v, min + 10)) },
        ].map((h) => (
          <input key={h.label} type="range" min={0} max={PRICE_MAX} step={10} value={h.v} aria-label={h.label} onChange={(e) => h.set(Number(e.target.value))}
            className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold [&::-moz-range-thumb]:bg-surface [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:shadow-soft" />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm tabular-nums text-muted"><span>${min}</span><span>{max >= PRICE_MAX ? `$${PRICE_MAX}+` : `$${max}`}</span></div>
    </fieldset>
  );
}

export function ShopView({ products, initial, title }: { products: Product[]; initial: ShopFilters; title: string }) {
  const [f, setF] = useState<ShopFilters>(initial);
  const [sheet, setSheet] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [written, setWritten] = useState(sp.toString());
  const [interacted, setInteracted] = useState(false);
  if (!interacted && JSON.stringify(f) !== JSON.stringify(initial)) setInteracted(true);
  const [seen, setSeen] = useState(sp.toString());
  // external navigation (e.g. header links) → reset filters from the URL
  if (sp.toString() !== seen) {
    setSeen(sp.toString());
    if (sp.toString() !== written) setF(parseFilters((k) => sp.get(k), (k) => sp.getAll(k)));
  }
  const results = useMemo(() => apply(products, f), [products, f]);
  const activeCount = f.category.length + f.occasion.length + f.recipient.length + (f.min > 0 || f.max < PRICE_MAX ? 1 : 0);

  // keep the URL shareable
  useEffect(() => {
    const sp = new URLSearchParams();
    if (f.q) sp.set("q", f.q);
    f.category.forEach((c) => sp.append("category", c));
    f.occasion.forEach((c) => sp.append("occasion", c));
    f.recipient.forEach((c) => sp.append("recipient", c));
    if (f.min > 0) sp.set("min", String(f.min));
    if (f.max < PRICE_MAX) sp.set("max", String(f.max));
    if (f.sort !== "featured") sp.set("sort", f.sort);
    if (f.view !== "grid") sp.set("view", f.view);
    if (sp.toString() === written) return;
    const t = setTimeout(() => {
      setWritten(sp.toString());
      startTransition(() => router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false }));
    }, 250);
    return () => clearTimeout(t);
  }, [f, pathname, router, written]);

  const toggle = (key: "category" | "occasion" | "recipient") => (slug: string) =>
    setF((s) => ({ ...s, [key]: s[key].includes(slug) ? s[key].filter((x) => x !== slug) : [...s[key], slug] }));
  const clear = () => setF((s) => ({ ...s, category: [], occasion: [], recipient: [], min: 0, max: PRICE_MAX, q: "" }));

  const chips = [
    ...f.category.map((v) => ({ k: "category" as const, v, label: CATEGORIES.find((c) => c.slug === v)?.name ?? v })),
    ...f.occasion.map((v) => ({ k: "occasion" as const, v, label: OCCASIONS.find((c) => c.slug === v)?.name ?? v })),
    ...f.recipient.map((v) => ({ k: "recipient" as const, v, label: RECIPIENTS.find((c) => c.slug === v)?.name ?? v })),
  ];

  const filters = (
    <>
      <FilterGroup title="Category" items={CATEGORIES} selected={f.category} onToggle={toggle("category")} />
      <PriceRange min={f.min} max={f.max} onChange={(min, max) => setF((s) => ({ ...s, min, max }))} />
      <FilterGroup title="Occasion" items={OCCASIONS} selected={f.occasion} onToggle={toggle("occasion")} />
      <FilterGroup title="Recipient" items={RECIPIENTS} selected={f.recipient} onToggle={toggle("recipient")} />
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <header className="py-8 sm:py-12">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">The collection</p>
        <h1 className="mt-2 text-4xl sm:text-6xl">{title}</h1>
      </header>

      {/* toolbar */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-y border-line bg-bg/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-full sm:border sm:px-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input value={f.q} onChange={(e) => setF((s) => ({ ...s, q: e.target.value }))} placeholder="Search gifts…" aria-label="Search the collection" className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-10 text-sm outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15" />
            {f.q && <button onClick={() => setF((s) => ({ ...s, q: "" }))} aria-label="Clear search" className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2"><X size={15} /></button>}
          </div>
          <button onClick={() => setSheet(true)} aria-label={`Filters${activeCount ? ` (${activeCount} active)` : ""}`} className="relative flex h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold lg:hidden">
            <SlidersHorizontal size={16} /> <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[10px] text-white">{activeCount}</span>}
          </button>
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <Select id="sort" value={f.sort} onChange={(e) => setF((s) => ({ ...s, sort: e.target.value }))} className="hidden h-11 w-48 rounded-full sm:block">
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
          </Select>
          <div className="flex shrink-0 rounded-full border border-line bg-surface p-0.5" role="group" aria-label="Layout">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setF((s) => ({ ...s, view: v }))} aria-pressed={f.view === v} aria-label={`${v} view`} className="relative grid h-10 w-10 place-items-center rounded-full">
                {f.view === v && <m.span layoutId="view-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className={cn("relative transition", f.view === v ? "text-on-ink" : "text-muted")}>{v === "grid" ? <LayoutGrid size={17} /> : <List size={17} />}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
            <div className="flex items-center justify-between pb-1"><h2 className="font-display text-xl">Refine</h2>{activeCount > 0 && <button onClick={clear} className="min-h-10 text-sm font-semibold text-gold-ink">Clear all</button>}</div>
            {filters}
          </div>
        </aside>
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-muted" aria-live="polite"><strong className="text-fg">{results.length}</strong> {results.length === 1 ? "gift" : "gifts"}{f.q && <> for “{f.q}”</>}</p>
            <AnimatePresence>
              {chips.map((c) => (
                <m.button layout key={c.k + c.v} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => toggle(c.k)(c.v)} className="flex min-h-9 items-center gap-1.5 rounded-full bg-blush px-3 text-xs font-semibold">
                  {c.label} <X size={13} />
                </m.button>
              ))}
            </AnimatePresence>
            <Select aria-label="Sort by" value={f.sort} onChange={(e) => setF((s) => ({ ...s, sort: e.target.value }))} className="ml-auto h-10 w-44 rounded-full text-sm sm:hidden">
              {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
            </Select>
          </div>
          <h2 className="sr-only">Products</h2>
          {results.length === 0 ? (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-[2rem] border border-dashed border-line bg-surface px-6 py-16 text-center">
              <span className="text-5xl" aria-hidden>🎁</span>
              <h2 className="mt-4 font-display text-2xl">No gifts match those filters</h2>
              <p className="mt-2 max-w-sm text-sm text-muted">Try removing a filter or widening your price range — or let our team build a custom surprise for you.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3"><Button onClick={clear}>Clear filters</Button><a href="/contact" className="inline-flex h-12 items-center rounded-full border border-line px-6 font-semibold">Request a custom gift</a></div>
            </m.div>
          ) : (
            <LayoutGroup>
              <m.ul layout={interacted} className={cn(f.view === "grid" ? "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3" : "grid gap-4 xl:grid-cols-2")}>
                <AnimatePresence mode="popLayout">
                  {results.map((p, i) => (
                    <m.li layout={interacted} key={p.id} initial={interacted ? { opacity: 0, y: 24 } : false} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }} exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}>
                      <ProductCard product={p} layout={f.view} priority={i < 2} />
                    </m.li>
                  ))}
                </AnimatePresence>
              </m.ul>
            </LayoutGroup>
          )}
        </div>
      </div>

      {/* mobile filter sheet */}
      <AnimatePresence>
        {sheet && (
          <>
            <m.div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <m.div role="dialog" aria-modal="true" aria-label="Filters" className="fixed inset-x-0 bottom-0 z-[71] flex max-h-[88dvh] flex-col rounded-t-[2rem] bg-surface shadow-lift" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 36 }} drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }} onDragEnd={(_, i) => i.offset.y > 120 && setSheet(false)}>
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-line" />
              <div className="flex items-center justify-between px-5 pt-3"><h2 className="font-display text-2xl">Filters</h2><button onClick={() => setSheet(false)} aria-label="Close filters" className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2"><X size={20} /></button></div>
              <div className="flex-1 overflow-y-auto px-5">{filters}</div>
              <div className="flex gap-3 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Button variant="outline" onClick={clear} className="flex-1">Clear</Button>
                <Button onClick={() => setSheet(false)} className="flex-[2]">Show {results.length} gifts</Button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
