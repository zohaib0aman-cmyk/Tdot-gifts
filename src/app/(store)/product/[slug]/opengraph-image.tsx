import { brandedOg, ogSize } from "@/lib/og";
import { getProductBySlug } from "@/lib/db";
import { money } from "@/lib/utils";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Gift from Gifts & Surprises USA";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return brandedOg({ eyebrow: "Gifts & Surprises USA", title: "Luxury gifts delivered" });
  const from = p.variants?.options.length ? Math.min(...p.variants.options.map((o) => o.price)) : p.price;
  return brandedOg({ eyebrow: "Gift idea", title: p.name, subtitle: p.subtitle, price: `${p.variants ? "from " : ""}${money(from)}` });
}
