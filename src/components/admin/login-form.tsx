"use client";
import { m } from "framer-motion";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoBadge } from "../brand";
import { Button, Field, Input } from "../ui";

export function AdminLoginForm({ next, demo }: { next: string; demo: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error ?? "Sign in failed"); setBusy(false); return; }
    router.push(next); router.refresh();
  };
  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#140e0f] px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,161,74,.25),transparent_60%)]" />
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md rounded-[2rem] border border-line bg-surface p-7 shadow-lift sm:p-9">
        <div className="flex flex-col items-center text-center">
          <LogoBadge src="/brand/logo-badge.png" size={72} priority />
          <h1 className="mt-4 text-3xl">Store admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage orders, products and your storefront.</p>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field label="Email" htmlFor="ad-email"><Input id="ad-email" name="email" type="email" required autoComplete="username" defaultValue={demo ? "admin@giftsandsurprises.us" : ""} /></Field>
          <Field label="Password" htmlFor="ad-pw"><Input id="ad-pw" name="password" type="password" required autoComplete="current-password" /></Field>
          {err && <m.p role="alert" animate={{ x: [0, -8, 8, -4, 0] }} className="text-sm text-rose">{err}</m.p>}
          <Button type="submit" size="lg" className="w-full" loading={busy}><Lock size={16} /> Sign in</Button>
        </form>
        {demo && <p className="mt-5 rounded-2xl bg-amber-500/10 p-3 text-center text-xs text-amber-800 dark:text-amber-300">Demo credentials: <strong>admin@giftsandsurprises.us</strong> / <strong>Surprise2026!</strong><br />Set ADMIN_EMAIL and ADMIN_PASSWORD to change them.</p>}
      </m.div>
    </main>
  );
}
