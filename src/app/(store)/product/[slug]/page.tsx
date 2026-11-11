import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion";
import { ProductCard } from "@/components/product-card";
import { Gallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ReviewsBlock } from "@/components/product/reviews";
import { Container, SectionHeading } from "@/components/ui";
import { CATEGORIES } from "@/data/catalog";
import { getProductBySlug, getSettings, listProducts, listReviews, productStock, slimProduct } from "@/lib/db";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Gift not found" };
  return {
    title: p.name,
    description: `${p.subtitle}. ${p.description.slice(0, 120)}…`,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name, description: p.subtitle, type: "website" },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p || p.status !== "active") notFound();
  const [reviews, all, settings] = await Promise.all([listReviews({ productId: p.id }), listProducts(), getSettings()]);
  const category = CATEGORIES.find((c) => c.slug === p.category);
  const related = all
    .filter((x) => x.id !== p.id)
    .map((x) => ({ x, s: (x.category === p.category ? 3 : 0) + x.occasions.filter((o) => p.occasions.includes(o)).length + x.recipients.filter((r) => p.recipients.includes(r)).length }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((r) => slimProduct(r.x));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const prices = p.variants?.options.map((o) => o.price) ?? [p.price];
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images.map((i) => `${siteUrl}${i}`),
    sku: p.id,
    brand: { "@type": "Brand", name: settings.storeName },
    category: category?.name,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: productStock(p) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl}/product/${p.slug}`,
    },
    ...(reviews.length && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount },
      review: reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.author }, datePublished: r.createdAt.slice(0, 10), name: r.title, reviewBody: r.body, reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 } })),
    }),
  };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: category?.name, item: `${siteUrl}/shop?category=${p.category}` },
    { "@type": "ListItem", position: 3, name: p.name, item: `${siteUrl}/product/${p.slug}` },
  ] };

  return (
    <div className="pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([ld, crumbs]).replace(/</g, "\\u003c") }} />
      <Container>
        <nav aria-label="Breadcrumb" className="py-4 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="inline-flex min-h-10 items-center hover:text-fg">Home</Link></li>
            <ChevronRight size={14} aria-hidden />
            <li><Link href={`/shop?category=${p.category}`} className="inline-flex min-h-10 items-center hover:text-fg">{category?.name}</Link></li>
            <ChevronRight size={14} aria-hidden />
            <li aria-current="page" className="truncate text-fg">{p.name}</li>
          </ol>
        </nav>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 [&>*]:min-w-0">
          <Gallery images={p.images} name={p.name} />
          <PurchasePanel product={p} categoryName={category?.name ?? ""} />
        </div>
        <ReviewsBlock productId={p.id} reviews={reviews} />
        <section className="pb-8" aria-labelledby="rel-h">
          <SectionHeading eyebrow="Pairs beautifully with" title={<span id="rel-h">You may also love</span>} />
          <Stagger className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-4">
            {related.map((r) => <StaggerItem key={r.id}><ProductCard product={r} /></StaggerItem>)}
          </Stagger>
        </section>
      </Container>
    </div>
  );
}
