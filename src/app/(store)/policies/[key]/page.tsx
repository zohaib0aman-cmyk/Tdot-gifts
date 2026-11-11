import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { Container } from "@/components/ui";
import { getSettings } from "@/lib/db";
import type { PolicyKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const TITLES: Record<PolicyKey, string> = { privacy: "Privacy Policy", terms: "Terms of Service", refunds: "Refund & Return Policy", shipping: "Shipping Policy" };

export async function generateMetadata({ params }: PageProps<"/policies/[key]">): Promise<Metadata> {
  const { key } = await params;
  const t = TITLES[key as PolicyKey];
  return t ? { title: t, alternates: { canonical: `/policies/${key}` } } : {};
}

export default async function PolicyPage({ params }: PageProps<"/policies/[key]">) {
  const { key } = await params;
  if (!(key in TITLES)) notFound();
  const s = await getSettings();
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <nav className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4" aria-label="Policies">
        {(Object.keys(TITLES) as PolicyKey[]).map((k) => (
          <Link key={k} href={`/policies/${k}`} aria-current={k === key ? "page" : undefined} className={cn("flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition", k === key ? "border-ink bg-ink text-on-ink" : "border-line hover:border-gold")}>{TITLES[k]}</Link>
        ))}
      </nav>
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Last updated November 2026</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{TITLES[key as PolicyKey]}</h1>
      <Markdown source={s.policies[key as PolicyKey]} />
    </Container>
  );
}
