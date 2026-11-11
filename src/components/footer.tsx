import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { LogoBadge, Wordmark } from "./brand";
import { FacebookGlyph, InstagramGlyph, PinterestGlyph, TikTokGlyph, WhatsAppGlyph } from "./icons";
import { Container } from "./ui";
import type { SiteSettings } from "@/lib/types";

const PAY = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "PayPal"];

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: settings.social.instagram, label: "Instagram", Icon: InstagramGlyph },
    { href: settings.social.facebook, label: "Facebook", Icon: FacebookGlyph },
    { href: settings.social.tiktok, label: "TikTok", Icon: TikTokGlyph },
    { href: settings.social.pinterest, label: "Pinterest", Icon: PinterestGlyph },
    { href: settings.social.whatsapp, label: "WhatsApp", Icon: WhatsAppGlyph },
  ].filter((s) => s.href);
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#140e0f] pb-28 pt-16 text-[#efe5da] lg:pb-10">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(201,161,74,.18),transparent)]" aria-hidden />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <LogoBadge src={settings.logoUrl} size={60} />
              <Wordmark className="[&_*]:text-inherit" />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#cdbfb3]">{settings.tagline}. Order from anywhere in the world — we plan, wrap and hand-deliver your surprise across the USA.</p>
            <ul className="space-y-2 text-sm text-[#cdbfb3]">
              <li><a href={`mailto:${settings.contact.email}`} className="inline-flex min-h-10 items-center gap-2 hover:text-white"><Mail size={15} className="text-gold" /> {settings.contact.email}</a></li>
              <li><a href={`tel:${settings.contact.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-10 items-center gap-2 hover:text-white"><Phone size={15} className="text-gold" /> {settings.contact.phone} · {settings.contact.hours}</a></li>
              <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-gold" /> {settings.contact.serviceArea}</li>
            </ul>
            <div className="flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="group grid h-11 w-11 place-items-center rounded-full border border-white/15 transition hover:-translate-y-0.5 hover:border-gold hover:text-gold">
                  <Icon className="h-[18px] w-[18px] transition group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {settings.footerColumns.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.24em] text-gold">{col.title}</p>
                <ul className="space-y-1">
                  {col.links.map((l) => (
                    <li key={l.label + l.href}><Link href={l.href} className="inline-flex min-h-10 items-center text-sm text-[#cdbfb3] transition hover:translate-x-0.5 hover:text-white">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#a89a8f]">© {new Date().getFullYear()} {settings.storeName}. Made with love for every surprise.</p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {PAY.map((p) => <li key={p} className="rounded-md border border-white/15 px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-[#d9cbbd]">{p}</li>)}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
