"use client";
import { motion, Reorder } from "framer-motion";
import { Eye, EyeOff, GripVertical, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ImageUploadButton } from "./image-upload";
import { Panel } from "./shell";
import { Markdown } from "../markdown";
import { Button, Checkbox, Field, Input, Select, Textarea } from "../ui";
import { DEFAULT_SETTINGS, US_STATES } from "@/data/settings";
import { toast } from "@/lib/client-store";
import type { PolicyKey, SiteSettings } from "@/lib/types";
import { cn, money } from "@/lib/utils";

const CUSTOMIZE_TABS = ["Brand", "Colors & fonts", "Hero banner", "Homepage", "Announcement", "Footer & social"] as const;
const SETTINGS_TABS = ["Shipping", "Taxes", "Emails", "Policies", "Store contact"] as const;

const PRESETS = [
  { name: "Noir & Gold (logo)", colors: { primary: "#16110f", accent: "#c9a14a", blush: "#f2dcdf", cream: "#faf6ef" } },
  { name: "Deep Plum", colors: { primary: "#3b1e2b", accent: "#c9a14a", blush: "#f3dde4", cream: "#fbf6f1" } },
  { name: "Rose Red", colors: { primary: "#5c0f22", accent: "#d4a85a", blush: "#f8dfe3", cream: "#fdf7f3" } },
  { name: "Sage Garden", colors: { primary: "#25352b", accent: "#b9965a", blush: "#e3eadf", cream: "#f8f7f1" } },
];
const FONTS: { v: SiteSettings["font"]; label: string; sample: string }[] = [
  { v: "classic", label: "Classic — Playfair Display + Manrope", sample: "var(--font-playfair)" },
  { v: "romantic", label: "Romantic — Cormorant Garamond + Manrope", sample: "var(--font-cormorant)" },
  { v: "editorial", label: "Editorial — Bodoni Moda + DM Sans", sample: "var(--font-bodoni)" },
  { v: "modern", label: "Modern — Fraunces + DM Sans", sample: "var(--font-fraunces)" },
];
const POLICY_LABEL: Record<PolicyKey, string> = { privacy: "Privacy", terms: "Terms", refunds: "Refunds & returns", shipping: "Shipping" };

export function SettingsEditor({ initial, mode }: { initial: SiteSettings; mode: "customize" | "settings" }) {
  const tabs = mode === "customize" ? CUSTOMIZE_TABS : SETTINGS_TABS;
  const [tab, setTab] = useState<string>(tabs[0]);
  const [s, setS] = useState<SiteSettings>(initial);
  const [busy, setBusy] = useState(false);
  const [policy, setPolicy] = useState<PolicyKey>("refunds");
  const [taxFilter, setTaxFilter] = useState("");
  const router = useRouter();
  const dirty = useMemo(() => JSON.stringify(s) !== JSON.stringify(initial), [s, initial]);
  const up = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((x) => ({ ...x, [k]: v }));

  const save = async () => {
    setBusy(true);
    const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(s) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return toast({ title: "Couldn't save", description: j.error, tone: "error" });
    toast({ title: "Saved — your store is updated", description: "Changes are live now" });
    router.refresh();
  };

  // live-preview colors in the admin itself
  const previewStyle = { "--brand-primary": s.colors.primary, "--brand-accent": s.colors.accent, "--brand-blush": s.colors.blush, "--brand-cream": s.colors.cream } as React.CSSProperties;

  return (
    <div className="pb-24">
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4" role="tablist">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className="relative min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold">
            {tab === t && <motion.span layoutId={`set-tab-${mode}`} className="absolute inset-0 rounded-full bg-ink" />}
            <span className={cn("relative", tab === t ? "text-on-ink" : "text-muted")}>{t}</span>
          </button>
        ))}
      </div>

      {tab === "Brand" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Logo">
            <div className="flex flex-wrap items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logoUrl} alt="Current logo" className="h-24 w-24 rounded-full object-cover ring-1 ring-gold/40" />
              <ImageUploadButton multiple={false} className="h-24 w-32" label="Upload new logo" onUploaded={(url) => up("logoUrl", url)} />
              <Button variant="ghost" size="sm" onClick={() => up("logoUrl", DEFAULT_SETTINGS.logoUrl)}><RotateCcw size={14} /> Reset</Button>
            </div>
            <Field label="Header display" htmlFor="lm" className="mt-4"><Select id="lm" value={s.logoMode} onChange={(e) => up("logoMode", e.target.value as SiteSettings["logoMode"])}><option value="badge+wordmark">Logo badge + wordmark</option><option value="badge">Logo badge only</option><option value="wordmark">Wordmark only</option></Select></Field>
          </Panel>
          <Panel title="Store identity">
            <div className="grid gap-4">
              <Field label="Store name" htmlFor="sn"><Input id="sn" value={s.storeName} onChange={(e) => up("storeName", e.target.value)} /></Field>
              <Field label="Tagline (used in SEO & footer)" htmlFor="tl"><Textarea id="tl" value={s.tagline} onChange={(e) => up("tagline", e.target.value)} className="min-h-20" /></Field>
            </div>
          </Panel>
        </div>
      )}

      {tab === "Colors & fonts" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr] [&>*]:min-w-0">
          <Panel title="Brand colors">
            <div className="mb-5 grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => up("colors", p.colors)} className={cn("flex min-h-12 items-center gap-2 rounded-2xl border p-2 text-left text-xs font-semibold", JSON.stringify(p.colors) === JSON.stringify(s.colors) ? "border-ink" : "border-line hover:border-gold")}>
                  <span className="flex -space-x-1.5">{Object.values(p.colors).map((c) => <span key={c} className="h-6 w-6 rounded-full ring-2 ring-surface" style={{ background: c }} />)}</span>{p.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(["primary", "accent", "blush", "cream"] as const).map((k) => (
                <Field key={k} label={{ primary: "Primary (buttons, text)", accent: "Accent (gold)", blush: "Soft blush", cream: "Background cream" }[k]} htmlFor={`c-${k}`}>
                  <div className="flex items-center gap-2">
                    <input type="color" value={s.colors[k]} onChange={(e) => up("colors", { ...s.colors, [k]: e.target.value })} className="h-12 w-12 shrink-0 cursor-pointer rounded-xl border border-line bg-transparent p-1" aria-label={`${k} color picker`} />
                    <Input id={`c-${k}`} value={s.colors[k]} onChange={(e) => up("colors", { ...s.colors, [k]: e.target.value })} className="font-mono uppercase" maxLength={7} />
                  </div>
                </Field>
              ))}
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Live preview">
              <div style={previewStyle} className="rounded-3xl p-5" >
                <div className="rounded-3xl p-6" style={{ background: s.colors.cream }}>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: s.colors.accent }}>Shop by occasion</p>
                  <p className="mt-2 text-3xl" style={{ fontFamily: FONTS.find((f) => f.v === s.font)?.sample, color: s.colors.primary }}>Gifts that make hearts <em style={{ color: s.colors.accent }}>skip a beat</em></p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full px-5 py-3 text-sm font-semibold" style={{ background: s.colors.primary, color: s.colors.cream }}>Shop gifts</span>
                    <span className="rounded-full px-5 py-3 text-sm font-semibold" style={{ background: s.colors.blush, color: s.colors.primary }}>Gift finder</span>
                  </div>
                </div>
              </div>
            </Panel>
            <Panel title="Font pairing">
              <div className="space-y-2" role="radiogroup">
                {FONTS.map((f) => (
                  <label key={f.v} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border p-3", s.font === f.v ? "border-ink bg-blush/40" : "border-line")}>
                    <input type="radio" name="font" checked={s.font === f.v} onChange={() => up("font", f.v)} className="accent-[var(--ink)]" />
                    <span className="text-2xl" style={{ fontFamily: f.sample }}>Aa</span>
                    <span className="text-sm">{f.label}</span>
                  </label>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === "Hero banner" && (
        <Panel title="Homepage hero">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" htmlFor="h-e" className="sm:col-span-2"><Input id="h-e" value={s.hero.eyebrow} onChange={(e) => up("hero", { ...s.hero, eyebrow: e.target.value })} /></Field>
            <Field label="Headline" htmlFor="h-t"><Input id="h-t" value={s.hero.title} onChange={(e) => up("hero", { ...s.hero, title: e.target.value })} /></Field>
            <Field label="Gold highlight line" htmlFor="h-h"><Input id="h-h" value={s.hero.highlight} onChange={(e) => up("hero", { ...s.hero, highlight: e.target.value })} /></Field>
            <Field label="Subtitle" htmlFor="h-s" className="sm:col-span-2"><Textarea id="h-s" value={s.hero.subtitle} onChange={(e) => up("hero", { ...s.hero, subtitle: e.target.value })} /></Field>
            <Field label="Primary button label" htmlFor="h-cl"><Input id="h-cl" value={s.hero.ctaLabel} onChange={(e) => up("hero", { ...s.hero, ctaLabel: e.target.value })} /></Field>
            <Field label="Primary button link" htmlFor="h-ch"><Input id="h-ch" value={s.hero.ctaHref} onChange={(e) => up("hero", { ...s.hero, ctaHref: e.target.value })} /></Field>
            <Field label="Secondary button label" htmlFor="h-sl"><Input id="h-sl" value={s.hero.secondaryLabel} onChange={(e) => up("hero", { ...s.hero, secondaryLabel: e.target.value })} /></Field>
            <Field label="Secondary button link" htmlFor="h-sh"><Input id="h-sh" value={s.hero.secondaryHref} onChange={(e) => up("hero", { ...s.hero, secondaryHref: e.target.value })} /></Field>
          </div>
          <div className="mt-6 rounded-3xl bg-surface-2/60 p-6 text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold-ink">{s.hero.eyebrow}</p>
            <p className="mt-2 font-display text-3xl sm:text-4xl">{s.hero.title} <em className="gold-text block">{s.hero.highlight}</em></p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{s.hero.subtitle}</p>
          </div>
        </Panel>
      )}

      {tab === "Homepage" && (
        <Panel title="Section order & visibility" action={<span className="text-xs text-muted">Drag to reorder</span>}>
          <Reorder.Group axis="y" values={s.homeSections} onReorder={(v) => up("homeSections", v)} className="space-y-2">
            {s.homeSections.map((sec) => (
              <Reorder.Item key={sec.key} value={sec} className={cn("flex min-h-14 cursor-grab items-center gap-3 rounded-2xl border bg-surface px-3 active:cursor-grabbing", sec.visible ? "border-line" : "border-dashed border-line opacity-60")}>
                <GripVertical size={18} className="text-muted" />
                <span className="flex-1 text-sm font-semibold">{sec.label}</span>
                <button onClick={() => up("homeSections", s.homeSections.map((x) => (x.key === sec.key ? { ...x, visible: !x.visible } : x)))} aria-label={sec.visible ? `Hide ${sec.label}` : `Show ${sec.label}`} className={cn("flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold", sec.visible ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-surface-2 text-muted")}>
                  {sec.visible ? <Eye size={14} /> : <EyeOff size={14} />}{sec.visible ? "Visible" : "Hidden"}
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <p className="mt-4 text-xs text-muted">The animated hero always appears first.</p>
        </Panel>
      )}

      {tab === "Announcement" && (
        <Panel title="Announcement bar">
          <Checkbox checked={s.announcement.enabled} onChange={(e) => up("announcement", { ...s.announcement, enabled: e.target.checked })} label="Show the announcement bar" />
          <div className="mt-3 space-y-2">
            {s.announcement.messages.map((m, i) => (
              <div key={i} className="flex gap-2"><Input value={m} maxLength={120} onChange={(e) => up("announcement", { ...s.announcement, messages: s.announcement.messages.map((x, j) => (j === i ? e.target.value : x)) })} aria-label={`Message ${i + 1}`} /><button onClick={() => up("announcement", { ...s.announcement, messages: s.announcement.messages.filter((_, j) => j !== i) })} aria-label="Remove message" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-rose hover:bg-rose/10"><Trash2 size={16} /></button></div>
            ))}
            {s.announcement.messages.length < 6 && <Button size="sm" variant="soft" onClick={() => up("announcement", { ...s.announcement, messages: [...s.announcement.messages, ""] })}><Plus size={14} /> Add message</Button>}
          </div>
          <p className="mt-3 text-xs text-muted">Messages rotate every few seconds.</p>
        </Panel>
      )}

      {tab === "Footer & social" && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Panel title="Footer link columns">
            <div className="space-y-5">
              {s.footerColumns.map((col, ci) => (
                <div key={ci} className="rounded-2xl border border-line p-3">
                  <div className="mb-2 flex gap-2"><Input value={col.title} onChange={(e) => up("footerColumns", s.footerColumns.map((c, j) => (j === ci ? { ...c, title: e.target.value } : c)))} aria-label="Column title" className="font-semibold" /><button onClick={() => up("footerColumns", s.footerColumns.filter((_, j) => j !== ci))} aria-label="Remove column" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-rose hover:bg-rose/10"><Trash2 size={16} /></button></div>
                  {col.links.map((l, li) => (
                    <div key={li} className="mb-2 grid grid-cols-[1fr_1fr_44px] gap-2">
                      <Input value={l.label} aria-label="Link label" onChange={(e) => up("footerColumns", s.footerColumns.map((c, j) => (j === ci ? { ...c, links: c.links.map((x, k) => (k === li ? { ...x, label: e.target.value } : x)) } : c)))} />
                      <Input value={l.href} aria-label="Link URL" onChange={(e) => up("footerColumns", s.footerColumns.map((c, j) => (j === ci ? { ...c, links: c.links.map((x, k) => (k === li ? { ...x, href: e.target.value } : x)) } : c)))} className="font-mono text-xs" />
                      <button onClick={() => up("footerColumns", s.footerColumns.map((c, j) => (j === ci ? { ...c, links: c.links.filter((_, k) => k !== li) } : c)))} aria-label="Remove link" className="grid h-12 w-11 place-items-center rounded-2xl text-rose hover:bg-rose/10"><Trash2 size={15} /></button>
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => up("footerColumns", s.footerColumns.map((c, j) => (j === ci ? { ...c, links: [...c.links, { label: "New link", href: "/" }] } : c)))}><Plus size={14} /> Add link</Button>
                </div>
              ))}
              {s.footerColumns.length < 4 && <Button size="sm" variant="soft" onClick={() => up("footerColumns", [...s.footerColumns, { title: "New column", links: [] }])}><Plus size={14} /> Add column</Button>}
            </div>
          </Panel>
          <Panel title="Social links">
            <div className="grid gap-4">
              {(["instagram", "facebook", "tiktok", "pinterest", "whatsapp"] as const).map((k) => (
                <Field key={k} label={k === "whatsapp" ? "WhatsApp (https://wa.me/…)" : k} htmlFor={`so-${k}`}><Input id={`so-${k}`} value={s.social[k]} onChange={(e) => up("social", { ...s.social, [k]: e.target.value })} placeholder="https://" /></Field>
              ))}
              <p className="text-xs text-muted">Leave empty to hide an icon.</p>
            </div>
          </Panel>
        </div>
      )}

      {tab === "Shipping" && (
        <div className="space-y-4">
          <Panel title="Free shipping & gift wrap">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Free standard shipping over ($)" htmlFor="fst"><Input id="fst" inputMode="decimal" value={s.freeShippingThreshold} onChange={(e) => up("freeShippingThreshold", Number(e.target.value) || 0)} /></Field>
              <Field label="Gift wrap price ($)" htmlFor="gwp"><Input id="gwp" inputMode="decimal" value={s.giftWrapPrice} onChange={(e) => up("giftWrapPrice", Number(e.target.value) || 0)} /></Field>
            </div>
          </Panel>
          <Panel title="Shipping rates (USPS · UPS · FedEx)">
            <div className="space-y-3">
              {s.shippingRates.map((r, i) => (
                <div key={r.id} className="grid grid-cols-2 gap-2 rounded-2xl border border-line p-3 sm:grid-cols-[100px_1fr_1fr_100px_auto_44px] sm:items-end">
                  <Field label="Carrier" htmlFor={`sr-c${i}`}><Select id={`sr-c${i}`} value={r.carrier} onChange={(e) => up("shippingRates", s.shippingRates.map((x, j) => (j === i ? { ...x, carrier: e.target.value as "usps" } : x)))}><option value="usps">USPS</option><option value="ups">UPS</option><option value="fedex">FedEx</option></Select></Field>
                  <Field label="Service name" htmlFor={`sr-n${i}`}><Input id={`sr-n${i}`} value={r.name} onChange={(e) => up("shippingRates", s.shippingRates.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} /></Field>
                  <Field label="Delivery estimate" htmlFor={`sr-e${i}`}><Input id={`sr-e${i}`} value={r.eta} onChange={(e) => up("shippingRates", s.shippingRates.map((x, j) => (j === i ? { ...x, eta: e.target.value } : x)))} /></Field>
                  <Field label="Price ($)" htmlFor={`sr-p${i}`}><Input id={`sr-p${i}`} inputMode="decimal" value={r.price} onChange={(e) => up("shippingRates", s.shippingRates.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) || 0 } : x)))} /></Field>
                  <Checkbox checked={r.enabled} onChange={(e) => up("shippingRates", s.shippingRates.map((x, j) => (j === i ? { ...x, enabled: e.target.checked } : x)))} label="On" />
                  <button onClick={() => up("shippingRates", s.shippingRates.filter((_, j) => j !== i))} aria-label="Remove rate" className="grid h-12 w-11 place-items-center rounded-2xl text-rose hover:bg-rose/10"><Trash2 size={15} /></button>
                </div>
              ))}
              <Button size="sm" variant="soft" onClick={() => up("shippingRates", [...s.shippingRates, { id: `rate-${Date.now()}`, carrier: "usps", name: "New service", eta: "3–5 business days", price: 9.95, minDays: 3, maxDays: 5, enabled: true }])}><Plus size={14} /> Add rate</Button>
              <p className="text-xs text-muted">When an order qualifies for free shipping, the cheapest enabled rate becomes free and faster options are discounted by that amount.</p>
            </div>
          </Panel>
        </div>
      )}

      {tab === "Taxes" && (
        <Panel title="Sales tax by state (%)" action={<Input value={taxFilter} onChange={(e) => setTaxFilter(e.target.value)} placeholder="Filter states…" className="h-10 w-40" aria-label="Filter states" />}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {US_STATES.filter((st) => !taxFilter || st.name.toLowerCase().includes(taxFilter.toLowerCase()) || st.code.toLowerCase() === taxFilter.toLowerCase()).map((st) => (
              <label key={st.code} className="flex items-center gap-2 rounded-2xl border border-line px-3 py-1.5">
                <span className="min-w-0 flex-1 truncate text-sm"><strong className="mr-1">{st.code}</strong><span className="text-muted">{st.name}</span></span>
                <input inputMode="decimal" value={s.taxRates[st.code] ?? 0} onChange={(e) => up("taxRates", { ...s.taxRates, [st.code]: Math.min(20, Number(e.target.value.replace(/[^\d.]/g, "")) || 0) })} className="h-10 w-16 rounded-xl border border-line bg-bg px-2 text-right text-sm tabular-nums" aria-label={`${st.name} tax rate`} />
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Applied to merchandise, gift wrap and after discounts. Gift cards are never taxed. Consult your accountant for local/county rates.</p>
        </Panel>
      )}

      {tab === "Emails" && (
        <div className="grid gap-4 xl:grid-cols-3">
          {(["orderConfirmation", "shipped", "giftCard"] as const).map((k) => (
            <Panel key={k} title={{ orderConfirmation: "Order confirmation", shipped: "Order shipped", giftCard: "Gift card delivery" }[k]}>
              <div className="grid gap-3">
                <Field label="Subject" htmlFor={`em-s-${k}`}><Input id={`em-s-${k}`} value={s.emailTemplates[k].subject} onChange={(e) => up("emailTemplates", { ...s.emailTemplates, [k]: { ...s.emailTemplates[k], subject: e.target.value } })} /></Field>
                <Field label="Intro paragraph" htmlFor={`em-i-${k}`}><Textarea id={`em-i-${k}`} value={s.emailTemplates[k].intro} onChange={(e) => up("emailTemplates", { ...s.emailTemplates, [k]: { ...s.emailTemplates[k], intro: e.target.value } })} className="min-h-28" /></Field>
              </div>
              <p className="mt-3 text-xs text-muted">Variables: {k === "giftCard" ? "{{senderName}} {{recipientName}}" : "{{orderNumber}} {{firstName}}"} {"{{storeName}}"}</p>
            </Panel>
          ))}
        </div>
      )}

      {tab === "Policies" && (
        <Panel title="Policies editor" action={<Select value={policy} onChange={(e) => setPolicy(e.target.value as PolicyKey)} className="h-10 w-48" aria-label="Choose policy">{(Object.keys(POLICY_LABEL) as PolicyKey[]).map((k) => <option key={k} value={k}>{POLICY_LABEL[k]}</option>)}</Select>}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <Textarea value={s.policies[policy]} onChange={(e) => up("policies", { ...s.policies, [policy]: e.target.value })} className="min-h-[480px] font-mono text-xs leading-relaxed" aria-label={`${POLICY_LABEL[policy]} policy text`} />
              <p className="mt-2 text-xs text-muted">Formatting: <code>## Heading</code>, <code>- list item</code>, <code>**bold**</code>, <code>[link](/contact)</code>. Blank line between paragraphs.</p>
            </div>
            <div className="max-h-[540px] overflow-y-auto rounded-2xl border border-line bg-bg p-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-ink">Preview</p><Markdown source={s.policies[policy]} /></div>
          </div>
        </Panel>
      )}

      {tab === "Store contact" && (
        <Panel title="Contact details (footer, contact page, emails)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="ct-e"><Input id="ct-e" type="email" value={s.contact.email} onChange={(e) => up("contact", { ...s.contact, email: e.target.value })} /></Field>
            <Field label="Phone" htmlFor="ct-p"><Input id="ct-p" value={s.contact.phone} onChange={(e) => up("contact", { ...s.contact, phone: e.target.value })} /></Field>
            <Field label="Hours" htmlFor="ct-h"><Input id="ct-h" value={s.contact.hours} onChange={(e) => up("contact", { ...s.contact, hours: e.target.value })} /></Field>
            <Field label="Service area" htmlFor="ct-a"><Input id="ct-a" value={s.contact.serviceArea} onChange={(e) => up("contact", { ...s.contact, serviceArea: e.target.value })} /></Field>
          </div>
          <p className="mt-4 text-xs text-muted">Free shipping currently starts at {money(s.freeShippingThreshold)}.</p>
        </Panel>
      )}

      <div className="fixed inset-x-0 bottom-[64px] z-20 border-t border-line bg-surface/95 p-3 backdrop-blur-xl lg:bottom-0 lg:left-[260px]">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-2 lg:px-8">
          <span className={cn("text-sm", dirty ? "font-semibold text-amber-700 dark:text-amber-400" : "text-muted")}>{dirty ? "Unsaved changes" : "All changes saved"}</span>
          {dirty && <Button variant="ghost" onClick={() => setS(initial)}>Discard</Button>}
          <Button loading={busy} disabled={!dirty} onClick={save}><Save size={16} /> Save & publish</Button>
        </div>
      </div>
    </div>
  );
}
