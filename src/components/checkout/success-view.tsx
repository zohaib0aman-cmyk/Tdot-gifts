import Link from "next/link";
import { CalendarHeart, Mail, MapPin, Package, Video } from "lucide-react";
import { ClearCart, ConfettiRain } from "./result";
import { DrawCheck } from "../icons";
import { ProductImage } from "../product-image";
import { ButtonLink, Container } from "../ui";
import type { Order } from "@/lib/types";
import { money } from "@/lib/utils";

/** Presentational order-confirmation screen (used by the server page and the client fallback). */
export function SuccessView({ order }: { order: Order }) {
  const processing = order.status === "pending";
  const a = order.shippingAddress;

  return (
    <div className="relative overflow-hidden">
      {!processing && <ClearCart />}
      {!processing && <ConfettiRain />}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--gold)_25%,transparent),transparent_70%)]" aria-hidden />
      <Container className="relative max-w-3xl py-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <DrawCheck size={112} />
          <p className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">{processing ? "Payment processing" : "Order confirmed"}</p>
          <h1 className="mt-3 text-4xl sm:text-6xl">{processing ? "Almost there…" : <>Your surprise is <em className="gold-text">in motion!</em></>}</h1>
          <p className="mt-4 max-w-lg text-muted">
            {processing ? "Your bank is confirming the payment. We'll email you the moment it's complete." : <>Thank you, {a.firstName}! We&apos;ve sent a confirmation to <strong className="text-fg">{order.email}</strong>. Our team is already preparing something beautiful.</>}
          </p>
          <p className="mt-6 rounded-full border border-line bg-surface px-5 py-2.5 text-sm">Order <strong className="tabular-nums">{order.number}</strong></p>
        </div>

        <ol className="mt-12 grid gap-3 sm:grid-cols-4">
          {[
            { icon: Mail, t: "Confirmation sent", d: "Check your inbox" },
            { icon: Package, t: "Hand-prepared", d: "By our florists & stylists" },
            { icon: MapPin, t: "Out for delivery", d: "Tracking emailed" },
            { icon: Video, t: "Delivered with love", d: "Photo sent to you" },
          ].map((s, i) => (
            <li key={s.t} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-col sm:text-center">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${i === 0 ? "bg-gold text-[#2a1d06]" : "bg-surface-2 text-gold-ink"}`}><s.icon size={19} /></span>
              <span><span className="block text-sm font-semibold">{s.t}</span><span className="block text-xs text-muted">{s.d}</span></span>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-[2rem] border border-line bg-surface p-5 shadow-soft sm:p-8">
          <ul className="divide-y divide-line">
            {order.lines.map((l, i) => (
              <li key={i} className="flex items-center gap-4 py-4 first:pt-0">
                <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2"><ProductImage src={l.image} alt={l.name} fill sizes="64px" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg leading-snug">{l.name}</p>
                  <p className="text-xs text-muted">{[l.variantLabel, `Qty ${l.quantity}`, l.giftWrap && "Gift wrapped"].filter(Boolean).join(" · ")}</p>
                  {l.giftMessage && <p className="mt-1 truncate text-xs italic text-muted">“{l.giftMessage}”</p>}
                </div>
                <span className="text-sm font-semibold tabular-nums">{money(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-6 border-t border-line pt-5 sm:grid-cols-2">
            <div className="text-sm">
              <p className="mb-1 font-semibold">Delivering to</p>
              <p className="text-muted">{a.firstName} {a.lastName}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.zip}</p>
              <p className="mt-3 flex items-center gap-2 text-muted"><CalendarHeart size={15} className="text-gold-ink" /> {order.shippingLabel}{order.deliveryDate ? ` · ${new Date(order.deliveryDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : ""}</p>
            </div>
            <dl className="space-y-1.5 text-sm">
              {[["Subtotal", money(order.subtotal)], ...(order.discount ? [["Discount", `−${money(order.discount)}`]] : []), ...(order.giftWrapTotal ? [["Gift wrap", money(order.giftWrapTotal)]] : []), ["Shipping", order.shipping ? money(order.shipping) : "Free"], ["Tax", money(order.tax)], ...(order.giftCardApplied ? [["Gift card", `−${money(order.giftCardApplied)}`]] : [])].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="tabular-nums">{v}</dd></div>
              ))}
              <div className="flex justify-between border-t border-line pt-2 font-display text-xl"><dt>Total paid</dt><dd className="tabular-nums">{money(order.total)}</dd></div>
            </dl>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={`/track/${order.id}`} size="lg">Track this order</ButtonLink>
          <ButtonLink href="/shop" variant="outline" size="lg">Continue shopping</ButtonLink>
        </div>
        {!order.customerId && <p className="mt-6 text-center text-sm text-muted"><Link href={`/account/login?mode=signup&email=${encodeURIComponent(order.email)}`} className="font-semibold text-gold-ink underline-offset-4 hover:underline">Create an account</Link> to track orders and save addresses for next time.</p>}
      </Container>
    </div>
  );
}
