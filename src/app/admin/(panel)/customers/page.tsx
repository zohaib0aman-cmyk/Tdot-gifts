import Link from "next/link";
import { PageHeader } from "@/components/admin/shell";
import { CustomerSearch } from "@/components/admin/customer-search";
import { listCustomers, listOrders, listSubscribers } from "@/lib/db";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const [customers, orders, subs] = await Promise.all([listCustomers(), listOrders(), listSubscribers()]);
  const map = new Map<string, { email: string; name: string; orders: number; spent: number; last: string; account: boolean; location: string }>();
  for (const c of customers) map.set(c.email, { email: c.email, name: `${c.firstName} ${c.lastName}`.trim(), orders: 0, spent: 0, last: c.createdAt, account: !!c.passwordHash || true, location: c.addresses[0] ? `${c.addresses[0].city}, ${c.addresses[0].state}` : "" });
  for (const o of orders) {
    const e = map.get(o.email) ?? { email: o.email, name: `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`, orders: 0, spent: 0, last: o.createdAt, account: false, location: `${o.shippingAddress.city}, ${o.shippingAddress.state}` };
    if (!["pending", "failed", "cancelled"].includes(o.status)) { e.orders++; e.spent += o.total - (o.refundedAmount ?? 0); }
    if (o.createdAt > e.last) e.last = o.createdAt;
    map.set(o.email, e);
  }
  const rows = [...map.values()].sort((a, b) => b.spent - a.spent);
  return (
    <>
      <PageHeader title="Customers" sub={`${rows.length} customers · ${subs.length} newsletter subscribers`} />
      <CustomerSearch rows={rows} />
      <p className="mt-4 text-xs text-muted">Guest checkouts are grouped by email. <Link href="/admin/orders" className="underline">See all orders</Link>.</p>
    </>
  );
}
