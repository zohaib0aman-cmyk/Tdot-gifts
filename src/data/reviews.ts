import type { Review } from "@/lib/types";
import { SEED_PRODUCTS } from "./catalog";

const PEOPLE = [
  ["Jasmine R.", "Atlanta, GA"], ["Michael T.", "Houston, TX"], ["Priya S.", "Edison, NJ"], ["Danielle W.", "Charlotte, NC"],
  ["Carlos M.", "Miami, FL"], ["Ayesha K.", "Chicago, IL"], ["Brittany L.", "Phoenix, AZ"], ["Omar F.", "Dallas, TX"],
  ["Sarah J.", "Brooklyn, NY"], ["Kevin O.", "Seattle, WA"], ["Fatima Z.", "Dearborn, MI"], ["Lauren P.", "Nashville, TN"],
  ["Hamza A.", "London, UK — sent to Austin, TX"], ["Emily C.", "San Diego, CA"], ["Marcus B.", "Baltimore, MD"], ["Sofia G.", "Los Angeles, CA"],
  ["Zara H.", "Toronto, CA — sent to Orlando, FL"], ["Tyler N.", "Denver, CO"], ["Nadia I.", "Lahore, PK — sent to Queens, NY"], ["Ashley D.", "Columbus, OH"],
] as const;

const GENERAL: [number, string, string][] = [
  [5, "She cried happy tears", "I live overseas and was nervous ordering, but the team kept me updated on WhatsApp the whole way. It arrived exactly on her birthday and looked even better than the photos."],
  [5, "Absolutely stunning", "Packaging was so luxe — the black and gold is gorgeous in person. Delivery driver was kind and on time. Will be ordering again for our anniversary."],
  [5, "Worth every penny", "Quality is far beyond the big flower sites. Everything was fresh, beautifully arranged and the handwritten card was a lovely touch."],
  [4, "Beautiful, arrived a little late", "Gorgeous gift and my wife loved it. Arrived about an hour after the window I chose, but customer service was very responsive and apologetic."],
  [5, "Made my mom's whole week", "She sent me a dozen photos of it. The gift message was written perfectly. Thank you for making the distance feel smaller!"],
  [5, "Instagram-worthy", "Saw this on their Instagram and it looks exactly the same in real life. My girlfriend posted it immediately 😂"],
  [5, "Easy ordering, great updates", "Checkout was simple, I got tracking updates by email and the delivery photo before she even texted me."],
  [4, "Lovely gift", "Really nice presentation and great value with the promo code. Would love even more color options."],
];

const BY_CATEGORY: Record<string, [number, string, string][]> = {
  flowers: [
    [5, "Roses were perfect", "Every single rose was open and velvety — not one bruised petal. Still looking fresh a week later."],
    [5, "The heart box is everything", "The roses sparkle in person and the box is so sturdy — she's keeping it as decor."],
  ],
  "gift-boxes": [
    [5, "Best basket ever", "Packed so generously and the satin ribbon was tied perfectly. The handwritten note was the sweetest touch."],
    [5, "Great corporate gift", "Sent these to six clients — all arrived on the same day, perfectly packed. Several clients emailed to thank us."],
  ],
  "cakes-sweets": [
    [5, "Delicious and gorgeous", "The cake was moist and not too sweet, and the roses on top made it look like a wedding cake. Everyone asked where it was from."],
    [5, "Cupcakes disappeared in minutes", "Moist red velvet, silky frosting and that gold leaf — they looked like little roses. Everyone asked where they were from."],
  ],
  "teddy-balloons": [
    [5, "The bear is HUGE and so soft", "My daughter screamed when she opened the door. It's even softer than expected and the bow tie is adorable."],
    [5, "Softest teddy ever", "The little I Love You heart made her cry. Arrived with a bow, perfectly clean and fluffy."],
  ],
  personalized: [
    [5, "Engraving is flawless", "The initial is crisp and delicate. She hasn't taken it off since. Velvet box made it feel very premium."],
    [5, "Such a thoughtful keepsake", "The print quality on the photo was excellent and they helped me crop it perfectly."],
  ],
  "surprise-packages": [
    [5, "They filmed the whole surprise!", "I was in Dubai for my sister's birthday — the team set everything up and sent a video of her walking in. I watched it twenty times. Truly magical."],
    [5, "Planners were incredible", "They coordinated with her roommate, set up in 40 minutes and left the place spotless. The table setup was Pinterest-level."],
  ],
};

let s = 7;
const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

export const SEED_REVIEWS: Review[] = [];
SEED_PRODUCTS.forEach((p, pi) => {
  const pool = [...(BY_CATEGORY[p.category] ?? []), ...GENERAL];
  const count = 3 + (pi % 4);
  for (let i = 0; i < count; i++) {
    const [rating, title, body] = pool[(pi * 3 + i * 7) % pool.length];
    const [author, location] = PEOPLE[(pi * 7 + i * 3) % PEOPLE.length];
    const daysAgo = Math.floor(r() * 120) + 2;
    SEED_REVIEWS.push({
      id: `r_${p.id}_${i}`,
      productId: p.id,
      author,
      location,
      rating,
      title,
      body,
      verified: r() > 0.15,
      status: i === count - 1 && pi % 6 === 0 ? "pending" : "approved",
      createdAt: new Date(Date.parse("2026-11-10T12:00:00Z") - daysAgo * 86_400_000).toISOString(),
    });
  }
});
