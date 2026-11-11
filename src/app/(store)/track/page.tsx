import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { TrackForm } from "@/components/track-form";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Track Your Order", description: "Track your Gifts & Surprises USA order with your order number and email." };

export default function TrackPage() {
  return (
    <Container className="max-w-xl py-14 sm:py-20">
      <div className="text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blush text-gold-ink"><PackageSearch size={36} strokeWidth={1.4} /></span>
        <h1 className="mt-6 text-4xl sm:text-5xl">Track your surprise</h1>
        <p className="mt-3 text-muted">Enter the order number from your confirmation email and the email you used at checkout.</p>
      </div>
      <TrackForm />
      <p className="mt-6 text-center text-xs text-muted">Demo tip: try order <strong>GS-10120</strong> with a customer email from the admin panel.</p>
    </Container>
  );
}
