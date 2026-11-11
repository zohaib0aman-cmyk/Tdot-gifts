import "server-only";

/** Centralised server-side environment access. Never import this from client components. */
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  stripeSecret: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripePublishable: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  paypalSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  paypalApi: process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com",
  resendKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "Gifts & Surprises USA <orders@giftsandsurprises.us>",
  adminEmail: (process.env.ADMIN_EMAIL || "admin@giftsandsurprises.us").toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "Surprise2026!",
  sessionSecret: process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me-please-0123456789",
};

export const hasSupabase = () => Boolean(env.supabaseUrl && env.supabaseServiceKey);
export const hasStripe = () => Boolean(env.stripeSecret && env.stripePublishable);
export const hasPayPal = () => Boolean(env.paypalClientId && env.paypalSecret);
export const isDemoAdminPassword = () => !process.env.ADMIN_PASSWORD;
