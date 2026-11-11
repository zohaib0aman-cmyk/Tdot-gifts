import { ReviewsManager } from "@/components/admin/reviews-manager";
import { PageHeader } from "@/components/admin/shell";
import { listProducts, listReviews } from "@/lib/db";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const [reviews, products] = await Promise.all([listReviews({ includeAll: true }), listProducts({ includeInactive: true })]);
  return (
    <>
      <PageHeader title="Reviews" sub="Approve new reviews before they appear on product pages." />
      <ReviewsManager reviews={reviews} names={Object.fromEntries(products.map((p) => [p.id, p.name]))} />
    </>
  );
}
