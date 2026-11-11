import { z } from "zod";

const slug = z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes");
const img = z.string().trim().min(1).max(2_500_000).refine((s) => s.startsWith("/") || s.startsWith("https://") || s.startsWith("data:image/"), "Image must be an uploaded file or https URL");

export const productSchema = z.object({
  id: z.string().max(64).optional(),
  slug,
  name: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(200).default(""),
  description: z.string().trim().max(5000).default(""),
  details: z.array(z.string().trim().max(200)).max(20).default([]),
  price: z.number().min(0).max(100000),
  compareAtPrice: z.number().min(0).max(100000).optional(),
  images: z.array(img).min(1, "Add at least one image").max(10),
  category: z.string().min(1).max(60),
  occasions: z.array(z.string().max(40)).max(20).default([]),
  recipients: z.array(z.string().max(40)).max(20).default([]),
  tags: z.array(z.string().trim().max(40)).max(30).default([]),
  variants: z.object({ name: z.string().trim().min(1).max(40), options: z.array(z.object({ id: z.string().max(40), label: z.string().trim().min(1).max(60), price: z.number().min(0).max(100000), stock: z.number().int().min(0).max(100000), sku: z.string().max(60).optional() })).min(1).max(20) }).optional(),
  stock: z.number().int().min(0).max(100000),
  bestseller: z.boolean().optional(),
  isNew: z.boolean().optional(),
  featured: z.boolean().optional(),
  deliveryDays: z.number().int().min(0).max(30),
  status: z.enum(["active", "draft", "archived"]),
});

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color");
const link = z.object({ label: z.string().trim().min(1).max(60), href: z.string().trim().min(1).max(300).refine((h) => h.startsWith("/") || h.startsWith("https://") || h.startsWith("mailto:"), "Links must start with / or https://") });
const optUrl = z.string().trim().max(300).refine((h) => !h || h.startsWith("https://"), "Use an https:// URL");

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(200),
  logoUrl: img,
  logoMode: z.enum(["badge", "wordmark", "badge+wordmark"]),
  colors: z.object({ primary: hex, accent: hex, blush: hex, cream: hex }),
  font: z.enum(["classic", "modern", "romantic", "editorial"]),
  announcement: z.object({ enabled: z.boolean(), messages: z.array(z.string().trim().max(120)).max(6) }),
  hero: z.object({ eyebrow: z.string().max(80), title: z.string().max(80), highlight: z.string().max(80), subtitle: z.string().max(300), ctaLabel: z.string().max(40), ctaHref: z.string().max(200), secondaryLabel: z.string().max(40), secondaryHref: z.string().max(200) }),
  homeSections: z.array(z.object({ key: z.enum(["occasions", "recipients", "bestsellers", "story", "newArrivals", "quiz", "reviews", "instagram", "newsletter"]), label: z.string().max(60), visible: z.boolean() })).max(12),
  footerColumns: z.array(z.object({ title: z.string().trim().min(1).max(40), links: z.array(link).max(10) })).max(4),
  social: z.object({ instagram: optUrl, facebook: optUrl, tiktok: optUrl, pinterest: optUrl, whatsapp: optUrl }),
  contact: z.object({ email: z.email(), phone: z.string().max(40), hours: z.string().max(80), serviceArea: z.string().max(160) }),
  freeShippingThreshold: z.number().min(0).max(10000),
  giftWrapPrice: z.number().min(0).max(500),
  shippingRates: z.array(z.object({ id: z.string().max(40), carrier: z.enum(["usps", "ups", "fedex"]), name: z.string().trim().min(1).max(60), eta: z.string().max(60), price: z.number().min(0).max(1000), minDays: z.number().int().min(0).max(30), maxDays: z.number().int().min(0).max(30), enabled: z.boolean() })).min(1).max(12),
  taxRates: z.record(z.string().length(2), z.number().min(0).max(20)),
  emailTemplates: z.object({
    orderConfirmation: z.object({ subject: z.string().max(160), intro: z.string().max(1000) }),
    shipped: z.object({ subject: z.string().max(160), intro: z.string().max(1000) }),
    giftCard: z.object({ subject: z.string().max(160), intro: z.string().max(1000) }),
  }),
  policies: z.object({ privacy: z.string().max(30000), terms: z.string().max(30000), refunds: z.string().max(30000), shipping: z.string().max(30000) }),
});
