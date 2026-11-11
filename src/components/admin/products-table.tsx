"use client";
import { AnimatePresence, m } from "framer-motion";
import { FileUp, Plus, Search, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, buttonClass, Input, Select, Textarea } from "../ui";
import { CATEGORIES } from "@/data/catalog";
import { toast } from "@/lib/client-store";
import type { Product } from "@/lib/types";
import { cn, money } from "@/lib/utils";

const stockOf = (p: Product) => (p.variants?.options.length ? p.variants.options.reduce((a, o) => a + o.stock, 0) : p.stock);
const SAMPLE = `name,slug,subtitle,description,price,compare_at_price,category,occasions,recipients,tags,stock,image_urls,status,delivery_days
Lavender Dreams Bouquet,lavender-dreams-bouquet,Lilac roses & lavender,Soft lilac roses with dried lavender in a pastel wrap.,85,,flowers,birthday|thank-you,her|mom,roses|lavender,20,/photos/bouquet-13.webp,active,1
Chocolate Lover's Crate,chocolate-lovers-crate,Truffles brownies & cocoa,A crate of artisan chocolate treats.,64,72,cakes-sweets,thank-you|christmas,friends|colleagues,chocolate,35,/photos/p11.webp,active,2`;

function CsvImport({ onClose }: { onClose: () => void }) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<{ row: number; name: string; action: string; error?: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const run = async (dryRun: boolean) => {
    setBusy(true);
    const r = await fetch("/api/admin/products/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ csv, dryRun }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return toast({ title: "Import failed", description: j.error, tone: "error" });
    if (dryRun) setPreview(j.results);
    else { toast({ title: `Imported ${j.imported} products` }); router.refresh(); onClose(); }
  };
  return (
    <>
      <m.div className="fixed inset-0 z-50 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <m.div role="dialog" aria-modal="true" aria-label="Bulk upload products" className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] max-w-2xl flex-col rounded-t-[2rem] bg-surface shadow-lift sm:inset-y-10 sm:bottom-auto sm:rounded-[2rem]" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
        <div className="flex items-center justify-between border-b border-line p-5"><h2 className="font-display text-2xl">Bulk upload (CSV)</h2><button onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2"><X size={18} /></button></div>
        <div className="space-y-4 overflow-y-auto p-5">
          <p className="text-sm text-muted">Columns: <code className="text-xs">name, slug, subtitle, description, price, compare_at_price, category, occasions, recipients, tags, stock, image_urls, status, delivery_days</code>. Use <code>|</code> to separate multiple values. Existing slugs are updated.</p>
          <div className="flex flex-wrap gap-2">
            <label className={buttonClass("outline", "sm", "cursor-pointer")}><FileUp size={15} /> Choose .csv file<input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setCsv(await f.text()); setPreview(null); } }} /></label>
            <button type="button" onClick={() => { setCsv(SAMPLE); setPreview(null); }} className={buttonClass("ghost", "sm")}>Use sample data</button>
            <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE)}`} download="products-template.csv" className={buttonClass("ghost", "sm")}>Download template</a>
          </div>
          <Textarea value={csv} onChange={(e) => { setCsv(e.target.value); setPreview(null); }} className="min-h-40 font-mono text-xs" placeholder="Paste CSV here…" aria-label="CSV content" />
          {preview && (
            <ul className="divide-y divide-line rounded-2xl border border-line text-sm">
              {preview.map((p) => <li key={p.row} className="flex items-center justify-between gap-3 px-4 py-2"><span className="truncate">Row {p.row}: {p.name || "—"}</span><span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", p.action === "error" ? "bg-rose/10 text-rose" : p.action === "create" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-sky-500/15 text-sky-700 dark:text-sky-300")}>{p.action === "error" ? p.error : p.action}</span></li>)}
            </ul>
          )}
        </div>
        <div className="flex gap-2 border-t border-line p-5">
          <Button variant="outline" className="flex-1" disabled={!csv.trim()} loading={busy && !preview} onClick={() => run(true)}>Preview</Button>
          <Button className="flex-1" disabled={!preview || preview.every((p) => p.action === "error")} loading={busy && !!preview} onClick={() => run(false)}><Upload size={16} /> Import {preview ? preview.filter((p) => p.action !== "error").length : ""}</Button>
        </div>
      </m.div>
    </>
  );
}

export function ProductsTable({ products, initialStock }: { products: Product[]; initialStock?: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [stock, setStock] = useState(initialStock ?? "all");
  const [importing, setImporting] = useState(false);
  const list = useMemo(() => products.filter((p) => (cat === "all" || p.category === cat) && (status === "all" || p.status === status) && (stock === "all" || (stock === "low" ? stockOf(p) <= 5 : stockOf(p) === 0)) && (!q || `${p.name} ${p.slug} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))), [products, q, cat, status, stock]);
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl sm:text-4xl">Products</h1><p className="mt-1 text-sm text-muted">{products.length} products · {products.filter((p) => p.status === "active").length} live</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => setImporting(true)}><FileUp size={16} /> Bulk upload</Button><Link href="/admin/products/new" className={buttonClass("primary")}><Plus size={16} /> Add product</Link></div>
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="pl-10" aria-label="Search products" /></div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="sm:w-52"><option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="sm:w-36"><option value="all">Any status</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></Select>
        <Select value={stock} onChange={(e) => setStock(e.target.value)} aria-label="Stock" className="sm:w-36"><option value="all">Any stock</option><option value="low">Low (≤5)</option><option value="out">Sold out</option></Select>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => {
          const s = stockOf(p);
          return (
            <li key={p.id}>
              <Link href={`/admin/products/${p.id}`} className="flex gap-4 rounded-3xl border border-line bg-surface p-3 shadow-soft transition hover:border-gold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt="" className="h-24 w-20 shrink-0 rounded-2xl bg-surface-2 object-cover" loading="lazy" />
                <div className="min-w-0 flex-1 py-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted">{CATEGORIES.find((c) => c.slug === p.category)?.name}{p.variants ? ` · ${p.variants.options.length} variants` : ""}</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums">{p.variants?.options.length ? `${money(Math.min(...p.variants.options.map((o) => o.price)))} – ${money(Math.max(...p.variants.options.map((o) => o.price)))}` : money(p.price)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[0.68rem] font-semibold", p.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-surface-2 text-muted")}>{p.status}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[0.68rem] font-semibold", s === 0 ? "bg-rose/10 text-rose" : s <= 5 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-surface-2 text-muted")}>{s === 0 ? "Sold out" : `${s} in stock`}</span>
                    {p.reviewCount > 0 && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.68rem] text-muted">★ {p.rating}</span>}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {list.length === 0 && <div className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">No products match these filters.</div>}
      <AnimatePresence>{importing && <CsvImport onClose={() => setImporting(false)} />}</AnimatePresence>
    </>
  );
}
