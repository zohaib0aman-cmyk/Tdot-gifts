import { Hero } from "@/components/home/hero";
import { GiftFinderQuiz, Newsletter } from "@/components/home/sections";
import { HowItWorks, InstagramFeed, OccasionGrid, ProductSection, RecipientRail, ReviewsSection } from "@/components/home/static-sections";
import { getSettings, listProducts, listReviews, slimProduct } from "@/lib/db";
import type { HomeSectionKey } from "@/lib/types";

export default async function HomePage() {
  const [settings, full, reviews] = await Promise.all([getSettings(), listProducts(), listReviews()]);
  const products = full.map(slimProduct);
  const best = products.filter((p) => p.bestseller).slice(0, 8);
  const fresh = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const render: Record<HomeSectionKey, React.ReactNode> = {
    occasions: <OccasionGrid />,
    recipients: <RecipientRail />,
    bestsellers: <ProductSection id="best-h" eyebrow="Most loved" title={<>Best <em className="gold-text">sellers</em></>} sub="The gifts our customers send again and again." products={best} href="/shop?sort=popular" />,
    story: <HowItWorks />,
    newArrivals: <ProductSection id="new-h" eyebrow="Just arrived" title="New arrivals" sub="Fresh designs for this season's celebrations." products={fresh} href="/shop?sort=newest" />,
    quiz: <GiftFinderQuiz products={products} />,
    reviews: <ReviewsSection reviews={reviews} products={products} />,
    instagram: <InstagramFeed instagram={settings.social.instagram} />,
    newsletter: <Newsletter />,
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: settings.storeName,
    url: siteUrl,
    logo: `${siteUrl}${settings.logoUrl}`,
    image: `${siteUrl}${settings.logoUrl}`,
    email: settings.contact.email,
    telephone: settings.contact.phone,
    sameAs: Object.values(settings.social).filter(Boolean),
    areaServed: "US",
    aggregateRating: { "@type": "AggregateRating", ratingValue: (reviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, reviews.length)).toFixed(1), reviewCount: reviews.length },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd).replace(/</g, "\\u003c") }} />
      <Hero hero={settings.hero} />
      {settings.homeSections.filter((s) => s.visible).map((s) => <div key={s.key}>{render[s.key]}</div>)}
    </>
  );
}
