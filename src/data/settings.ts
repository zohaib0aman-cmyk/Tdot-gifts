import type { SiteSettings } from "@/lib/types";

export const US_STATES: { code: string; name: string }[] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"],
  ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"],
  ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
  ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"],
  ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"],
  ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
].map(([code, name]) => ({ code, name }));

/** Statewide base sales-tax rates (percent). Editable in Admin → Settings. */
export const DEFAULT_TAX_RATES: Record<string, number> = {
  AL: 4, AK: 0, AZ: 5.6, AR: 6.5, CA: 7.25, CO: 2.9, CT: 6.35, DE: 0, DC: 6, FL: 6, GA: 4, HI: 4, ID: 6, IL: 6.25, IN: 7, IA: 6,
  KS: 6.5, KY: 6, LA: 4.45, ME: 5.5, MD: 6, MA: 6.25, MI: 6, MN: 6.875, MS: 7, MO: 4.225, MT: 0, NE: 5.5, NV: 6.85, NH: 0, NJ: 6.625,
  NM: 4.875, NY: 4, NC: 4.75, ND: 5, OH: 5.75, OK: 4.5, OR: 0, PA: 6, RI: 7, SC: 6, SD: 4.2, TN: 7, TX: 6.25, UT: 6.1, VT: 6,
  VA: 5.3, WA: 6.5, WV: 6, WI: 5, WY: 4,
};

const POLICIES = {
  privacy: `## Our promise
Gifts & Surprises USA ("we", "us") respects your privacy. This policy explains what we collect, why, and the choices you have.

## What we collect
- **Order details** — your name, email, phone, the recipient's name and delivery address, and your gift message.
- **Payment information** — processed securely by Stripe or PayPal. We never see or store your full card number.
- **Account data** — if you create an account: saved addresses, order history and wishlist.
- **Usage data** — basic analytics and cookies that keep your cart working (see Cookies below).

## How we use it
- To prepare, deliver and support your order, including delivery updates and reaction videos you request.
- To send order confirmations and, only if you opt in, occasional offers. You can unsubscribe any time.
- To prevent fraud and keep our store secure.

## Sharing
We share only what's needed with trusted partners — payment processors, delivery couriers, partner florists and bakeries. We never sell your personal information.

## Cookies
Essential cookies keep your cart, wishlist and session working. Optional analytics cookies are only set if you accept them in our cookie banner.

## Your rights
You may request access, correction or deletion of your data by emailing hello@giftsandsurprises.us. California residents have additional rights under the CCPA/CPRA, which we honor.

## Contact
Questions? Email hello@giftsandsurprises.us.`,
  terms: `## Agreement
By using giftsandsurprises.us and placing an order you agree to these terms.

## Orders & pricing
All prices are in US dollars. We reserve the right to cancel orders affected by pricing errors or suspected fraud; you'll receive a full refund if this happens.

## Substitutions
Flowers and some gift components are seasonal. If an item is unavailable we may substitute something of equal or greater value and similar style.

## Delivery
Delivery dates are estimates. We'll do everything we can to deliver on your chosen date, and we'll contact you promptly if anything changes.

## Personalization
You're responsible for the accuracy of names, initials and messages you provide. Personalized items can't be returned unless they arrive damaged or incorrect.

## Surprise setups
For setup packages you confirm you have permission for our team to access the location. Setup windows are coordinated by our planners after purchase.

## Liability
Our liability is limited to the amount you paid for the order in question.

## Governing law
These terms are governed by the laws of the State of Texas, USA.`,
  refunds: `## Our happiness guarantee
If your gift arrives damaged, wilted or incorrect, tell us within **48 hours** of delivery (with a photo) and we'll send a replacement or issue a full refund — your choice.

## Perishable items
Flowers, cakes, strawberries and other perishables can't be returned, but they're fully covered by our happiness guarantee above.

## Non-perishable items
Unused, non-personalized items (teddy bears, candles, gift boxes) can be returned within **30 days** of delivery for a refund to the original payment method. Return shipping is free if the return is due to our error.

## Personalized items
Engraved, printed or monogrammed items are final sale unless they arrive damaged or with an error on our part.

## Cancellations
Orders can be cancelled for a full refund until they're prepared — typically up to 24 hours before the delivery date. Surprise setups can be rescheduled free of charge with 48 hours' notice.

## How refunds work
Approved refunds are issued to your original payment method within 1–2 business days; your bank may take 5–10 business days to post it. Gift-card purchases are refunded as gift-card credit.`,
  shipping: `## Where we deliver
We deliver to all 50 states and Washington, D.C. Same-day hand delivery is available in our service metros; everywhere else ships with USPS, UPS or FedEx.

## Delivery options
- **USPS Ground Advantage** — 3–5 business days
- **USPS Priority Mail** — 2–3 business days
- **UPS Ground** — 2–5 business days
- **UPS 2nd Day Air** — 2 business days
- **FedEx Priority Overnight** — next business day

## Free shipping
Orders over the free-shipping threshold shown in your cart ship free with standard delivery.

## Perishables
Flowers, cakes and strawberries are only available for local hand delivery or overnight shipping to arrive fresh.

## Tracking
You'll receive an email with tracking as soon as your order ships. You can also track it any time at /track with your order number and email.

## International senders
Ordering from outside the USA? No problem — we accept international cards and PayPal. Delivery is always within the USA.`,
};

export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: "Gifts & Surprises USA",
  tagline: "Luxury gifts & birthday surprises, delivered across the USA",
  logoUrl: "/brand/logo-badge.png",
  logoMode: "badge+wordmark",
  colors: { primary: "#16110f", accent: "#c9a14a", blush: "#f2dcdf", cream: "#faf6ef" },
  font: "classic",
  announcement: {
    enabled: true,
    messages: [
      "Free delivery on orders over $99",
      "Order from anywhere · Delivered across the USA",
      "Code WELCOME10 · 10% off your first surprise",
    ],
  },
  hero: {
    eyebrow: "Surprise planners · USA-wide",
    title: "Gifts that make",
    highlight: "hearts skip a beat",
    subtitle: "Hand-tied rose bouquets, celebration cakes, treat baskets and full surprise setups — planned by us, delivered across the USA, ordered from anywhere in the world.",
    ctaLabel: "Shop gifts",
    ctaHref: "/shop",
    secondaryLabel: "Find the perfect gift",
    secondaryHref: "/#gift-finder",
  },
  homeSections: [
    { key: "occasions", label: "Shop by occasion", visible: true },
    { key: "bestsellers", label: "Best sellers", visible: true },
    { key: "recipients", label: "Shop by recipient", visible: true },
    { key: "story", label: "How surprises work", visible: true },
    { key: "newArrivals", label: "New arrivals", visible: true },
    { key: "quiz", label: "Gift finder quiz", visible: true },
    { key: "reviews", label: "Customer reviews", visible: true },
    { key: "instagram", label: "Instagram feed", visible: true },
    { key: "newsletter", label: "Newsletter signup", visible: true },
  ],
  footerColumns: [
    { title: "Shop", links: [
      { label: "All gifts", href: "/shop" },
      { label: "Flowers & Bouquets", href: "/shop?category=flowers" },
      { label: "Surprise Packages", href: "/shop?category=surprise-packages" },
      { label: "Gift Cards", href: "/gift-cards" },
    ] },
    { title: "Help", links: [
      { label: "Track your order", href: "/track" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping Policy", href: "/policies/shipping" },
      { label: "Returns & Refunds", href: "/policies/refunds" },
    ] },
    { title: "Company", links: [
      { label: "Our story", href: "/about" },
      { label: "Contact us", href: "/contact" },
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Terms of Service", href: "/policies/terms" },
    ] },
  ],
  social: {
    instagram: "https://www.instagram.com/gifts.surprises.usa/",
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/",
    pinterest: "https://www.pinterest.com/",
    whatsapp: "",
  },
  contact: {
    email: "hello@giftsandsurprises.us",
    phone: "(214) 555-0147",
    hours: "Mon–Sun · 8am–9pm CT",
    serviceArea: "Hand delivery in 40+ US metros · Shipping to all 50 states",
  },
  freeShippingThreshold: 99,
  giftWrapPrice: 6.95,
  shippingRates: [
    { id: "usps-ground", carrier: "usps", name: "USPS Ground Advantage", eta: "3–5 business days", price: 7.95, minDays: 3, maxDays: 5, enabled: true },
    { id: "usps-priority", carrier: "usps", name: "USPS Priority Mail", eta: "2–3 business days", price: 12.95, minDays: 2, maxDays: 3, enabled: true },
    { id: "ups-ground", carrier: "ups", name: "UPS Ground", eta: "2–5 business days", price: 10.95, minDays: 2, maxDays: 5, enabled: true },
    { id: "ups-2day", carrier: "ups", name: "UPS 2nd Day Air", eta: "2 business days", price: 22.95, minDays: 2, maxDays: 2, enabled: true },
    { id: "fedex-overnight", carrier: "fedex", name: "FedEx Priority Overnight", eta: "Next business day", price: 34.95, minDays: 1, maxDays: 1, enabled: true },
  ],
  taxRates: DEFAULT_TAX_RATES,
  emailTemplates: {
    orderConfirmation: { subject: "Your surprise is on its way to being perfect 🎁 (Order {{orderNumber}})", intro: "Thank you, {{firstName}}! We've received your order and our team is already preparing something beautiful." },
    shipped: { subject: "Your gift has shipped! (Order {{orderNumber}})", intro: "Great news, {{firstName}} — your order is on its way. Track it any time with the link below." },
    giftCard: { subject: "{{senderName}} sent you a Gifts & Surprises gift card 🎁", intro: "Someone special is thinking of you. Use the code below at checkout — it never expires." },
  },
  policies: POLICIES,
};
