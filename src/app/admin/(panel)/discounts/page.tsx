import { Discounts } from "@/components/admin/discounts";
import { PageHeader } from "@/components/admin/shell";
import { listGiftCards, listPromos } from "@/lib/db";

export const metadata = { title: "Discounts" };

export default async function DiscountsPage() {
  const [promos, cards] = await Promise.all([listPromos(), listGiftCards()]);
  return (
    <>
      <PageHeader title="Discounts" sub="Promo codes and gift cards." />
      <Discounts promos={promos} cards={cards} />
    </>
  );
}
