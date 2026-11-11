"use client";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { DrawCheck } from "../icons";
import { Reveal } from "../motion";
import { ProductCard } from "../product-card";
import { Button, Container, Input } from "../ui";
import { OCCASIONS, RECIPIENTS } from "@/data/catalog";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ gift finder quiz */
type QuizKey = "recipient" | "occasion" | "budget" | "vibe";
const QUIZ: { key: QuizKey; q: string; options: { v: string; label: string; emoji: string }[] }[] = [
  { key: "recipient", q: "Who's the lucky one?", options: RECIPIENTS.slice(0, 6).map((r) => ({ v: r.slug, label: r.name.replace("For ", ""), emoji: r.emoji ?? "🎁" })) },
  { key: "occasion", q: "What are we celebrating?", options: OCCASIONS.slice(0, 6).map((o) => ({ v: o.slug, label: o.name, emoji: o.emoji ?? "✨" })).concat({ v: "just-because", label: "Just because", emoji: "✨" }) },
  { key: "budget", q: "What's your budget?", options: [{ v: "0-60", label: "Under $60", emoji: "💌" }, { v: "60-130", label: "$60 – $130", emoji: "🎁" }, { v: "130-250", label: "$130 – $250", emoji: "💝" }, { v: "250-9999", label: "Go all out", emoji: "👑" }] },
  { key: "vibe", q: "Pick a vibe", options: [{ v: "flowers", label: "Romantic blooms", emoji: "🌹" }, { v: "cakes-sweets", label: "Sweet treats", emoji: "🍰" }, { v: "teddy-balloons", label: "Cute & cuddly", emoji: "🧸" }, { v: "surprise-packages", label: "Big wow moment", emoji: "🎉" }, { v: "personalized", label: "Personal keepsake", emoji: "💎" }, { v: "gift-boxes", label: "Pamper & treat", emoji: "🧺" }] },
];

function scoreProducts(products: Product[], a: Partial<Record<QuizKey, string>>) {
  const [lo, hi] = (a.budget ?? "0-9999").split("-").map(Number);
  return products
    .map((p) => {
      let s = 0;
      if (a.recipient && p.recipients.includes(a.recipient)) s += 3;
      if (a.occasion && p.occasions.includes(a.occasion)) s += 3;
      if (a.vibe && p.category === a.vibe) s += 4;
      const price = p.variants?.options.length ? Math.min(...p.variants.options.map((o) => o.price)) : p.price;
      if (price >= lo && price <= hi) s += 3; else s -= 2;
      s += p.rating / 5;
      return { p, s };
    })
    .sort((x, y) => y.s - x.s)
    .slice(0, 3)
    .map((x) => x.p);
}

export function GiftFinderQuiz({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuizKey, string>>>({});
  const done = step >= QUIZ.length;
  const results = useMemo(() => (done ? scoreProducts(products, answers) : []), [done, products, answers]);
  const pick = (k: QuizKey, v: string) => { setAnswers((a) => ({ ...a, [k]: v })); setTimeout(() => setStep((s) => s + 1), 220); };
  const reset = () => { setAnswers({}); setStep(0); };
  return (
    <section id="gift-finder" className="scroll-mt-24 py-16 sm:py-24" aria-labelledby="quiz-h">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-surface p-6 shadow-soft sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blush blur-3xl" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink"><Sparkles size={14} /> Gift finder</p>
              <h2 id="quiz-h" className="text-4xl leading-tight sm:text-5xl">Not sure what to send?</h2>
              <p className="mt-4 text-muted">Answer four quick questions and our gift concierge will hand-pick three perfect surprises.</p>
              <div className="mt-8 flex gap-2" aria-hidden>
                {QUIZ.map((q, i) => (
                  <m.span key={q.key} className="h-1.5 flex-1 rounded-full bg-surface-2" animate={{ backgroundColor: i < step ? "var(--gold)" : i === step ? "color-mix(in oklab, var(--gold) 45%, transparent)" : "var(--surface-2)" }} />
                ))}
              </div>
              <p className="mt-3 text-sm text-muted" aria-live="polite">{done ? "Your matches are ready ✨" : `Question ${step + 1} of ${QUIZ.length}`}</p>
            </div>
            <div className="min-h-[340px]">
              <AnimatePresence mode="wait">
                {!done ? (
                  <m.fieldset key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                    <legend className="mb-5 font-display text-2xl sm:text-3xl">{QUIZ[step].q}</legend>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {QUIZ[step].options.map((o, i) => {
                        const sel = answers[QUIZ[step].key] === o.v;
                        return (
                          <m.button key={o.v} type="button" onClick={() => pick(QUIZ[step].key, o.v)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileTap={{ scale: 0.95 }}
                            className={cn("flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center text-sm font-semibold transition", sel ? "border-gold bg-blush" : "border-line bg-bg hover:-translate-y-0.5 hover:border-gold hover:shadow-soft")}>
                            <span className="text-2xl" aria-hidden>{o.emoji}</span>{o.label}
                          </m.button>
                        );
                      })}
                    </div>
                    {step > 0 && <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft size={15} /> Back</button>}
                  </m.fieldset>
                ) : (
                  <m.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h3 className="font-display text-2xl sm:text-3xl">We think they&apos;ll love…</h3>
                      <button onClick={reset} className="min-h-11 shrink-0 text-sm font-semibold text-gold-ink underline-offset-4 hover:underline">Start over</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 [&>*:nth-child(3)]:hidden sm:[&>*:nth-child(3)]:block">
                      {results.map((p, i) => (
                        <m.div key={p.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.12 }}>
                          <ProductCard product={p} />
                        </m.div>
                      ))}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ newsletter */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setState("done");
      setMsg(j.already ? "You're already on the list — thank you!" : "Check your inbox for 10% off: WELCOME10");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error && err.message ? err.message : "Please enter a valid email.");
    }
  };
  return (
    <section className="py-16 sm:py-24" aria-labelledby="nl-h">
      <Container>
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-blush px-6 py-14 text-center sm:px-16 sm:py-20">
          <div className="paper pointer-events-none absolute inset-0 opacity-50" aria-hidden />
          <m.span className="absolute left-[8%] top-[18%] text-3xl" animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} aria-hidden>🎀</m.span>
          <m.span className="absolute bottom-[16%] right-[10%] text-3xl" animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden>🌹</m.span>
          <div className="relative mx-auto max-w-xl">
            <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">The Surprise List</p>
            <h2 id="nl-h" className="text-4xl leading-tight sm:text-5xl">10% off your first surprise</h2>
            <p className="mt-4 text-muted">Early access to holiday collections, occasion reminders and members-only offers. No spam, ever.</p>
            <AnimatePresence mode="wait">
              {state === "done" ? (
                <m.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 flex flex-col items-center gap-3">
                  <DrawCheck size={72} />
                  <p className="font-semibold">{msg}</p>
                </m.div>
              ) : (
                <m.form key="form" onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" exit={{ opacity: 0, y: -10 }}>
                  <label htmlFor="nl-email" className="sr-only">Email address</label>
                  <Input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-14 rounded-full bg-surface px-6" autoComplete="email" />
                  <Button type="submit" size="lg" loading={state === "loading"} className="shrink-0"><Send size={16} /> Subscribe</Button>
                </m.form>
              )}
            </AnimatePresence>
            {state === "error" && <p role="alert" className="mt-3 text-sm text-rose">{msg}</p>}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
