"use client";
import { AnimatePresence, m } from "framer-motion";
import { Check, Mail, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Panel } from "./shell";
import type { ContactMessage, EmailLog } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function Inbox({ messages, emails, resend }: { messages: ContactMessage[]; emails: EmailLog[]; resend: boolean }) {
  const router = useRouter();
  const [preview, setPreview] = useState<EmailLog | null>(null);
  const toggle = async (m: ContactMessage) => { await fetch("/api/admin/messages", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: m.id, handled: !m.handled }) }); router.refresh(); };
  return (
    <div className="grid gap-4 xl:grid-cols-2 [&>*]:min-w-0">
      <Panel title="Contact messages">
        {messages.length === 0 ? <p className="text-sm text-muted">No messages yet. Submissions from the Contact page appear here.</p> : (
          <ul className="space-y-3">{messages.map((m) => (
            <li key={m.id} className={cn("rounded-2xl border p-4", m.handled ? "border-line opacity-70" : "border-gold/50 bg-blush/30")}>
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{m.name} <span className="font-normal text-muted">· {m.topic}</span></p><span className="text-xs text-muted">{formatDate(m.createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span></div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
              <div className="mt-3 flex flex-wrap gap-2"><a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.topic)}`} className="flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-on-ink"><Mail size={14} /> Reply</a><button onClick={() => toggle(m)} className="flex min-h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold"><Check size={14} /> {m.handled ? "Mark unread" : "Mark handled"}</button>{m.phone && <span className="self-center text-xs text-muted">{m.phone}</span>}</div>
            </li>
          ))}</ul>
        )}
      </Panel>
      <Panel title="Sent emails" action={<span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", resend ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300")}>{resend ? "Sending via Resend" : "Logged (add RESEND_API_KEY to send)"}</span>}>
        {emails.length === 0 ? <p className="text-sm text-muted">Order confirmations, shipping and gift-card emails will appear here.</p> : (
          <ul className="divide-y divide-line">{emails.slice(0, 40).map((e) => (
            <li key={e.id}><button onClick={() => setPreview(e)} className="flex min-h-14 w-full items-center gap-3 py-2 text-left hover:opacity-80"><Mail size={16} className="shrink-0 text-gold-ink" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{e.subject}</span><span className="block truncate text-xs text-muted">To {e.to} · {formatDate(e.createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span></span><span className="text-xs capitalize text-muted">{e.status}</span></button></li>
          ))}</ul>
        )}
      </Panel>
      <AnimatePresence>
        {preview && (
          <>
            <m.div className="fixed inset-0 z-50 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreview(null)} />
            <m.div role="dialog" aria-modal="true" aria-label="Email preview" className="fixed inset-x-2 bottom-2 top-10 z-50 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-surface shadow-lift" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
              <div className="flex items-center justify-between gap-3 border-b border-line p-4"><p className="truncate text-sm font-semibold">{preview.subject}</p><button onClick={() => setPreview(null)} aria-label="Close preview" className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-surface-2"><X size={18} /></button></div>
              <iframe title="Email preview" srcDoc={preview.html} sandbox="" className="h-full w-full bg-white" />
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
