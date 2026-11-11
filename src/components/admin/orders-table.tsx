"use client";
import { Download, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "./status";
import { Input, Select } from "../ui";
import { toCsv } from "@/lib/csv";
import type { Order } from "@/lib/types";
import { formatDate, money, nowMs, STATUS_LABEL } from "@/lib/utils";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const days = range === "all" ? Infinity : Number(range);
    return orders.filter((o) =>
      (status === "all" || o.status === status) &&
      nowMs() - Date.parse(o.createdAt) <= days * 86_400_000 &&
      (!t || `${o.number} ${o.email} ${o.shippingAddress.firstName} ${o.shippingAddress.lastName} ${o.shippingAddress.city}`.toLowerCase().includes(t)));
  }, [orders, q, status, range]);
  const exportCsv = () => {
    const csv = toCsv(list.map((o) => ({ number: o.number, date: o.createdAt, email: o.email, name: `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`, state: o.shippingAddress.state, status: o.status, items: o.lines.reduce((a, l) => a + l.quantity, 0), subtotal: o.subtotal, discount: o.discount, shipping: o.shipping, tax: o.tax, total: o.total, refunded: o.refundedAmount ?? 0 })));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };
  return (
    <div>
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, customer, email, city…" className="pl-10" aria-label="Search orders" /></div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="sm:w-48"><option value="all">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
        <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range" className="sm:w-40"><option value="all">All time</option><option value="1">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></Select>
        <button onClick={exportCsv} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 text-sm font-semibold hover:border-gold"><Download size={16} /> Export</button>
      </div>
      <p className="mb-3 text-sm text-muted">{list.length} order{list.length === 1 ? "" : "s"}</p>
      {/* mobile cards */}
      <ul className="space-y-2 md:hidden">
        {list.map((o) => (
          <li key={o.id}>
            <Link href={`/admin/orders/${o.id}`} className="block rounded-2xl border border-line bg-surface p-4 shadow-soft active:scale-[0.99]">
              <div className="flex items-center justify-between gap-2"><span className="font-semibold">{o.number}</span><StatusBadge status={o.status} /></div>
              <p className="mt-1 text-sm">{o.shippingAddress.firstName} {o.shippingAddress.lastName} <span className="text-muted">· {o.shippingAddress.city}, {o.shippingAddress.state}</span></p>
              <div className="mt-2 flex justify-between text-sm text-muted"><span>{formatDate(o.createdAt)} · {o.lines.reduce((a, l) => a + l.quantity, 0)} items</span><span className="font-semibold text-fg tabular-nums">{money(o.total)}</span></div>
            </Link>
          </li>
        ))}
      </ul>
      {/* desktop table */}
      <div className="hidden overflow-hidden rounded-3xl border border-line bg-surface shadow-soft md:block">
        <table className="w-full text-sm">
          <thead className="bg-surface-2/60 text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-5 py-3 font-semibold">Order</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Customer</th><th className="px-3 py-3 font-semibold">Ship to</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Payment</th><th className="px-5 py-3 text-right font-semibold">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((o) => (
              <tr key={o.id} className="group cursor-pointer hover:bg-surface-2/50">
                <td className="px-5 py-3 font-semibold"><Link href={`/admin/orders/${o.id}`} className="hover:underline">{o.number}</Link></td>
                <td className="px-3 py-3 text-muted">{formatDate(o.createdAt)}</td>
                <td className="px-3 py-3"><span className="block">{o.shippingAddress.firstName} {o.shippingAddress.lastName}</span><span className="text-xs text-muted">{o.email}</span></td>
                <td className="px-3 py-3 text-muted">{o.shippingAddress.city}, {o.shippingAddress.state}</td>
                <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-3 py-3 capitalize text-muted">{o.paymentMethod.replace("_", " ")}</td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{money(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <div className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">No orders match these filters.</div>}
    </div>
  );
}
