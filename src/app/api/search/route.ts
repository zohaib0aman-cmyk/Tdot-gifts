import { NextResponse, type NextRequest } from "next/server";
import { CATEGORIES } from "@/data/catalog";
import { listProducts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const terms = q.split(/\s+/);
  const products = await listProducts();
  const results = products
    .map((p) => {
      const hay = `${p.name} ${p.subtitle} ${p.tags.join(" ")} ${p.occasions.join(" ")} ${p.category}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (p.name.toLowerCase().includes(t)) score += 3;
        else if (hay.includes(t) || hay.includes(t.replace(/s$/, ""))) score += 1;
        else return null;
      }
      return { p, score };
    })
    .filter((x): x is { p: (typeof products)[number]; score: number } => !!x)
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .slice(0, 6)
    .map(({ p }) => ({
      id: p.id, slug: p.slug, name: p.name, image: p.images[0],
      price: p.variants?.options.length ? Math.min(...p.variants.options.map((o) => o.price)) : p.price,
      category: CATEGORIES.find((c) => c.slug === p.category)?.name ?? "",
    }));
  return NextResponse.json({ results }, { headers: { "cache-control": "public, max-age=30" } });
}
