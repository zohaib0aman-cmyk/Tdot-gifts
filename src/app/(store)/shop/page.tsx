import type { Metadata } from "next";
import { ShopView } from "@/components/shop-view";
import { parseFilters } from "@/lib/shop-filters";
import { CATEGORIES, OCCASIONS, RECIPIENTS } from "@/data/catalog";
import { listProducts, slimProduct } from "@/lib/db";

type SP = Record<string, string | string[] | undefined>;
const first = (sp: SP, k: string) => { const v = sp[k]; return Array.isArray(v) ? v[0] ?? null : v ?? null; };
const all = (sp: SP, k: string) => { const v = sp[k]; return Array.isArray(v) ? v : v ? [v] : []; };

function titleFor(sp: SP) {
  const c = all(sp, "category"), o = all(sp, "occasion"), r = all(sp, "recipient");
  if (c.length === 1 && !o.length && !r.length) return CATEGORIES.find((x) => x.slug === c[0])?.name;
  if (o.length === 1 && !c.length && !r.length) return `${OCCASIONS.find((x) => x.slug === o[0])?.name} Gifts`;
  if (r.length === 1 && !c.length && !o.length) return `Gifts ${RECIPIENTS.find((x) => x.slug === r[0])?.name.replace("For", "for")}`;
  return undefined;
}

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const t = titleFor(await searchParams) ?? "Shop All Gifts";
  return { title: t, description: `${t} — luxury flowers, gift boxes, cakes, teddy bears and surprise packages delivered across the USA.`, alternates: { canonical: "/shop" } };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const products = (await listProducts()).map((p) => ({ ...slimProduct(p), description: p.description.slice(0, 160) }));
  const initial = parseFilters((k) => first(sp, k), (k) => all(sp, k));
  return <ShopView products={products} initial={initial} title={titleFor(sp) ?? "All gifts"} />;
}
