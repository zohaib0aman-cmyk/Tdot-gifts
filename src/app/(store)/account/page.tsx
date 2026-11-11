import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Heart, MapPin, Package } from "lucide-react";
import { LogoutButton } from "@/components/account";
import { ProductImage } from "@/components/product-image";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { getCurrentCustomer } from "@/lib/auth";
import { listOrders } from "@/lib/db";
import { formatDate, money, STATUS_LABEL } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

export default async function AccountPage() {
  const c = await getCurrentCustomer();
  if (!c) redirect("/account/login");
  const orders = (await listOrders()).filter((o) => o.customerId === c.id || o.email === c.email);
  return (
    <Container className="max-w-5xl py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">My account</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Hello, {c.firstName || "friend"} ✨</h1>
          <p className="mt-2 text-sm text-muted">{c.email} · member since {formatDate(c.createdAt, { month: "long", year: "numeric" })}</p>
        </div>
        <LogoutButton />
      </div>
      <nav className="mt-8 grid grid-cols-3 gap-3" aria-label="Account sections">
        {[{ href: "#orders", icon: Package, label: "Orders", n: orders.length }, { href: "/account/addresses", icon: MapPin, label: "Addresses", n: c.addresses.length }, { href: "/account/wishlist", icon: Heart, label: "Wishlist" }].map((x) => (
          <Link key={x.label} href={x.href} className="group flex flex-col items-center gap-2 rounded-3xl border border-line bg-surface p-4 text-center shadow-soft transition hover:-translate-y-0.5 hover:border-gold sm:flex-row sm:p-5 sm:text-left">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush text-gold-ink"><x.icon size={20} /></span>
            <span className="flex-1"><span className="block text-sm font-semibold">{x.label}</span>{x.n != null && <span className="text-xs text-muted">{x.n} saved</span>}</span>
            <ChevronRight size={16} className="hidden text-muted transition group-hover:translate-x-1 sm:block" />
          </Link>
        ))}
      </nav>
      <section id="orders" className="mt-12 scroll-mt-24">
        <h2 className="mb-5 text-3xl">Order history</h2>
        {orders.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-display text-2xl">No orders yet</p>
            <p className="mt-2 text-sm text-muted">When you send your first surprise, it&apos;ll appear here with live tracking.</p>
            <ButtonLink href="/shop" className="mt-6">Start shopping</ButtonLink>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/track/${o.id}`} className="group flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-soft transition hover:border-gold sm:flex-row sm:items-center">
                  <div className="flex -space-x-3">
                    {o.lines.slice(0, 3).map((l, i) => <span key={i} className="relative h-16 w-14 overflow-hidden rounded-xl border-2 border-surface bg-surface-2"><ProductImage src={l.image} alt="" fill sizes="56px" /></span>)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{o.number} <span className="font-normal text-muted">· {formatDate(o.createdAt)}</span></p>
                    <p className="truncate text-sm text-muted">{o.lines.map((l) => l.name).join(", ")}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <Badge tone={o.status === "delivered" ? "green" : ["cancelled", "refunded", "failed"].includes(o.status) ? "muted" : "gold"}>{STATUS_LABEL[o.status]}</Badge>
                    <span className="font-semibold tabular-nums">{money(o.total)}</span>
                    <ChevronRight size={18} className="text-muted transition group-hover:translate-x-1" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
