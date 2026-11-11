"use client";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stars } from "../ui";
import { toast } from "@/lib/client-store";
import type { Review } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function ReviewsManager({ reviews, names }: { reviews: Review[]; names: Record<string, string> }) {
  const [tab, setTab] = useState<"pending" | "approved" | "hidden">("pending");
  const router = useRouter();
  const list = reviews.filter((r) => r.status === tab);
  const act = async (id: string, method: "PATCH" | "DELETE", status?: string) => {
    const r = await fetch("/api/admin/reviews", { method, headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (r.ok) { toast({ title: method === "DELETE" ? "Review deleted" : status === "approved" ? "Review approved — now live" : "Review hidden" }); router.refresh(); }
  };
  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto" role="tablist">
        {(["pending", "approved", "hidden"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold capitalize", tab === t ? "border-ink bg-ink text-on-ink" : "border-line")}>{t} ({reviews.filter((r) => r.status === t).length})</button>
        ))}
      </div>
      {list.length === 0 ? <div className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">{tab === "pending" ? "All caught up — no reviews waiting for approval." : "Nothing here."}</div> : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((r) => (
            <li key={r.id} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between gap-2"><Stars rating={r.rating} /><span className="text-xs text-muted">{formatDate(r.createdAt)}</span></div>
              <p className="mt-2 font-semibold">{r.title}</p>
              <p className="mt-1 text-sm text-muted">{r.body}</p>
              <p className="mt-3 text-xs text-muted">{r.author} · {r.location} · on <strong className="text-fg">{names[r.productId] ?? "Unknown product"}</strong></p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "approved" && <button onClick={() => act(r.id, "PATCH", "approved")} className="flex min-h-10 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white"><Check size={15} /> Approve</button>}
                {r.status !== "hidden" && <button onClick={() => act(r.id, "PATCH", "hidden")} className="flex min-h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold"><EyeOff size={15} /> Hide</button>}
                <button onClick={() => confirm("Delete this review permanently?") && act(r.id, "DELETE")} className="flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-rose hover:bg-rose/10"><Trash2 size={15} /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
