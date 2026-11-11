import { ProductsTable } from "@/components/admin/products-table";
import { listProducts } from "@/lib/db";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const products = await listProducts({ includeInactive: true });
  return <ProductsTable products={products} initialStock={typeof sp.stock === "string" ? sp.stock : undefined} />;
}
