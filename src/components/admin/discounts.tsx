"use client";
import { AnimatePresence, m } from "framer-motion";
import { Copy, Gift, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Panel } from "./shell";
import { Button, Checkbox, Field, Input, Select, Textarea } from "../ui";
import { toast } from "@/lib/client-store";
import type { GiftCard, PromoCode } from "@/lib/types";
import { cn, formatDate, money, nowMs } from "@/lib/utils";

const emptyPromo: Omit<PromoCode, "id" | "used"> & { id?: string } = { code: "", type: "percent", value: 10, active: true, description: "" };

export function Discounts({ promos, cards }: { promos: PromoCode[]; cards: GiftCard[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<typeof emptyPromo | null>(null);
  const [gc, setGc] = useState<{ amount: string; recipientName: string; recipientEmail: string; message: string; send: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const call = async (url: string, method: string, body: unknown, ok: string) => {
    setBusy(true);
    const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { toast({ title: "Something went wrong", description: j.error, tone: "error" }); return null; }
    toast({ title: ok });
    router.refresh();
    return j;
  };
  const describe = (p: PromoCode) => (p.type === "percent" ? `${p.value}% off` : p.type === "fixed" ? `${money(p.value)} off` : "Free shipping") + (p.minSubtotal ? ` · min ${money(p.minSubtotal)}` : "");
  return (
    <div className="grid gap-4 xl:grid-cols-2 [&>*]:min-w-0">
      <Panel title={<span className="flex items-center gap-2"><Tag size={18} className="text-gold-ink" /> Promo codes</span>} action={<Button size="sm" onClick={() => setEdit({ ...emptyPromo })}><Plus size={14} /> New code</Button>}>
        <AnimatePresence>
          {edit && (
            <m.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
              onSubmit={async (e) => { e.preventDefault(); if (await call("/api/admin/promos", "POST", { ...edit, minSubtotal: edit.minSubtotal || undefined, usageLimit: edit.usageLimit || undefined }, edit.id ? "Promo updated" : "Promo created")) setEdit(null); }}>
              <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-surface-2/60 p-4">
                <Field label="Code" htmlFor="pc-code"><Input id="pc-code" required value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} className="font-mono" /></Field>
                <Field label="Type" htmlFor="pc-type"><Select id="pc-type" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as PromoCode["type"] })}><option value="percent">Percent off</option><option value="fixed">Fixed amount</option><option value="free_shipping">Free shipping</option></Select></Field>
                {edit.type !== "free_shipping" && <Field label={edit.type === "percent" ? "Percent" : "Amount ($)"} htmlFor="pc-val"><Input id="pc-val" inputMode="decimal" value={edit.value} onChange={(e) => setEdit({ ...edit, value: Number(e.target.value) || 0 })} /></Field>}
                <Field label="Min. subtotal ($)" htmlFor="pc-min"><Input id="pc-min" inputMode="decimal" value={edit.minSubtotal ?? ""} onChange={(e) => setEdit({ ...edit, minSubtotal: Number(e.target.value) || undefined })} /></Field>
                <Field label="Usage limit" htmlFor="pc-lim"><Input id="pc-lim" inputMode="numeric" value={edit.usageLimit ?? ""} onChange={(e) => setEdit({ ...edit, usageLimit: Number(e.target.value) || undefined })} placeholder="Unlimited" /></Field>
                <Field label="Expires" htmlFor="pc-exp"><Input id="pc-exp" type="date" value={edit.expiresAt?.slice(0, 10) ?? ""} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value ? `${e.target.value}T23:59:59Z` : undefined })} /></Field>
                <Field label="Description" htmlFor="pc-desc" className="col-span-2"><Input id="pc-desc" value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
                <Checkbox checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} label="Active" />
                <div className="col-span-2 flex gap-2"><Button type="submit" loading={busy}>Save code</Button><Button type="button" variant="ghost" onClick={() => setEdit(null)}>Cancel</Button></div>
              </div>
            </m.form>
          )}
        </AnimatePresence>
        <ul className="divide-y divide-line">
          {promos.map((p) => {
            const expired = p.expiresAt && Date.parse(p.expiresAt) < nowMs();
            return (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2"><code className="rounded-lg bg-surface-2 px-2 py-0.5 font-mono text-sm font-bold">{p.code}</code><span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-bold", p.active && !expired ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-surface-2 text-muted")}>{expired ? "Expired" : p.active ? "Active" : "Paused"}</span></span>
                  <span className="mt-1 block truncate text-xs text-muted">{describe(p)} · used {p.used}{p.usageLimit ? `/${p.usageLimit}` : ""}{p.expiresAt ? ` · until ${formatDate(p.expiresAt)}` : ""}</span>
                </span>
                <button onClick={() => setEdit({ ...p })} aria-label={`Edit ${p.code}`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2"><Pencil size={15} /></button>
                <button onClick={() => confirm(`Delete ${p.code}?`) && call("/api/admin/promos", "DELETE", { id: p.id }, "Promo deleted")} aria-label={`Delete ${p.code}`} className="grid h-10 w-10 place-items-center rounded-full text-rose hover:bg-rose/10"><Trash2 size={15} /></button>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel title={<span className="flex items-center gap-2"><Gift size={18} className="text-gold-ink" /> Gift cards</span>} action={<Button size="sm" onClick={() => setGc({ amount: "50", recipientName: "", recipientEmail: "", message: "", send: true })}><Plus size={14} /> Issue card</Button>}>
        <AnimatePresence>
          {gc && (
            <m.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
              onSubmit={async (e) => { e.preventDefault(); const j = await call("/api/admin/giftcards", "POST", { ...gc, amount: Number(gc.amount) }, "Gift card issued"); if (j) { setGc(null); navigator.clipboard?.writeText(j.card.code).catch(() => {}); } }}>
              <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-surface-2/60 p-4">
                <Field label="Amount ($)" htmlFor="gc-a"><Input id="gc-a" required inputMode="decimal" value={gc.amount} onChange={(e) => setGc({ ...gc, amount: e.target.value })} /></Field>
                <Field label="Recipient name" htmlFor="gc-n"><Input id="gc-n" value={gc.recipientName} onChange={(e) => setGc({ ...gc, recipientName: e.target.value })} /></Field>
                <Field label="Recipient email" htmlFor="gc-e" className="col-span-2"><Input id="gc-e" type="email" value={gc.recipientEmail} onChange={(e) => setGc({ ...gc, recipientEmail: e.target.value })} /></Field>
                <Field label="Message" htmlFor="gc-m" className="col-span-2"><Textarea id="gc-m" value={gc.message} onChange={(e) => setGc({ ...gc, message: e.target.value })} className="min-h-16" /></Field>
                <Checkbox checked={gc.send} onChange={(e) => setGc({ ...gc, send: e.target.checked })} label="Email it to the recipient" className="col-span-2" />
                <div className="col-span-2 flex gap-2"><Button type="submit" loading={busy}>Issue gift card</Button><Button type="button" variant="ghost" onClick={() => setGc(null)}><X size={14} /> Cancel</Button></div>
              </div>
            </m.form>
          )}
        </AnimatePresence>
        <ul className="divide-y divide-line">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><code className="font-mono text-sm font-bold">{c.code}</code><button onClick={() => { navigator.clipboard?.writeText(c.code); toast({ title: "Code copied" }); }} aria-label="Copy code" className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2"><Copy size={13} /></button></span>
                <span className="block truncate text-xs text-muted">{c.recipientName || "—"}{c.recipientEmail ? ` · ${c.recipientEmail}` : ""} · {formatDate(c.createdAt)}</span>
              </span>
              <span className="text-right text-sm"><span className="block font-semibold tabular-nums">{money(c.balance)}</span><span className="text-xs text-muted">of {money(c.initialBalance)}</span></span>
              <button onClick={() => call("/api/admin/giftcards", "PATCH", { id: c.id, active: !c.active }, c.active ? "Gift card disabled" : "Gift card enabled")} className={cn("min-h-10 rounded-full px-3 text-xs font-semibold", c.active ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-surface-2 text-muted")}>{c.active ? "Active" : "Disabled"}</button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
