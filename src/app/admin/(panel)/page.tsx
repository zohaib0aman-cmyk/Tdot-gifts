import Link from "next/link";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { BarList, RevenueChart } from "@/components/admin/charts";
import { PageHeader, Panel } from "@/components/admin/shell";
import { StatusBadge } from "@/components/admin/status";
import { ProductImage } from "@/components/product-image";
import { listOrders, listProducts, productStock } from "@/lib/db";
import { isoDate, money, nowMs, STATUS_LABEL } from "@/lib/utils";

const PAID = new Set(["paid", "processing", "shipped", "out_for_delivery", "delivered"]);

export default async function Dashboard() {
  const [orders, products] = await Promise.all([listOrders(), listProducts({ includeInactive: true })]);
  const now = nowMs();
  const DAY = 86_400_000;
  const inRange = (o: { createdAt: string }, from: number, to: number) => { const t = Date.parse(o.createdAt); return t >= now - from * DAY && t < now - to * DAY; };
  const net = (o: (typeof orders)[number]) => o.total + o.giftCardApplied - (o.refundedAmount ?? 0);
  const cur = orders.filter((o) => PAID.has(o.status) && inRange(o, 30, 0));
  const prev = orders.filter((o) => PAID.has(o.status) && inRange(o, 60, 30));
  const rev = cur.reduce((a, o) => a + net(o), 0);
  const prevRev = prev.reduce((a, o) => a + net(o), 0);
  const customers = new Set(cur.map((o) => o.email)).size;
  const prevCustomers = new Set(prev.map((o) => o.email)).size;
  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : a ? 100 : 0);

  const days = Array.from({ length: 30 }, (_, i) => isoDate(new Date(now - (29 - i) * DAY)));
  const series = days.map((d) => { const os = cur.filter((o) => isoDate(new Date(o.createdAt)) === d); return { date: d, revenue: Math.round(os.reduce((a, o) => a + net(o), 0) * 100) / 100, orders: os.length }; });

  const productTotals = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of orders.filter((o) => PAID.has(o.status))) for (const l of o.lines) {
    const t = productTotals.get(l.name) ?? { name: l.name, units: 0, revenue: 0 };
    t.units += l.quantity; t.revenue += l.unitPrice * l.quantity;
    productTotals.set(l.name, t);
  }
  const top = [...productTotals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const statusCounts = ["paid", "processing", "shipped", "out_for_delivery", "delivered", "refunded", "cancelled"].map((s) => ({ label: STATUS_LABEL[s], value: orders.filter((o) => o.status === s).length }));
  const lowStock = products.flatMap((p) => (p.variants?.options.length ? p.variants.options.map((v) => ({ p, label: `${p.name} · ${v.label}`, stock: v.stock })) : [{ p, label: p.name, stock: p.stock }])).filter((x) => x.stock <= 5).sort((a, b) => a.stock - b.stock);

  const kpis = [
    { label: "Revenue (30d)", value: money(rev), delta: pct(rev, prevRev), icon: DollarSign },
    { label: "Orders (30d)", value: cur.length.toString(), delta: pct(cur.length, prev.length), icon: ShoppingCart },
    { label: "Avg. order value", value: money(cur.length ? rev / cur.length : 0), delta: pct(cur.length ? rev / cur.length : 0, prev.length ? prevRev / prev.length : 0), icon: Package },
    { label: "Customers (30d)", value: customers.toString(), delta: pct(customers, prevCustomers), icon: Users },
  ];

  return (
    <>
      <PageHeader title="Dashboard" sub={`Last 30 days · compared with the previous 30 days`} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 [&>*]:min-w-0">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-3xl border border-line bg-surface p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold text-muted sm:text-sm">{k.label}</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-blush text-gold-ink"><k.icon size={17} /></span></div>
            <p className="mt-3 font-display text-2xl tabular-nums sm:text-3xl">{k.value}</p>
            <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${k.delta >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose"}`}>
              {k.delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(k.delta).toFixed(1)}% <span className="font-normal text-muted">vs prior</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <Panel title="Revenue" action={<span className="text-sm text-muted tabular-nums">{money(rev)}</span>}><RevenueChart data={series} /></Panel>
        <Panel title="Orders by status"><BarList rows={statusCounts} /></Panel>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3 [&>*]:min-w-0">
        <Panel title="Top products" className="xl:col-span-1"><BarList rows={top.map((t) => ({ label: t.name, value: Math.round(t.revenue), sub: `${t.units} sold` }))} money /></Panel>
        <Panel title={<span className="flex items-center gap-2"><AlertTriangle size={18} className="text-amber-600" /> Low stock</span>} action={<Link href="/admin/products?stock=low" className="text-sm font-semibold text-gold-ink">Manage</Link>}>
          {lowStock.length === 0 ? <p className="text-sm text-muted">All products are well stocked. 🎉</p> : (
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 7).map((x) => (
                <li key={x.label} className="flex items-center gap-3 py-2.5">
                  <span className="relative h-10 w-9 shrink-0 overflow-hidden rounded-lg bg-surface-2"><ProductImage src={x.p.images[0]} alt="" fill sizes="36px" /></span>
                  <Link href={`/admin/products/${x.p.id}`} className="min-w-0 flex-1 truncate text-sm hover:underline">{x.label}</Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${x.stock === 0 ? "bg-rose/10 text-rose" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>{x.stock === 0 ? "Out" : `${x.stock} left`}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">{products.filter((p) => productStock(p) === 0).length} product(s) fully sold out</p>
        </Panel>
        <Panel title="Recent orders" action={<Link href="/admin/orders" className="text-sm font-semibold text-gold-ink">View all</Link>}>
          <ul className="divide-y divide-line">
            {orders.slice(0, 7).map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex min-h-12 items-center gap-3 py-2 hover:opacity-80">
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{o.number}</span><span className="block truncate text-xs text-muted">{o.shippingAddress.firstName} {o.shippingAddress.lastName} · {o.shippingAddress.city}, {o.shippingAddress.state}</span></span>
                  <StatusBadge status={o.status} />
                  <span className="w-16 text-right text-sm tabular-nums">{money(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
