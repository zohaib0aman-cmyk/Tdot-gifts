# Gifts & Surprises USA — storefront + admin

A premium e-commerce site for **Gifts & Surprises USA** ([@gifts.surprises.usa](https://www.instagram.com/gifts.surprises.usa/)): rose hatboxes, gift boxes, cakes, teddy bears and full surprise setups, delivered across the USA and orderable from anywhere in the world.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide · Supabase (Postgres, Auth, Storage) · Stripe (test mode) · PayPal sandbox · Resend.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — the store runs without any keys
npm run dev                  # http://localhost:3000
```

With **no environment variables** the app runs in **demo mode**:

| Feature | Demo mode (no keys) | Production mode (keys set) |
|---|---|---|
| Data | Seeded in-process store, saved to `.data/db.json` | Supabase `documents` table |
| Customer auth | Local accounts (scrypt-hashed passwords) | Supabase Auth |
| Card / Apple Pay / Google Pay | Built-in test processor (`4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` declines) | Stripe Payment Element in test mode + webhook |
| PayPal | Test-mode PayPal button | PayPal JS SDK (sandbox) + server capture |
| Emails | Rendered and logged in **Admin → Inbox & emails** | Sent with Resend (and logged) |
| Image uploads | Compressed WebP stored inline with the product | Supabase Storage bucket `product-images` |

### Admin panel

`/admin` — protected by a signed, HTTP-only session cookie (checked in `src/proxy.ts` **and** on every admin API route).

Demo credentials (only when `ADMIN_PASSWORD` is not set): `admin@giftsandsurprises.us` / `Surprise2026!`

---

## Connecting real services

### Supabase
1. Create a project, open **SQL editor** and run [`supabase/schema.sql`](supabase/schema.sql).
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. On first request the app seeds the catalog (24 products, reviews, demo orders, settings).

RLS is enabled with no public policies — the browser never touches the database; all access goes through server routes with the service-role key.

### Stripe (test mode)
1. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_…`) and `STRIPE_SECRET_KEY` (`sk_test_…`).
2. Enable Apple Pay / Google Pay / Link in the Stripe dashboard (Payment methods). The Payment Element shows them automatically on supported devices.
3. Webhook: point `https://YOUR_DOMAIN/api/stripe/webhook` at events `payment_intent.succeeded` and `payment_intent.payment_failed`, then set `STRIPE_WEBHOOK_SECRET`. Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
4. Refunds from **Admin → Orders → Refund** call the Stripe Refunds API.

### PayPal (sandbox)
Set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` from a sandbox REST app.

### Email
Set `RESEND_API_KEY` and `EMAIL_FROM` (verified domain). Order confirmation, shipped, gift-card and refund emails are sent automatically; templates are editable in **Admin → Settings → Emails**.

---

## What's inside

**Storefront** — animated hero gift box with confetti · shop by occasion & recipient · best sellers · new arrivals · gift-finder quiz · reviews marquee · Instagram feed · newsletter · shop with filters (price, occasion, recipient, category), sort, live search & grid/list toggle · product page with zoom gallery, variants, stock status, gift wrap, gift message, delivery-date picker, reviews & related products · cart drawer + full cart with promo codes & free-shipping progress · checkout (guest, US states, USPS/UPS/FedEx rates, state sales tax, gift cards, Stripe / Apple Pay / Google Pay / PayPal) · success / failed / cancelled screens · order tracking timeline · accounts (orders, addresses, wishlist) · gift cards (buy & redeem) · About, Contact, FAQ, Privacy, Terms, Refunds, Shipping · cookie consent · custom 404 · light/dark mode.

**Admin** — dashboard (revenue chart, KPIs, top products, low stock) · products (images, variants, stock, categories, occasions, CSV bulk upload) · orders (filters, status, tracking, refunds, printable invoice, CSV export) · customers · promo codes & gift cards · review moderation · contact inbox & email log · no-code customization (logo, colors, fonts, hero, homepage section order/visibility, announcement bar, footer & social links) · settings (shipping rates, free-shipping threshold, tax by state, email templates, policies editor).

**Quality** — mobile-first (375px), bottom tab bar on phones, ≥44px tap targets · `prefers-reduced-motion` respected · skeleton loaders · SEO metadata, Open Graph images, sitemap, robots, Product / Breadcrumb / FAQ / Store JSON-LD · zod validation on every API · rate limiting · CSRF origin checks · security headers · no secrets in client bundles.

## Product imagery

All product, homepage and Instagram-section images are the brand's own photography (`public/photos/`, cropped and converted to WebP). Add or replace photos from **Admin → Products → (product) → Images** — uploads are compressed to WebP in the browser before upload.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test:e2e` | Playwright end-to-end flows (browse → cart → checkout → pay → admin update) |
| `npm run reset-demo` | Reset the local demo database |
