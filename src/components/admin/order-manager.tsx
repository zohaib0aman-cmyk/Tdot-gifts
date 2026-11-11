"use client";
import { AnimatePresence, m } from "framer-motion";
import { Printer, RotateCcw, Save, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Panel } from "./shell";
import { StatusBadge } from "./status";
import { OrderTimeline } from "../order-timeline";
import { Button, Checkbox, Field, Input, Select, Textarea } from "../ui";
import { toast } from "@/lib/client-store";
import type { Order } from "@/lib/types";
import { money, round2, STATUS_LABEL } from "@/lib/utils";

const FLOW = ["paid", "processing", "shipped", "out_for_delivery", "delivered"] as const;

export function OrderManager({ order: initial }: { order: Order }) {
  const [order, setOrder] = useState(initial);
  const [status, setStatus] = useState<string>(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [carrier, setCarrier] = useState(order.trackingCarrier ?? (order.shippingRateId.startsWith("ups") ? "ups" : order.shippingRateId.startsWith("fedex") ? "fedex" : "usps"));
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const refundable = round2(order.total - (order.refundedAmount ?? 0));
  const [refundAmt, setRefundAmt] = useState(refundable.toFixed(2));
  const [refundReason, setRefundReason] = useState("");
  const router = useRouter();

  const save = async () => {
    setBusy(true);
    const r = await fetch("/api/admin/orders", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: order.id, status, trackingNumber: tracking, trackingCarrier: carrier, note: note || undefined, notify }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return toast({ title: "Couldn't update order", description: j.error, tone: "error" });
    setOrder(j.order); setNote("");
    toast({ title: "Order updated", description: status === "shipped" && notify && initial.status !== "shipped" ? "Shipping email sent to customer" : STATUS_LABEL[status] });
    router.refresh();
  };
  const refund = async () => {
    setBusy(true);
    const r = await fetch("/api/admin/orders/refund", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: order.id, amount: Number(refundAmt), reason: refundReason || undefined }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return toast({ title: "Refund failed", description: j.error, tone: "error" });
    setOrder(j.order); setStatus(j.order.status); setRefundOpen(false);
    toast({ title: `Refunded ${money(Number(refundAmt))}`, description: "Customer notified by email" });
    router.refresh();
  };
  const a = order.shippingAddress;
  const nextStep = FLOW[FLOW.indexOf(order.status as (typeof FLOW)[number]) + 1];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
      <div className="space-y-4">
        <Panel title="Items" action={<StatusBadge status={order.status} />}>
          <ul className="divide-y divide-line">
            {order.lines.map((l, i) => (
              <li key={i} className="flex gap-3 py-3 first:pt-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt="" className="h-16 w-14 shrink-0 rounded-xl bg-surface-2 object-cover" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-muted">{[l.variantLabel, `Qty ${l.quantity}`, l.giftWrap && "🎁 Gift wrap"].filter(Boolean).join(" · ")}</p>
                  {l.giftMessage && <p className="mt-1 rounded-xl bg-blush px-3 py-2 text-xs italic">Card: “{l.giftMessage}”</p>}
                  {l.giftCard && <p className="mt-1 text-xs text-muted">Gift card to {l.giftCard.recipientName} &lt;{l.giftCard.recipientEmail}&gt;</p>}
                </div>
                <span className="text-sm font-semibold tabular-nums">{money(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            {[["Subtotal", money(order.subtotal)], order.discount ? [`Discount (${order.promoCode})`, `−${money(order.discount)}`] : null, order.giftWrapTotal ? ["Gift wrap", money(order.giftWrapTotal)] : null, [`Shipping · ${order.shippingLabel}`, order.shipping ? money(order.shipping) : "Free"], [`Tax (${a.state})`, money(order.tax)], order.giftCardApplied ? [`Gift card ${order.giftCardCode}`, `−${money(order.giftCardApplied)}`] : null].filter(Boolean).map((r) => (
              <div key={r![0]} className="flex justify-between gap-3"><dt className="text-muted">{r![0]}</dt><dd className="tabular-nums">{r![1]}</dd></div>
            ))}
            <div className="flex justify-between border-t border-line pt-2 font-display text-xl"><dt>Total</dt><dd className="tabular-nums">{money(order.total)}</dd></div>
            {order.refundedAmount ? <div className="flex justify-between text-rose"><dt>Refunded</dt><dd className="tabular-nums">−{money(order.refundedAmount)}</dd></div> : null}
          </dl>
        </Panel>
        <Panel title="Timeline"><OrderTimeline order={order} />
          {order.events.some((e) => e.status === "note") && (
            <ul className="mt-6 space-y-2 border-t border-line pt-4">
              {order.events.filter((e) => e.status === "note").map((e, i) => <li key={i} className="rounded-xl bg-surface-2 px-3 py-2 text-sm"><span className="text-xs text-muted">{new Date(e.at).toLocaleString()}</span><br />{e.message}</li>)}
            </ul>
          )}
        </Panel>
      </div>
      <div className="space-y-4">
        <Panel title="Fulfilment">
          {nextStep && <Button variant="gold" className="mb-4 w-full" onClick={() => setStatus(nextStep)}>Next step: mark as {STATUS_LABEL[nextStep]}</Button>}
          <div className="space-y-4">
            <Field label="Status" htmlFor="o-status"><Select id="o-status" value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <Field label="Carrier" htmlFor="o-car"><Select id="o-car" value={carrier} onChange={(e) => setCarrier(e.target.value as "usps")}><option value="usps">USPS</option><option value="ups">UPS</option><option value="fedex">FedEx</option></Select></Field>
              <Field label="Tracking number" htmlFor="o-trk"><Input id="o-trk" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="9400 1000 0000…" className="font-mono" /></Field>
            </div>
            <Field label="Internal note / timeline message" htmlFor="o-note"><Textarea id="o-note" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20" placeholder="e.g. Delivered to front desk, photo sent to customer" /></Field>
            <Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)} label="Email the customer when marked shipped" />
            <Button className="w-full" loading={busy} onClick={save}><Save size={16} /> Save changes</Button>
          </div>
        </Panel>
        <Panel title="Customer">
          <p className="text-sm"><Link href={`/admin/customers/${encodeURIComponent(order.email)}`} className="font-semibold hover:underline">{a.firstName} {a.lastName}</Link><br /><a href={`mailto:${order.email}`} className="text-muted hover:underline">{order.email}</a>{a.phone && <><br /><span className="text-muted">{a.phone}</span></>}</p>
          <p className="mt-3 text-sm text-muted"><Truck size={14} className="mr-1 inline text-gold-ink" />{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.zip}</p>
          {order.deliveryDate && <p className="mt-2 text-sm">Requested delivery: <strong>{order.deliveryDate}</strong></p>}
          <p className="mt-2 text-sm capitalize text-muted">Paid with {order.paymentMethod.replace("_", " ")}{order.paymentIntentId ? ` · ${order.paymentIntentId.slice(0, 18)}…` : ""}</p>
        </Panel>
        <Panel title="Actions">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Link href={`/admin/invoice/${order.id}`} target="_blank" className="flex h-12 items-center justify-center gap-2 rounded-full border border-line font-semibold hover:border-gold"><Printer size={16} /> Print invoice</Link>
            <Button variant="outline" disabled={refundable <= 0 || order.status === "pending"} onClick={() => setRefundOpen((v) => !v)} className="text-rose"><RotateCcw size={16} /> Refund</Button>
          </div>
          <AnimatePresence>
            {refundOpen && (
              <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 space-y-3 rounded-2xl border border-rose/30 bg-rose/5 p-4">
                  <Field label={`Amount (max ${money(refundable)})`} htmlFor="o-ref"><Input id="o-ref" inputMode="decimal" value={refundAmt} onChange={(e) => setRefundAmt(e.target.value.replace(/[^\d.]/g, ""))} /></Field>
                  <Field label="Reason (optional)" htmlFor="o-rr"><Input id="o-rr" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Damaged in transit" /></Field>
                  <Button variant="danger" className="w-full" loading={busy} disabled={!Number(refundAmt) || Number(refundAmt) > refundable} onClick={refund}>Refund {money(Number(refundAmt) || 0)}</Button>
                  <p className="text-xs text-muted">Refunds go back to the original payment method via Stripe or PayPal (test mode).</p>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </Panel>
      </div>
    </div>
  );
}
