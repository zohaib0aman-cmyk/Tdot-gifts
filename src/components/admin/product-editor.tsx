"use client";
import { Reorder } from "framer-motion";
import { ArrowLeft, ExternalLink, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploadButton } from "./image-upload";
import { Panel } from "./shell";
import { Button, Checkbox, Field, Input, Select, Textarea } from "../ui";
import { CATEGORIES, OCCASIONS, RECIPIENTS } from "@/data/catalog";
import { toast } from "@/lib/client-store";
import type { Product, VariantGroup } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

type Draft = Omit<Product, "rating" | "reviewCount" | "createdAt" | "updatedAt" | "id"> & { id?: string };

const blank: Draft = { slug: "", name: "", subtitle: "", description: "", details: [], price: 0, images: [], category: "flowers", occasions: [], recipients: [], tags: [], stock: 10, deliveryDays: 2, status: "draft", isNew: true };

function Chips({ all, value, onChange }: { all: { slug: string; name: string; emoji?: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((o) => {
        const on = value.includes(o.slug);
        return <button key={o.slug} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o.slug) : [...value, o.slug])} className={cn("min-h-10 rounded-full border px-3 text-sm transition", on ? "border-ink bg-ink text-on-ink" : "border-line hover:border-gold")}>{o.emoji} {o.name}</button>;
      })}
    </div>
  );
}

export function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(product ? { ...product } : blank);
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const num = (v: string) => (v === "" ? 0 : Number(v));
  const variants = d.variants;
  const setVariants = (v?: VariantGroup) => set("variants", v);

  const save = async () => {
    setBusy(true);
    const payload = { ...d, compareAtPrice: d.compareAtPrice || undefined, details: d.details.filter(Boolean), tags: d.tags.filter(Boolean), variants: variants && variants.options.length ? variants : undefined };
    const r = await fetch("/api/admin/products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return toast({ title: "Couldn't save product", description: j.error, tone: "error" });
    toast({ title: product ? "Product saved" : "Product created", description: j.product.name });
    if (!product) router.replace(`/admin/products/${j.product.id}`);
    router.refresh();
  };
  const remove = async () => {
    if (!product || !confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    const r = await fetch("/api/admin/products", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: product.id }) });
    if (r.ok) { toast({ title: "Product deleted", tone: "info" }); router.push("/admin/products"); router.refresh(); }
  };

  return (
    <div className="pb-24">
      <Link href="/admin/products" className="mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft size={16} /> Products</Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl">{product ? d.name || "Edit product" : "New product"}</h1>
        {product && <Link href={`/product/${product.slug}`} target="_blank" className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-gold-ink"><ExternalLink size={15} /> View in store</Link>}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr] [&>*]:min-w-0">
        <div className="space-y-4">
          <Panel title="Details">
            <div className="grid gap-4">
              <Field label="Name" htmlFor="p-name"><Input id="p-name" value={d.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} /></Field>
              <Field label="URL slug" htmlFor="p-slug" hint={`/product/${d.slug || "…"}`}><Input id="p-slug" value={d.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} /></Field>
              <Field label="Subtitle" htmlFor="p-sub"><Input id="p-sub" value={d.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></Field>
              <Field label="Description" htmlFor="p-desc"><Textarea id="p-desc" value={d.description} onChange={(e) => set("description", e.target.value)} className="min-h-36" /></Field>
              <Field label="What's included (one per line)" htmlFor="p-det"><Textarea id="p-det" value={d.details.join("\n")} onChange={(e) => set("details", e.target.value.split("\n"))} /></Field>
            </div>
          </Panel>
          <Panel title="Images" action={<span className="text-xs text-muted">Drag to reorder · first is the cover</span>}>
            <Reorder.Group axis="x" values={d.images} onReorder={(v) => set("images", v)} className="flex flex-wrap gap-3">
              {d.images.map((src, i) => (
                <Reorder.Item key={src} value={src} className="group relative h-32 w-26 cursor-grab overflow-hidden rounded-2xl bg-surface-2 active:cursor-grabbing" style={{ width: 104 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
                  {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] font-bold text-on-ink">Cover</span>}
                  <span className="absolute bottom-1.5 left-1.5 grid h-7 w-7 place-items-center rounded-full bg-surface/90"><GripVertical size={14} /></span>
                  <button type="button" onClick={() => set("images", d.images.filter((x) => x !== src))} aria-label="Remove image" className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-surface/90 text-rose"><X size={14} /></button>
                </Reorder.Item>
              ))}
              <li className="list-none"><ImageUploadButton className="h-32 w-[104px]" label="Add photos" onUploaded={(url) => setD((x) => ({ ...x, images: [...x.images, url] }))} /></li>
            </Reorder.Group>
            <div className="mt-3 flex gap-2"><Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="…or paste an image URL (https://)" aria-label="Image URL" /><Button type="button" variant="outline" onClick={() => { if (/^(https:\/\/|\/)/.test(urlInput)) { set("images", [...d.images, urlInput]); setUrlInput(""); } else toast({ title: "Use an https:// URL", tone: "error" }); }}>Add</Button></div>
          </Panel>
          <Panel title="Variants" action={!variants ? <Button size="sm" variant="outline" onClick={() => setVariants({ name: "Size", options: [{ id: `v${Date.now()}`, label: "Standard", price: d.price, stock: d.stock }] })}><Plus size={14} /> Add variants</Button> : <Button size="sm" variant="ghost" onClick={() => setVariants(undefined)}>Remove variants</Button>}>
            {!variants ? <p className="text-sm text-muted">This product has a single price and stock level. Add variants for sizes, colors or quantities.</p> : (
              <div className="space-y-3">
                <Field label="Option name" htmlFor="v-name"><Input id="v-name" value={variants.name} onChange={(e) => setVariants({ ...variants, name: e.target.value })} placeholder="Size, Color, Stems…" /></Field>
                <div className="hidden grid-cols-[1fr_110px_90px_44px] gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted sm:grid"><span>Label</span><span>Price ($)</span><span>Stock</span><span /></div>
                {variants.options.map((o, i) => (
                  <div key={o.id} className="grid grid-cols-[1fr_1fr_44px] gap-2 rounded-2xl bg-surface-2/50 p-2 sm:grid-cols-[1fr_110px_90px_44px] sm:bg-transparent sm:p-0">
                    <Input aria-label="Variant label" className="col-span-3 sm:col-span-1" value={o.label} onChange={(e) => setVariants({ ...variants, options: variants.options.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                    <Input aria-label="Variant price" inputMode="decimal" value={o.price} onChange={(e) => setVariants({ ...variants, options: variants.options.map((x, j) => (j === i ? { ...x, price: num(e.target.value) } : x)) })} />
                    <Input aria-label="Variant stock" inputMode="numeric" value={o.stock} onChange={(e) => setVariants({ ...variants, options: variants.options.map((x, j) => (j === i ? { ...x, stock: Math.max(0, Math.floor(num(e.target.value))) } : x)) })} />
                    <button type="button" aria-label="Remove variant" onClick={() => setVariants({ ...variants, options: variants.options.filter((_, j) => j !== i) })} className="grid h-12 w-11 place-items-center rounded-2xl text-rose hover:bg-rose/10"><Trash2 size={16} /></button>
                  </div>
                ))}
                <Button size="sm" variant="soft" onClick={() => setVariants({ ...variants, options: [...variants.options, { id: `v${Date.now()}`, label: "", price: d.price, stock: 0 }] })}><Plus size={14} /> Add option</Button>
              </div>
            )}
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Status & pricing">
            <div className="grid gap-4">
              <Field label="Status" htmlFor="p-status"><Select id="p-status" value={d.status} onChange={(e) => set("status", e.target.value as Draft["status"])}><option value="active">Active — visible in store</option><option value="draft">Draft — hidden</option><option value="archived">Archived</option></Select></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price ($)" htmlFor="p-price"><Input id="p-price" inputMode="decimal" value={d.price} onChange={(e) => set("price", num(e.target.value))} /></Field>
                <Field label="Compare-at ($)" htmlFor="p-cmp"><Input id="p-cmp" inputMode="decimal" value={d.compareAtPrice ?? ""} onChange={(e) => set("compareAtPrice", e.target.value ? num(e.target.value) : undefined)} /></Field>
                <Field label="Stock" htmlFor="p-stock" hint={variants ? "Managed per variant" : undefined}><Input id="p-stock" inputMode="numeric" disabled={!!variants} value={d.stock} onChange={(e) => set("stock", Math.max(0, Math.floor(num(e.target.value))))} /></Field>
                <Field label="Delivery days" htmlFor="p-days"><Input id="p-days" inputMode="numeric" value={d.deliveryDays} onChange={(e) => set("deliveryDays", Math.max(0, Math.floor(num(e.target.value))))} /></Field>
              </div>
              <div className="flex flex-wrap gap-x-4">
                <Checkbox checked={!!d.bestseller} onChange={(e) => set("bestseller", e.target.checked)} label="Best seller" />
                <Checkbox checked={!!d.isNew} onChange={(e) => set("isNew", e.target.checked)} label="New" />
                <Checkbox checked={!!d.featured} onChange={(e) => set("featured", e.target.checked)} label="Featured" />
              </div>
            </div>
          </Panel>
          <Panel title="Organization">
            <div className="grid gap-4">
              <Field label="Category" htmlFor="p-cat"><Select id="p-cat" value={d.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select></Field>
              <div><p className="mb-2 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted">Occasions</p><Chips all={OCCASIONS} value={d.occasions} onChange={(v) => set("occasions", v)} /></div>
              <div><p className="mb-2 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted">Recipients</p><Chips all={RECIPIENTS} value={d.recipients} onChange={(v) => set("recipients", v)} /></div>
              <Field label="Tags (comma separated)" htmlFor="p-tags"><Input id="p-tags" value={d.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()))} /></Field>
            </div>
          </Panel>
          {product && <Button variant="outline" className="w-full text-rose" onClick={remove}><Trash2 size={16} /> Delete product</Button>}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-[64px] z-20 border-t border-line bg-surface/95 p-3 backdrop-blur-xl lg:bottom-0 lg:left-[260px]">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-2 lg:px-8">
          <span className="hidden text-sm text-muted sm:block">{d.status === "active" ? "Changes go live immediately" : "Saved as hidden draft"}</span>
          <Button loading={busy} onClick={save} disabled={!d.name || !d.slug || !d.images.length}><Save size={16} /> {product ? "Save product" : "Create product"}</Button>
        </div>
      </div>
    </div>
  );
}
