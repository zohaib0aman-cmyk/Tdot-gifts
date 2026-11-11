import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/db";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = await listProducts();
  const now = new Date();
  const statics = ["", "/shop", "/gift-cards", "/about", "/contact", "/faq", "/track", "/policies/privacy", "/policies/terms", "/policies/refunds", "/policies/shipping"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: p === "" || p === "/shop" ? ("daily" as const) : ("monthly" as const), priority: p === "" ? 1 : p === "/shop" ? 0.9 : 0.5 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "weekly" as const, priority: 0.8, images: [`${base}${p.images[0]}`] })),
  ];
}
