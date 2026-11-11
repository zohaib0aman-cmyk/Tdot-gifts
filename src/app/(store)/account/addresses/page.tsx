import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AddressBook } from "@/components/account";
import { Container } from "@/components/ui";
import { US_STATES } from "@/data/settings";
import { getCurrentCustomer } from "@/lib/auth";

export const metadata: Metadata = { title: "Saved Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const c = await getCurrentCustomer();
  if (!c) redirect("/account/login?next=/account/addresses");
  return (
    <Container className="max-w-4xl py-10 sm:py-14">
      <Link href="/account" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"><ArrowLeft size={16} /> My account</Link>
      <h1 className="mb-2 mt-2 text-4xl sm:text-5xl">Saved addresses</h1>
      <p className="mb-8 text-muted">Save the addresses of everyone you love to surprise them faster.</p>
      <AddressBook initial={c.addresses} states={US_STATES} />
    </Container>
  );
}
