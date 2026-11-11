import { revalidatePath } from "next/cache";
import { z } from "zod";
import { body, route } from "@/lib/api";
import { HttpError } from "@/lib/auth";
import { productSchema } from "@/lib/admin-schemas";
import { deleteProduct, getProductById, listProducts, newId, saveProduct } from "@/lib/db";
import type { Product } from "@/lib/types";

export const POST = route(async (req) => {
  const d = await body(req, productSchema);
  const all = await listProducts({ includeInactive: true });
  if (all.some((p) => p.slug === d.slug && p.id !== d.id)) throw new HttpError(409, "Another product already uses this URL slug.");
  const existing = d.id ? await getProductById(d.id) : null;
  const now = new Date().toISOString();
  const p: Product = { ...d, id: existing?.id ?? newId("p"), rating: 0, reviewCount: 0, createdAt: existing?.createdAt ?? now, updatedAt: now };
  await saveProduct(p);
  revalidatePath("/", "layout");
  return { product: p };
}, { admin: true });

export const DELETE = route(async (req) => {
  const { id } = await body(req, z.object({ id: z.string().min(1).max(64) }));
  await deleteProduct(id);
  revalidatePath("/", "layout");
  return { ok: true };
}, { admin: true });

/** Bulk stock/status update from the product list */
export const PATCH = route(async (req) => {
  const { id, stock, status, variantId } = await body(req, z.object({ id: z.string().max(64), stock: z.number().int().min(0).max(100000).optional(), status: z.enum(["active", "draft", "archived"]).optional(), variantId: z.string().max(40).optional() }));
  const p = await getProductById(id);
  if (!p) throw new HttpError(404, "Product not found");
  if (stock != null) {
    if (variantId && p.variants) p.variants.options = p.variants.options.map((o) => (o.id === variantId ? { ...o, stock } : o));
    else p.stock = stock;
  }
  if (status) p.status = status;
  await saveProduct(p);
  return { product: p };
}, { admin: true });
