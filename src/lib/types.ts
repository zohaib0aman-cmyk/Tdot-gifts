export type ID = string;

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  image: string;
}

export interface Taxon {
  slug: string;
  name: string;
  emoji?: string;
  blurb?: string;
}

export interface VariantOption {
  id: ID;
  label: string;
  /** Absolute price for this option (USD). */
  price: number;
  stock: number;
  sku?: string;
}

export interface VariantGroup {
  name: string; // e.g. "Size", "Color"
  options: VariantOption[];
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  details: string[];
  price: number; // base price (USD)
  compareAtPrice?: number;
  images: string[];
  category: string; // category slug
  occasions: string[];
  recipients: string[];
  tags: string[];
  variants?: VariantGroup; // single variant axis keeps the UI clean
  stock: number; // used when there are no variants
  rating: number;
  reviewCount: number;
  bestseller?: boolean;
  isNew?: boolean;
  featured?: boolean;
  deliveryDays: number; // processing + local delivery estimate
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: ID;
  productId: ID;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  status: "approved" | "pending" | "hidden";
  createdAt: string;
}

export interface Address {
  id?: ID;
  label?: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string; // 2-letter code
  zip: string;
  phone?: string;
  isDefault?: boolean;
}

export interface CartLine {
  key: string; // productId|variantId|giftCard
  productId: ID;
  slug: string;
  name: string;
  image: string;
  variantId?: ID;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  giftWrap?: boolean;
  giftMessage?: string;
  deliveryDate?: string;
  /** Gift-card purchase payload */
  giftCard?: { amount: number; recipientName: string; recipientEmail: string; senderName: string; message?: string };
}

export type ShippingCarrier = "usps" | "ups" | "fedex";

export interface ShippingRate {
  id: string;
  carrier: ShippingCarrier;
  name: string;
  eta: string;
  price: number;
  minDays: number;
  maxDays: number;
  enabled: boolean;
}

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "refunded" | "failed";

export interface OrderLine {
  productId: ID;
  slug: string;
  name: string;
  image: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  giftWrap?: boolean;
  giftMessage?: string;
  giftCard?: CartLine["giftCard"];
}

export interface OrderEvent {
  status: OrderStatus | "note";
  message: string;
  at: string;
}

export interface Order {
  id: ID;
  number: string; // human friendly e.g. GS-10234
  email: string;
  customerId?: ID;
  shippingAddress: Address;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  giftWrapTotal: number;
  shipping: number;
  tax: number;
  giftCardApplied: number;
  total: number; // amount charged to payment method
  promoCode?: string;
  giftCardCode?: string;
  shippingRateId: string;
  shippingLabel: string;
  deliveryDate?: string;
  status: OrderStatus;
  paymentMethod: "card" | "apple_pay" | "google_pay" | "paypal" | "gift_card" | "demo";
  paymentIntentId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  trackingNumber?: string;
  trackingCarrier?: ShippingCarrier;
  refundedAmount?: number;
  events: OrderEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash?: string;
  addresses: Address[];
  wishlist: ID[];
  marketing: boolean;
  createdAt: string;
}

export interface PromoCode {
  id: ID;
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  minSubtotal?: number;
  active: boolean;
  usageLimit?: number;
  used: number;
  expiresAt?: string;
  description?: string;
}

export interface GiftCard {
  id: ID;
  code: string;
  initialBalance: number;
  balance: number;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  orderId?: ID;
  active: boolean;
  createdAt: string;
}

export interface EmailLog {
  id: ID;
  to: string;
  subject: string;
  html: string;
  template: string;
  status: "sent" | "logged" | "failed";
  createdAt: string;
}

export interface ContactMessage {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  createdAt: string;
  handled: boolean;
}

export interface Subscriber {
  id: ID;
  email: string;
  createdAt: string;
}

export type HomeSectionKey =
  | "occasions"
  | "recipients"
  | "bestsellers"
  | "story"
  | "newArrivals"
  | "quiz"
  | "reviews"
  | "instagram"
  | "newsletter";

export interface HomeSection {
  key: HomeSectionKey;
  label: string;
  visible: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export type FontPairing = "classic" | "modern" | "romantic" | "editorial";

export interface SiteSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  logoMode: "badge" | "wordmark" | "badge+wordmark";
  colors: { primary: string; accent: string; blush: string; cream: string };
  font: FontPairing;
  announcement: { enabled: boolean; messages: string[] };
  hero: { eyebrow: string; title: string; highlight: string; subtitle: string; ctaLabel: string; ctaHref: string; secondaryLabel: string; secondaryHref: string };
  homeSections: HomeSection[];
  footerColumns: { title: string; links: FooterLink[] }[];
  social: { instagram: string; facebook: string; tiktok: string; pinterest: string; whatsapp: string };
  contact: { email: string; phone: string; hours: string; serviceArea: string };
  freeShippingThreshold: number;
  giftWrapPrice: number;
  shippingRates: ShippingRate[];
  taxRates: Record<string, number>; // state code -> percent
  emailTemplates: { orderConfirmation: { subject: string; intro: string }; shipped: { subject: string; intro: string }; giftCard: { subject: string; intro: string } };
  policies: Record<PolicyKey, string>;
}

export type PolicyKey = "privacy" | "terms" | "refunds" | "shipping";

export interface Quote {
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  giftWrapTotal: number;
  shipping: number;
  shippingRateId: string;
  shippingLabel: string;
  tax: number;
  taxRate: number;
  giftCardApplied: number;
  total: number;
  promo?: { code: string; description: string };
  giftCard?: { code: string; remaining: number };
  freeShippingRemaining: number;
  errors: string[];
}
