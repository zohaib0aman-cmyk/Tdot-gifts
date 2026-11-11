"use client";
import { AnimatePresence, m } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";
import { DrawCheck } from "./icons";
import { Button, Field, Input, Select, Textarea } from "./ui";

const TOPICS = ["Custom surprise request", "Order question", "Corporate gifting", "Partnership", "Other"];

export function ContactForm() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("busy"); setErr("");
    const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) });
    const j = await r.json();
    if (r.ok) setState("done"); else { setErr(j.error ?? "Could not send"); setState("idle"); }
  };
  return (
    <div className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8">
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <m.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 text-center">
            <DrawCheck size={96} />
            <h2 className="mt-5 font-display text-3xl">Message received!</h2>
            <p className="mt-2 max-w-sm text-muted">A surprise planner will get back to you within a few hours (usually much sooner).</p>
            <Button variant="outline" className="mt-6" onClick={() => setState("idle")}>Send another message</Button>
          </m.div>
        ) : (
          <m.form key="f" onSubmit={submit} exit={{ opacity: 0 }} className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" htmlFor="c-name"><Input id="c-name" name="name" required autoComplete="name" /></Field>
            <Field label="Email" htmlFor="c-email"><Input id="c-email" name="email" type="email" required autoComplete="email" /></Field>
            <Field label="Phone / WhatsApp (optional)" htmlFor="c-phone"><Input id="c-phone" name="phone" type="tel" autoComplete="tel" /></Field>
            <Field label="Topic" htmlFor="c-topic"><Select id="c-topic" name="topic" defaultValue={TOPICS[0]}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="How can we help?" htmlFor="c-msg" className="sm:col-span-2"><Textarea id="c-msg" name="message" required minLength={10} className="min-h-40" placeholder="Tell us who you're surprising, the date, city and your budget — we'll design something unforgettable." /></Field>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            {err && <p role="alert" className="text-sm text-rose sm:col-span-2">{err}</p>}
            <div className="sm:col-span-2"><Button type="submit" size="lg" loading={state === "busy"} className="w-full sm:w-auto"><Send size={16} /> Send message</Button></div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}
