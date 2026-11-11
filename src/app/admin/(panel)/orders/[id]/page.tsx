import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderManager } from "@/components/admin/order-manager";
import { PageHeader } from "@/components/admin/shell";
import { getOrder } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  return (
    <>
      <Link href="/admin/orders" className="mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft size={16} /> Orders</Link>
      <PageHeader title={`Order ${order.number}`} sub={`Placed ${formatDate(order.createdAt, { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`} />
      <OrderManager order={order} />
    </>
  );
}
