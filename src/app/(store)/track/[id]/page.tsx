import type { Metadata } from "next";
import { ExternalLink, MapPin } from "lucide-react";
import { TrackFallback } from "@/components/checkout/order-fallback";
import { OrderTimeline } from "@/components/order-timeline";
import { ProductImage } from "@/components/product-image";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { getOrder } from "@/lib/db";
import { formatDate, money, STATUS_LABEL } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Tracking", robots: { index: false } };

const CARRIER_URL: Record<string, (n: string) => string> = {
  usps: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`,
  ups: (n) => `https://www.ups.com/track?tracknum=${n}`,
  fedex: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}`,
};

export default async function TrackOrderPage({ params }: PageProps<"/track/[id]">) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return <TrackFallback id={id.slice(0, 64)} />;
  const a = order.shippingAddress;
  return (
    <Container className="max-w-4xl py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Order {order.number}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">{STATUS_LABEL[order.status]}</h1>
          <p className="mt-2 text-sm text-muted">Placed {formatDate(order.createdAt)} · {order.shippingLabel}</p>
        </div>
        <Badge tone={order.status === "delivered" ? "green" : "gold"}>{STATUS_LABEL[order.status]}</Badge>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8">
          <OrderTimeline order={order} />
          {order.trackingNumber && order.trackingCarrier && (
            <a href={CARRIER_URL[order.trackingCarrier](order.trackingNumber)} target="_blank" rel="noreferrer" className="mt-8 flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 text-sm">
              <span><span className="block text-xs uppercase tracking-wider text-muted">{order.trackingCarrier.toUpperCase()} tracking</span><span className="font-mono font-semibold">{order.trackingNumber}</span></span>
              <ExternalLink size={16} />
            </a>
          )}
        </section>
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft">
            <p className="mb-3 flex items-center gap-2 font-semibold"><MapPin size={16} className="text-gold-ink" /> Delivering to</p>
            <p className="text-sm text-muted">{a.firstName} {a.lastName}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.zip}</p>
          </div>
          <div className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft">
            <ul className="space-y-3">
              {order.lines.map((l, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-2"><ProductImage src={l.image} alt={l.name} fill sizes="48px" /></span>
                  <span className="min-w-0 flex-1 text-sm"><span className="block truncate font-semibold">{l.name}</span><span className="text-xs text-muted">{l.variantLabel ?? ""} × {l.quantity}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between border-t border-line pt-4 font-display text-xl"><span>Total</span><span className="tabular-nums">{money(order.total)}</span></p>
          </div>
          <ButtonLink href="/contact" variant="outline" className="w-full">Need help with this order?</ButtonLink>
        </aside>
      </div>
    </Container>
  );
}
