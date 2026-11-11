import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { getProductById } from "@/lib/db";

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const p = await getProductById(id);
  if (!p) notFound();
  return <ProductEditor product={p} />;
}
