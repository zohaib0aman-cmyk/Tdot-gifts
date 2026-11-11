import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/auth";
import { isDemoAdminPassword } from "@/lib/env";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function AdminLogin({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/admin") ? sp.next : "/admin";
  if (await getAdmin()) redirect(next);
  return <AdminLoginForm next={next} demo={isDemoAdminPassword()} />;
}
