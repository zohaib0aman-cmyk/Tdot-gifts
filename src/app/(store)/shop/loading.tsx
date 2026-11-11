import { ProductCardSkeleton } from "@/components/product-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading gifts">
      <div className="py-8 sm:py-12"><div className="skeleton h-3 w-28 rounded" /><div className="skeleton mt-4 h-12 w-64 rounded-xl" /></div>
      <div className="skeleton mb-6 h-14 rounded-full" />
      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <div className="hidden space-y-4 lg:block">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-8 rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
      </div>
    </div>
  );
}
