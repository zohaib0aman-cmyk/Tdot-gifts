import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { InstagramGlyph } from "@/components/icons";
import { Container } from "@/components/ui";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Contact Us", description: "Message our surprise planners to order, book a setup or ask anything. We reply fast — from anywhere in the world." };

export default async function ContactPage() {
  const s = await getSettings();
  const items = [
    { icon: Mail, label: "Email", value: s.contact.email, href: `mailto:${s.contact.email}` },
    { icon: Phone, label: "Phone & WhatsApp", value: s.contact.phone, href: `tel:${s.contact.phone.replace(/[^\d+]/g, "")}` },
    { icon: InstagramGlyph, label: "Instagram DM", value: "@gifts.surprises.usa", href: s.social.instagram },
    { icon: Clock, label: "Hours", value: s.contact.hours },
    { icon: MapPin, label: "Coverage", value: s.contact.serviceArea },
  ];
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Message to order · book · enquire</p>
          <h1 className="mt-2 text-4xl sm:text-6xl">Let&apos;s plan something <em className="gold-text">unforgettable</em></h1>
          <p className="mt-4 text-muted">Whether you&apos;re across town or across the world, our surprise planners are here to help you design the perfect moment.</p>
          <ul className="mt-8 space-y-3">
            {items.map((i) => {
              const inner = (<><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blush text-gold-ink"><i.icon className="h-5 w-5" /></span><span><span className="block text-xs font-bold uppercase tracking-[0.16em] text-muted">{i.label}</span><span className="text-sm font-semibold">{i.value}</span></span></>);
              return <li key={i.label}>{i.href ? <a href={i.href} target={i.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex min-h-14 items-center gap-4 rounded-2xl p-2 transition hover:bg-surface">{inner}</a> : <div className="flex min-h-14 items-center gap-4 p-2">{inner}</div>}</li>;
            })}
          </ul>
        </div>
        <ContactForm />
      </div>
    </Container>
  );
}
