"use client";
import { PackageSearch } from "lucide-react";
import { useSyncExternalStore } from "react";
import { SuccessView } from "./success-view";
import { OrderTimeline } from "../order-timeline";
import { ButtonLink, Container } from "../ui";
import type { Order } from "@/lib/types";
import { money } from "@/lib/utils";

const noop = () => () => {};
function useStoredOrder(id: string): Order | null | undefined {
  const raw = useSyncExternalStore(noop, () => { try { return sessionStorage.getItem(`gs-order-${id}`); } catch { return null; } }, () => undefined);
  if (raw === undefined) return undefined;
  try { return raw ? (JSON.parse(raw) as Order) : null; } catch { return null; }
}

function Missing() {
  return (
    <Container className="max-w-xl py-16 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blush text-gold-ink"><PackageSearch size={36} strokeWidth={1.4} /></span>
      <h1 className="mt-6 text-4xl">We couldn&apos;t find that order</h1>
      <p className="mt-3 text-muted">Check the link in your confirmation email, or look it up with your order number and email.</p>
      <div className="mt-8 flex justify-center gap-3"><ButtonLink href="/track">Track an order</ButtonLink><ButtonLink href="/shop" variant="outline">Shop gifts</ButtonLink></div>
    </Container>
  );
}

/** Serverless demo fallback: render the confirmation from the copy saved in this browser. */
export function SuccessFallback({ id }: { id: string }) {
  const order = useStoredOrder(id);
  if (order === undefined) return <div className="mx-auto my-16 h-96 max-w-3xl skeleton rounded-[2rem]" aria-busy="true" />;
  return order ? <SuccessView order={order} /> : <Missing />;
}

export function TrackFallback({ id }: { id: string }) {
  const order = useStoredOrder(id);
  if (order === undefined) return <div className="mx-auto my-16 h-96 max-w-3xl skeleton rounded-[2rem]" aria-busy="true" />;
  if (!order) return <Missing />;
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Order {order.number}</p>
      <h1 className="mb-8 mt-2 text-4xl sm:text-5xl">Order confirmed</h1>
      <section className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8">
        <OrderTimeline order={order} />
        <p className="mt-6 flex justify-between border-t border-line pt-4 font-display text-xl"><span>Total</span><span className="tabular-nums">{money(order.total)}</span></p>
      </section>
    </Container>
  );
}
