import { revalidatePath } from "next/cache";
import { z } from "zod";
import { body, route } from "@/lib/api";
import { productSchema } from "@/lib/admin-schemas";
import { listProducts, newId, saveProduct } from "@/lib/db";
import { parseCsv } from "@/lib/csv";
import { slugify } from "@/lib/utils";

/**
 * CSV columns: name,slug,subtitle,description,price,compare_at_price,category,occasions,recipients,tags,stock,image_urls,status,delivery_days
 * Multi-value cells use "|" as separator. Existing slugs are updated, new slugs are created.
 */
export const POST = route(async (req) => {
  const { csv, dryRun } = await body(req, z.object({ csv: z.string().min(1).max(2_000_000), dryRun: z.boolean().optional() }));
  const rows = parseCsv(csv);
  const existing = await listProducts({ includeInactive: true });
  const split = (v?: string) => (v ? v.split("|").map((s) => s.trim()).filter(Boolean) : []);
  const results: { row: number; name: string; action: "create" | "update" | "error"; error?: string }[] = [];
  const toSave = [];
  for (const [i, r] of rows.entries()) {
    const slug = r.slug?.trim() || slugify(r.name ?? "");
    const prev = existing.find((p) => p.slug === slug);
    const parsed = productSchema.safeParse({
      id: prev?.id,
      slug,
      name: r.name,
      subtitle: r.subtitle ?? "",
      description: r.description ?? "",
      details: split(r.details),
      price: Number(r.price),
      compareAtPrice: r.compare_at_price ? Number(r.compare_at_price) : undefined,
      images: split(r.image_urls).length ? split(r.image_urls) : prev?.images ?? ["/photos/p12.webp"],
      category: r.category || prev?.category || "gift-boxes",
      occasions: split(r.occasions),
      recipients: split(r.recipients),
      tags: split(r.tags),
      variants: prev?.variants,
      stock: Number(r.stock || 0),
      deliveryDays: Number(r.delivery_days || 2),
      status: (r.status as "active") || "active",
      bestseller: prev?.bestseller, isNew: prev ? prev.isNew : true, featured: prev?.featured,
    });
    if (!parsed.success) { results.push({ row: i + 2, name: r.name ?? "", action: "error", error: parsed.error.issues[0]?.message }); continue; }
    results.push({ row: i + 2, name: parsed.data.name, action: prev ? "update" : "create" });
    const now = new Date().toISOString();
    toSave.push({ ...parsed.data, id: prev?.id ?? newId("p"), rating: 0, reviewCount: 0, createdAt: prev?.createdAt ?? now, updatedAt: now });
  }
  if (!dryRun) {
    for (const p of toSave) await saveProduct(p);
    revalidatePath("/", "layout");
  }
  return { results, imported: dryRun ? 0 : toSave.length };
}, { admin: true });
