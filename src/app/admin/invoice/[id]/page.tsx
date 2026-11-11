import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/admin/print-button";
import { getAdmin } from "@/lib/auth";
import { getOrder, getSettings } from "@/lib/db";
import { formatDate, money } from "@/lib/utils";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: PageProps<"/admin/invoice/[id]">) {
  if (!(await getAdmin())) redirect("/admin/login");
  const { id } = await params;
  const [o, s] = await Promise.all([getOrder(id), getSettings()]);
  if (!o) notFound();
  const a = o.shippingAddress;
  return (
    <main className="mx-auto max-w-3xl bg-white p-6 text-[#1d1416] sm:p-12 print:p-0">
      <div className="no-print mb-6 flex justify-end"><PrintButton /></div>
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#e8dfd5] pb-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.logoUrl} alt="" className="h-16 w-16 rounded-full" />
          <div><p className="font-display text-2xl">{s.storeName}</p><p className="text-sm text-[#6b5a5d]">{s.contact.email} · {s.contact.phone}</p></div>
        </div>
        <div className="text-right"><p className="font-display text-3xl">Invoice</p><p className="text-sm text-[#6b5a5d]">{o.number}<br />{formatDate(o.createdAt)}</p></div>
      </header>
      <section className="grid grid-cols-2 gap-6 py-6 text-sm">
        <div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9c7a2e]">Billed to</p><p>{o.email}</p></div>
        <div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9c7a2e]">Deliver to</p><p>{a.firstName} {a.lastName}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.zip}{a.phone ? <><br />{a.phone}</> : null}</p></div>
      </section>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-[#e8dfd5] text-left text-xs uppercase tracking-wider text-[#6b5a5d]"><th className="py-2">Item</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Amount</th></tr></thead>
        <tbody>{o.lines.map((l, i) => <tr key={i} className="border-b border-[#f0e9e1]"><td className="py-3">{l.name}{l.variantLabel ? ` — ${l.variantLabel}` : ""}{l.giftWrap ? " (gift wrapped)" : ""}{l.giftMessage && <div className="text-xs italic text-[#6b5a5d]">Card: “{l.giftMessage}”</div>}</td><td className="py-3 text-center">{l.quantity}</td><td className="py-3 text-right">{money(l.unitPrice)}</td><td className="py-3 text-right">{money(l.unitPrice * l.quantity)}</td></tr>)}</tbody>
      </table>
      <dl className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
        {[["Subtotal", money(o.subtotal)], ...(o.discount ? [[`Discount (${o.promoCode})`, `−${money(o.discount)}`]] : []), ...(o.giftWrapTotal ? [["Gift wrap", money(o.giftWrapTotal)]] : []), [`Shipping (${o.shippingLabel})`, o.shipping ? money(o.shipping) : "Free"], [`Sales tax (${a.state})`, money(o.tax)], ...(o.giftCardApplied ? [["Gift card", `−${money(o.giftCardApplied)}`]] : [])].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-[#6b5a5d]">{k}</dt><dd>{v}</dd></div>)}
        <div className="flex justify-between border-t border-[#e8dfd5] pt-2 text-lg font-semibold"><dt>Total paid</dt><dd>{money(o.total)}</dd></div>
        {o.refundedAmount ? <div className="flex justify-between text-[#b3123a]"><dt>Refunded</dt><dd>−{money(o.refundedAmount)}</dd></div> : null}
      </dl>
      <p className="mt-12 text-center text-sm text-[#6b5a5d]">Thank you for choosing {s.storeName}. ✦</p>
    </main>
  );
}
