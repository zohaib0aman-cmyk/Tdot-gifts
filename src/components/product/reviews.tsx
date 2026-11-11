"use client";
import { AnimatePresence, m } from "framer-motion";
import { BadgeCheck, PenLine, Star } from "lucide-react";
import { useState } from "react";
import { DrawCheck } from "../icons";
import { Button, Field, Input, Stars, Textarea } from "../ui";
import type { Review } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("loading");
    setError("");
    const r = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId, rating, author: fd.get("author"), location: fd.get("location"), title: fd.get("title"), body: fd.get("body") }) });
    const j = await r.json();
    if (!r.ok) { setError(j.error ?? "Could not submit review"); setState("idle"); return; }
    setState("done");
    setTimeout(onDone, 2600);
  };
  if (state === "done")
    return (
      <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center rounded-3xl bg-surface-2 p-8 text-center">
        <DrawCheck size={72} />
        <p className="mt-3 font-display text-xl">Thank you for your review!</p>
        <p className="text-sm text-muted">It will appear once our team has approved it.</p>
      </m.div>
    );
  return (
    <m.form onSubmit={submit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="grid gap-4 rounded-3xl border border-line bg-surface p-5 sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2">
          <p className="mb-2 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted">Your rating</p>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <m.button whileTap={{ scale: 0.8 }} key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="grid h-11 w-11 place-items-center">
                <Star size={28} className={cn("transition", (hover || rating) >= n ? "text-gold" : "text-line")} fill="currentColor" strokeWidth={0} />
              </m.button>
            ))}
          </div>
        </div>
        <Field label="Name" htmlFor="rv-author"><Input id="rv-author" name="author" required maxLength={60} placeholder="Jasmine R." /></Field>
        <Field label="City, State" htmlFor="rv-loc"><Input id="rv-loc" name="location" maxLength={60} placeholder="Atlanta, GA" /></Field>
        <Field label="Headline" htmlFor="rv-title" className="sm:col-span-2"><Input id="rv-title" name="title" required maxLength={80} placeholder="She cried happy tears" /></Field>
        <Field label="Your review" htmlFor="rv-body" className="sm:col-span-2"><Textarea id="rv-body" name="body" required minLength={10} maxLength={1200} placeholder="Tell others about the quality, delivery and reaction…" /></Field>
        {error && <p className="text-sm text-rose sm:col-span-2" role="alert">{error}</p>}
        <div className="sm:col-span-2"><Button type="submit" loading={state === "loading"}>Submit review</Button></div>
      </div>
    </m.form>
  );
}

export function ReviewsBlock({ productId, reviews }: { productId: string; reviews: Review[] }) {
  const [writing, setWriting] = useState(false);
  const [shown, setShown] = useState(4);
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, reviews.length);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));
  return (
    <section id="reviews" className="scroll-mt-24 py-16" aria-labelledby="reviews-h">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div className="space-y-5">
          <h2 id="reviews-h" className="text-4xl">Reviews</h2>
          <div className="flex items-end gap-3">
            <span className="font-display text-6xl leading-none">{reviews.length ? avg.toFixed(1) : "—"}</span>
            <div className="pb-1"><Stars rating={avg} size={18} /><p className="mt-1 text-sm text-muted">{reviews.length} verified reviews</p></div>
          </div>
          <ul className="space-y-2">
            {dist.map(({ n, c }) => (
              <li key={n} className="flex items-center gap-3 text-sm">
                <span className="w-8 tabular-nums text-muted">{n} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><m.span className="gold-bg block h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${reviews.length ? (c / reviews.length) * 100 : 0}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} /></span>
                <span className="w-6 text-right tabular-nums text-muted">{c}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={() => setWriting((w) => !w)} className="w-full"><PenLine size={16} /> {writing ? "Cancel" : "Write a review"}</Button>
        </div>
        <div className="space-y-4">
          <AnimatePresence>{writing && <ReviewForm productId={productId} onDone={() => setWriting(false)} />}</AnimatePresence>
          {reviews.length === 0 && !writing && (
            <div className="rounded-3xl border border-dashed border-line p-10 text-center">
              <p className="font-display text-xl">Be the first to review this gift</p>
              <p className="mt-1 text-sm text-muted">Share how your surprise went — it helps others choose.</p>
            </div>
          )}
          <ul className="space-y-4">
            {reviews.slice(0, shown).map((r, i) => (
              <m.li key={r.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.06 }} className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars rating={r.rating} />
                  <time className="text-xs text-muted" dateTime={r.createdAt}>{formatDate(r.createdAt)}</time>
                </div>
                <p className="mt-3 font-display text-lg">{r.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.body}</p>
                <p className="mt-4 flex flex-wrap items-center gap-x-2 text-sm"><strong>{r.author}</strong><span className="text-muted">· {r.location}</span>{r.verified && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><BadgeCheck size={14} /> Verified buyer</span>}</p>
              </m.li>
            ))}
          </ul>
          {shown < reviews.length && <Button variant="soft" onClick={() => setShown((s) => s + 4)} className="w-full">Show more reviews</Button>}
        </div>
      </div>
    </section>
  );
}
