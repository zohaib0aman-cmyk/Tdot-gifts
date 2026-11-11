"use client";
import { AnimatePresence, m } from "framer-motion";
import { Heart, LogOut, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "./product-card";
import { Button, ButtonLink, Checkbox, Field, Input, Select } from "./ui";
import { toast, useHydrated, useWishlist } from "@/lib/client-store";
import type { Address, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AuthForm({ initialMode = "login", next = "/account", email: initialEmail = "" }: { initialMode?: "login" | "signup"; next?: string; email?: string }) {
  const [mode, setMode] = useState(initialMode);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const setWish = useWishlist((s) => s.set);
  const localWish = useWishlist((s) => s.ids);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setErr("");
    const payload = mode === "login" ? { email: fd.get("email"), password: fd.get("password") } : { firstName: fd.get("firstName"), lastName: fd.get("lastName"), email: fd.get("email"), password: fd.get("password"), marketing: fd.get("marketing") === "on" };
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error ?? "Something went wrong"); setBusy(false); return; }
    if (j.wishlist) setWish([...new Set([...localWish, ...j.wishlist])]);
    toast({ title: mode === "login" ? "Welcome back!" : "Account created 🎉" });
    router.push(next.startsWith("/") ? next : "/account");
    router.refresh();
  };
  return (
    <div className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex rounded-full bg-surface-2 p-1" role="tablist">
        {(["login", "signup"] as const).map((md) => (
          <button key={md} role="tab" aria-selected={mode === md} onClick={() => { setMode(md); setErr(""); }} className="relative h-11 flex-1 rounded-full text-sm font-semibold">
            {mode === md && <m.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-surface shadow-soft" />}
            <span className="relative">{md === "login" ? "Sign in" : "Create account"}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <m.form key={mode} onSubmit={submit} initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" htmlFor="a-fn"><Input id="a-fn" name="firstName" required autoComplete="given-name" /></Field>
              <Field label="Last name" htmlFor="a-ln"><Input id="a-ln" name="lastName" required autoComplete="family-name" /></Field>
            </div>
          )}
          <Field label="Email" htmlFor="a-em"><Input id="a-em" name="email" type="email" required defaultValue={initialEmail} autoComplete="email" /></Field>
          <Field label="Password" htmlFor="a-pw" hint={mode === "signup" ? "At least 8 characters" : undefined}><Input id="a-pw" name="password" type="password" required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} /></Field>
          {mode === "signup" && <Checkbox name="marketing" defaultChecked label="Send me occasion reminders & member offers" />}
          {err && <m.p role="alert" animate={{ x: [0, -8, 8, -4, 0] }} className="text-sm text-rose">{err}</m.p>}
          <Button type="submit" size="lg" className="w-full" loading={busy}>{mode === "login" ? "Sign in" : "Create my account"}</Button>
          <p className="text-center text-xs text-muted">Or <Link href="/checkout" className="font-semibold text-gold-ink">check out as a guest</Link> — no account needed.</p>
        </m.form>
      </AnimatePresence>
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); toast({ title: "Signed out", tone: "info" }); router.push("/"); router.refresh(); }} className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-fg">
      <LogOut size={16} /> Sign out
    </button>
  );
}

const EMPTY: Address = { firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", zip: "", phone: "", label: "Home" };
export function AddressBook({ initial, states }: { initial: Address[]; states: { code: string; name: string }[] }) {
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState<{ idx: number; a: Address } | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async (next: Address[]) => {
    setBusy(true);
    const r = await fetch("/api/account/addresses", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ addresses: next }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) { toast({ title: "Couldn't save address", description: j.error, tone: "error" }); return false; }
    setList(j.addresses);
    toast({ title: "Address book updated" });
    return true;
  };
  const upd = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setEditing((s) => (s ? { ...s, a: { ...s.a, [k]: e.target.value } } : s));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {list.map((a, i) => (
            <m.div layout key={a.id ?? i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={cn("rounded-3xl border bg-surface p-5", a.isDefault ? "border-gold" : "border-line")}>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-semibold"><MapPin size={16} className="text-gold-ink" /> {a.label || "Address"}</p>
                {a.isDefault && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-gold-ink">Default</span>}
              </div>
              <p className="mt-2 text-sm text-muted">{a.firstName} {a.lastName}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.zip}{a.phone ? <><br />{a.phone}</> : null}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <button onClick={() => setEditing({ idx: i, a: { ...a } })} className="flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold hover:bg-surface-2"><Pencil size={14} /> Edit</button>
                {!a.isDefault && <button onClick={() => save(list.map((x, j) => ({ ...x, isDefault: j === i })))} className="flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold hover:bg-surface-2"><Star size={14} /> Make default</button>}
                <button onClick={() => save(list.filter((_, j) => j !== i))} className="flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-rose hover:bg-rose/10"><Trash2 size={14} /> Remove</button>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
        {!editing && list.length < 10 && (
          <button onClick={() => setEditing({ idx: -1, a: { ...EMPTY } })} className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-line text-sm font-semibold text-muted transition hover:border-gold hover:text-fg">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-surface-2"><Plus size={20} /></span> Add a new address
          </button>
        )}
      </div>
      <AnimatePresence>
        {editing && (
          <m.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
            onSubmit={async (e) => { e.preventDefault(); const next = editing.idx === -1 ? [...list, editing.a] : list.map((x, j) => (j === editing.idx ? editing.a : x)); if (await save(next)) setEditing(null); }}>
            <div className="grid grid-cols-2 gap-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
              <Field label="Label" htmlFor="ad-label" className="col-span-2"><Input id="ad-label" value={editing.a.label ?? ""} onChange={upd("label")} placeholder="Home, Mom's house…" /></Field>
              <Field label="First name" htmlFor="ad-fn"><Input id="ad-fn" required value={editing.a.firstName} onChange={upd("firstName")} /></Field>
              <Field label="Last name" htmlFor="ad-ln"><Input id="ad-ln" required value={editing.a.lastName} onChange={upd("lastName")} /></Field>
              <Field label="Street address" htmlFor="ad-l1" className="col-span-2"><Input id="ad-l1" required value={editing.a.line1} onChange={upd("line1")} /></Field>
              <Field label="Apt / suite" htmlFor="ad-l2" className="col-span-2"><Input id="ad-l2" value={editing.a.line2 ?? ""} onChange={upd("line2")} /></Field>
              <Field label="City" htmlFor="ad-city" className="col-span-2 sm:col-span-1"><Input id="ad-city" required value={editing.a.city} onChange={upd("city")} /></Field>
              <Field label="State" htmlFor="ad-st"><Select id="ad-st" required value={editing.a.state} onChange={upd("state")}><option value="">Select…</option>{states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</Select></Field>
              <Field label="ZIP" htmlFor="ad-zip"><Input id="ad-zip" required inputMode="numeric" value={editing.a.zip} onChange={upd("zip")} /></Field>
              <Field label="Phone" htmlFor="ad-ph" className="col-span-2 sm:col-span-1"><Input id="ad-ph" type="tel" value={editing.a.phone ?? ""} onChange={upd("phone")} /></Field>
              <div className="col-span-2 flex gap-3"><Button type="submit" loading={busy}>Save address</Button><Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WishlistGrid({ products }: { products: Product[] }) {
  const hydrated = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const items = hydrated ? products.filter((p) => ids.includes(p.id)) : [];
  if (!hydrated) return <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton aspect-[4/5] rounded-[1.75rem]" />)}</div>;
  if (!items.length)
    return (
      <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-line bg-surface px-6 py-16 text-center">
        <m.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="grid h-20 w-20 place-items-center rounded-full bg-blush text-rose"><Heart size={34} /></m.span>
        <h2 className="mt-5 font-display text-2xl">Your wishlist is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">Tap the heart on any gift to save it here for later — perfect for planning the next big surprise.</p>
        <ButtonLink href="/shop" className="mt-6">Discover gifts</ButtonLink>
      </div>
    );
  return (
    <m.div layout className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      <AnimatePresence>
        {items.map((p) => (
          <m.div layout key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
            <ProductCard product={p} />
          </m.div>
        ))}
      </AnimatePresence>
    </m.div>
  );
}
