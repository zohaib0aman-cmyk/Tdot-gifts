import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader } from "@/components/admin/shell";
import { listOrders } from "@/lib/db";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const orders = await listOrders();
  return (
    <>
      <PageHeader title="Orders" sub="Update statuses, add tracking, refund and print invoices." />
      <OrdersTable orders={orders} />
    </>
  );
}
