import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/account";
import { ProductImage } from "@/components/product-image";
import { Container } from "@/components/ui";
import { getCustomerSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in or create an account", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/account/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/account";
  if (await getCustomerSession()) redirect(next);
  return (
    <Container className="grid max-w-5xl items-center gap-10 py-10 sm:py-16 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-lift"><ProductImage src="/photos/p15.webp" alt="" fill sizes="40vw" /></div>
      </div>
      <div>
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Members</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Welcome to the inner circle</h1>
        <p className="mb-8 mt-3 text-muted">Track orders, save recipients&apos; addresses and keep a wishlist of surprises.</p>
        <AuthForm initialMode={sp.mode === "signup" ? "signup" : "login"} next={next} email={typeof sp.email === "string" ? sp.email : ""} />
      </div>
    </Container>
  );
}
