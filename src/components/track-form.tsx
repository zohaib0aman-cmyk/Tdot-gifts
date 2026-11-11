"use client";
import { m } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "./ui";

export function TrackForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setErr("");
    const r = await fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ number: String(fd.get("number")).toUpperCase(), email: fd.get("email") }) });
    const j = await r.json();
    if (r.ok) router.push(`/track/${j.id}`);
    else { setErr(j.error ?? "Order not found"); setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mt-10 space-y-4 rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8">
      <Field label="Order number" htmlFor="t-num"><Input id="t-num" name="number" required placeholder="GS-10234" autoComplete="off" className="uppercase placeholder:normal-case" /></Field>
      <Field label="Email" htmlFor="t-email"><Input id="t-email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></Field>
      {err && <m.p role="alert" initial={{ x: 0 }} animate={{ x: [0, -8, 8, -4, 0] }} className="text-sm text-rose">{err}</m.p>}
      <Button type="submit" size="lg" loading={busy} className="w-full"><Search size={17} /> Track order</Button>
    </form>
  );
}
