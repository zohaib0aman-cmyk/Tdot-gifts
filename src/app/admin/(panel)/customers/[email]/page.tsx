import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin } from "lucide-react";
import { PageHeader, Panel } from "@/components/admin/shell";
import { StatusBadge } from "@/components/admin/status";
import { getCustomerByEmail, listOrders } from "@/lib/db";
import { formatDate, money } from "@/lib/utils";

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[email]">) {
  const email = decodeURIComponent((await params).email).toLowerCase();
  const [c, all] = await Promise.all([getCustomerByEmail(email), listOrders()]);
  const orders = all.filter((o) => o.email.toLowerCase() === email);
  if (!c && !orders.length) notFound();
  const name = c ? `${c.firstName} ${c.lastName}` : `${orders[0].shippingAddress.firstName} ${orders[0].shippingAddress.lastName}`;
  const paid = orders.filter((o) => !["pending", "failed", "cancelled"].includes(o.status));
  const spent = paid.reduce((a, o) => a + o.total - (o.refundedAmount ?? 0), 0);
  const addresses = c?.addresses.length ? c.addresses : [...new Map(orders.map((o) => [o.shippingAddress.line1, o.shippingAddress])).values()];
  return (
    <>
      <Link href="/admin/customers" className="mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft size={16} /> Customers</Link>
      <PageHeader title={name} sub={`${c ? "Registered customer" : "Guest"} · ${email}`} actions={<a href={`mailto:${email}`} className="flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold"><Mail size={15} /> Email</a>} />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[["Orders", paid.length.toString()], ["Lifetime value", money(spent)], ["Avg. order", money(paid.length ? spent / paid.length : 0)]].map(([k, v]) => <div key={k} className="rounded-3xl border border-line bg-surface p-4 shadow-soft"><p className="text-xs text-muted">{k}</p><p className="mt-1 font-display text-xl tabular-nums sm:text-2xl">{v}</p></div>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Order history">
          {orders.length === 0 ? <p className="text-sm text-muted">No orders yet.</p> : (
            <ul className="divide-y divide-line">{orders.map((o) => (
              <li key={o.id}><Link href={`/admin/orders/${o.id}`} className="flex min-h-14 items-center gap-3 py-2 hover:opacity-80"><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{o.number}</span><span className="block truncate text-xs text-muted">{formatDate(o.createdAt)} · {o.lines.map((l) => l.name).join(", ")}</span></span><StatusBadge status={o.status} /><span className="w-16 text-right text-sm tabular-nums">{money(o.total)}</span></Link></li>
            ))}</ul>
          )}
        </Panel>
        <Panel title="Addresses">
          <ul className="space-y-3">{addresses.map((a, i) => <li key={i} className="flex gap-2 text-sm"><MapPin size={16} className="mt-0.5 shrink-0 text-gold-ink" /><span>{a.firstName} {a.lastName}<br /><span className="text-muted">{a.line1}, {a.city}, {a.state} {a.zip}</span></span></li>)}</ul>
          {c && <p className="mt-4 text-xs text-muted">Customer since {formatDate(c.createdAt)} · {c.marketing ? "Subscribed to marketing" : "Not subscribed"} · {c.wishlist.length} wishlist items</p>}
        </Panel>
      </div>
    </>
  );
}
