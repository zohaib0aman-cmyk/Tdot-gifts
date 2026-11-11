"use client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "../ui";
import { formatDate, money } from "@/lib/utils";

type Row = { email: string; name: string; orders: number; spent: number; last: string; account: boolean; location: string };
export function CustomerSearch({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const list = rows.filter((r) => !q || `${r.name} ${r.email} ${r.location}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="relative mb-4"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="pl-10" aria-label="Search customers" /></div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <li key={r.email}>
            <Link href={`/admin/customers/${encodeURIComponent(r.email)}`} className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 shadow-soft transition hover:border-gold">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush font-display text-lg">{r.name.charAt(0) || "?"}</span>
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{r.name || r.email}</span><span className="block truncate text-xs text-muted">{r.email}{r.location ? ` · ${r.location}` : ""}</span><span className="block text-xs text-muted">Last activity {formatDate(r.last)}</span></span>
              <span className="text-right"><span className="block font-semibold tabular-nums">{money(r.spent)}</span><span className="text-xs text-muted">{r.orders} orders</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
