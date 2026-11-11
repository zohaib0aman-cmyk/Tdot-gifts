import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { getAdmin } from "@/lib/auth";
import { getSettings, listMessages, listOrders, listReviews } from "@/lib/db";
import { backendName } from "@/lib/store";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const [orders, reviews, messages, settings] = await Promise.all([listOrders(), listReviews({ includeAll: true }), listMessages(), getSettings()]);
  const counts = {
    "/admin/orders": orders.filter((o) => o.status === "paid" || o.status === "processing").length,
    "/admin/reviews": reviews.filter((r) => r.status === "pending").length,
    "/admin/inbox": messages.filter((m) => !m.handled).length,
  };
  return <AdminShell email={admin.email} counts={counts} storeName={settings.storeName} logoUrl={settings.logoUrl} backend={backendName()}>{children}</AdminShell>;
}
