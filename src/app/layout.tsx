import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cormorant_Garamond, DM_Sans, Fraunces, Great_Vibes, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getSettings } from "@/lib/db";
import { themeScript } from "@/lib/theme";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script-face", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cormorant", display: "swap", preload: false });
const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", preload: false });
const dmsans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans", display: "swap", preload: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${s.storeName} — Luxury Gifts, Flowers & Birthday Surprises`, template: `%s · ${s.storeName}` },
    description: "Red rose bouquets, celebration cakes, cupcakes, treat baskets, teddy bears and full surprise setups delivered across the USA. Order from anywhere in the world.",
    keywords: ["gift delivery USA", "birthday surprise", "rose bouquet delivery", "flower delivery", "surprise planner", "anniversary gifts", "teddy bear delivery"],
    openGraph: { type: "website", siteName: s.storeName, locale: "en_US", url: siteUrl },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#faf6ef" }, { media: "(prefers-color-scheme: dark)", color: "#110c0d" }],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const hex = (v: string, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback);

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const brandCss = `:root{--brand-primary:${hex(s.colors.primary, "#16110f")};--brand-accent:${hex(s.colors.accent, "#c9a14a")};--brand-blush:${hex(s.colors.blush, "#f2dcdf")};--brand-cream:${hex(s.colors.cream, "#faf6ef")}}`;
  const pub = {
    storeName: s.storeName, tagline: s.tagline, logoUrl: s.logoUrl, logoMode: s.logoMode, announcement: s.announcement, social: s.social,
    contact: s.contact, freeShippingThreshold: s.freeShippingThreshold, giftWrapPrice: s.giftWrapPrice, footerColumns: s.footerColumns,
  };
  return (
    <html
      lang="en-US"
      data-font={s.font}
      suppressHydrationWarning
      className={`${playfair.variable} ${manrope.variable} ${script.variable} ${cormorant.variable} ${bodoni.variable} ${fraunces.variable} ${dmsans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style id="brand-vars" dangerouslySetInnerHTML={{ __html: brandCss }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only z-[100] rounded-full bg-ink px-4 py-3 text-on-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
        <Providers settings={pub}>{children}</Providers>
      </body>
    </html>
  );
}
