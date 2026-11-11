"use client";
import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronDown, Moon, Search, Sun, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Logo } from "./brand";
import { CartIcon, HeartIcon, InstagramGlyph, MenuIcon } from "./icons";
import { useSettings } from "./providers";
import { HeaderSearch } from "./search";
import { CATEGORIES, OCCASIONS, RECIPIENTS } from "@/data/catalog";
import { cartCount, useCart, useHydrated, useUI, useWishlist } from "@/lib/client-store";
import { cn } from "@/lib/utils";

export function AnnouncementBar() {
  const { announcement } = useSettings();
  const [i, setI] = useState(0);
  const msgs = announcement.messages.filter(Boolean);
  useEffect(() => {
    if (msgs.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % msgs.length), 4500);
    return () => clearInterval(t);
  }, [msgs.length]);
  if (!announcement.enabled || !msgs.length) return null;
  return (
    <div className="relative z-40 h-9 overflow-hidden bg-ink text-on-ink">
      <AnimatePresence mode="wait">
        <m.p key={i} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35 }} className="flex h-9 items-center justify-center px-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
          <span className="mr-2 text-gold" aria-hidden>✦</span>
          <span className="truncate">{msgs[i % msgs.length]}</span>
        </m.p>
      </AnimatePresence>
    </div>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const dark = hydrated && resolvedTheme === "dark";
  return (
    <button type="button" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} className={cn("grid h-11 w-11 place-items-center rounded-full transition hover:text-gold-ink", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <m.span key={dark ? "moon" : "sun"} initial={{ rotate: -90, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.4, opacity: 0 }} transition={{ duration: 0.25 }}>
          {dark ? <Moon size={19} /> : <Sun size={20} />}
        </m.span>
      </AnimatePresence>
    </button>
  );
}

const NAV = [
  { label: "Shop all", href: "/shop" },
  { label: "Occasions", href: "/shop", mega: true },
  { label: "Surprise Packages", href: "/shop?category=surprise-packages" },
  { label: "Gift Cards", href: "/gift-cards" },
  { label: "Track Order", href: "/track" },
];

function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className="absolute left-1/2 top-full z-50 mt-3 w-[min(880px,92vw)] -translate-x-1/2 rounded-[2rem] border border-line bg-surface p-8 shadow-lift">
      <div className="grid grid-cols-3 gap-8">
        <div>
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold-ink">By occasion</p>
          <ul className="grid grid-cols-1 gap-1">
            {OCCASIONS.slice(0, 8).map((o) => (
              <li key={o.slug}><Link onClick={onClose} href={`/shop?occasion=${o.slug}`} className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm hover:bg-surface-2"><span aria-hidden>{o.emoji}</span>{o.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold-ink">By recipient</p>
          <ul className="grid grid-cols-1 gap-1">
            {RECIPIENTS.map((o) => (
              <li key={o.slug}><Link onClick={onClose} href={`/shop?recipient=${o.slug}`} className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm hover:bg-surface-2"><span aria-hidden>{o.emoji}</span>{o.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold-ink">Categories</p>
          <ul className="grid grid-cols-1 gap-1">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link onClick={onClose} href={`/shop?category=${c.slug}`} className="flex min-h-10 items-center rounded-xl px-2 text-sm hover:bg-surface-2">{c.name}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </m.div>
  );
}

export function Header() {
  const settings = useSettings();
  const { lines, bump } = useCart();
  const wish = useWishlist((s) => s.ids.length);
  const { setCart, menuOpen, setMenu, setSearch } = useUI();
  const hydrated = useHydrated();
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  const pathname = usePathname();
  const count = hydrated ? cartCount(lines) : 0;

  return (
    <header className={cn("sticky top-0 z-40 transition-[background,box-shadow,backdrop-filter] duration-500", scrolled ? "border-b border-line bg-bg/80 shadow-soft backdrop-blur-xl" : "bg-bg/0")}>
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between gap-2 px-2 transition-[height] duration-500 sm:px-6 lg:px-8", scrolled ? "h-16" : "h-[72px] lg:h-20")}>
        {/* left */}
        <div className="flex flex-1 items-center gap-1 lg:hidden">
          <button type="button" onClick={() => setMenu(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2">
            <MenuIcon open={menuOpen} />
          </button>
          <button type="button" onClick={() => setSearch(true)} aria-label="Search gifts" className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2">
            <Search size={20} />
          </button>
        </div>
        <Link href="/" className="flex shrink-0 items-center rounded-full" aria-label={`${settings.storeName} — home`}>
          <Logo logoUrl={settings.logoUrl} mode={settings.logoMode} />
        </Link>
        <nav aria-label="Main" className="relative hidden flex-1 justify-center lg:flex" onMouseLeave={() => setMega(false)}>
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.label} onMouseEnter={() => setMega(!!n.mega)}>
                {n.mega ? (
                  <button type="button" onClick={() => setMega((m) => !m)} aria-expanded={mega} className="group flex h-11 items-center gap-1 rounded-full px-4 text-[0.92rem] font-medium hover:text-gold-ink">
                    {n.label} <ChevronDown size={15} className={cn("transition", mega && "rotate-180")} />
                  </button>
                ) : (
                  <Link href={n.href} className={cn("relative flex h-11 items-center rounded-full px-4 text-[0.92rem] font-medium transition hover:text-gold-ink", pathname === n.href && "text-gold-ink")}>
                    {n.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <AnimatePresence>{mega && <MegaMenu onClose={() => setMega(false)} />}</AnimatePresence>
        </nav>
        {/* right */}
        <div className="flex flex-1 items-center justify-end gap-0.5 lg:flex-none">
          <HeaderSearch />
          <ThemeToggle className="hidden sm:grid" />
          <Link href="/account" aria-label="Account" className="hidden h-11 w-11 place-items-center rounded-full hover:text-gold-ink lg:grid"><User size={20} /></Link>
          <Link href="/account/wishlist" aria-label={`Wishlist (${hydrated ? wish : 0} items)`} className="relative hidden h-11 w-11 place-items-center rounded-full hover:text-gold-ink lg:grid">
            <HeartIcon active={hydrated && wish > 0} />
          </Link>
          <button type="button" onClick={() => setCart(true)} aria-label={`Open cart (${count} items)`} className="grid h-11 w-11 place-items-center rounded-full hover:text-gold-ink">
            <CartIcon count={count} bump={bump} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileMenu() {
  const { menuOpen, setMenu } = useUI();
  const settings = useSettings();
  const pathname = usePathname();
  const [prev, setPrev] = useState(pathname);
  if (prev !== pathname) { setPrev(pathname); if (menuOpen) setMenu(false); }
  return (
    <AnimatePresence>
      {menuOpen && (
        <>
          <m.div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
          <m.nav aria-label="Mobile" className="fixed inset-y-0 left-0 z-[56] flex w-[86vw] max-w-sm flex-col overflow-y-auto bg-surface pb-28 shadow-lift lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 340, damping: 36 }}>
            <div className="flex items-center justify-between border-b border-line p-4">
              <Logo logoUrl={settings.logoUrl} mode="badge+wordmark" />
              <button onClick={() => setMenu(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2" aria-label="Close menu"><MenuIcon open /></button>
            </div>
            <m.ul className="p-3" initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } } }}>
              {[{ label: "Home", href: "/" }, ...NAV.filter((n) => !n.mega), { label: "About us", href: "/about" }, { label: "Contact", href: "/contact" }].map((n) => (
                <m.li key={n.label} variants={{ h: { opacity: 0, x: -16 }, s: { opacity: 1, x: 0 } }}>
                  <Link href={n.href} className="flex min-h-12 items-center rounded-2xl px-3 font-display text-xl hover:bg-surface-2">{n.label}</Link>
                </m.li>
              ))}
            </m.ul>
            <div className="px-6 pt-2">
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold-ink">Shop by occasion</p>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <Link key={o.slug} href={`/shop?occasion=${o.slug}`} className="min-h-11 rounded-full border border-line px-3.5 py-2.5 text-sm">{o.emoji} {o.name}</Link>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between rounded-2xl bg-surface-2 p-3">
                <span className="text-sm font-medium">Appearance</span>
                <ThemeToggle />
              </div>
              <a href={settings.social.instagram} target="_blank" rel="noreferrer" className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl border border-line px-4 text-sm font-medium">
                <InstagramGlyph className="h-5 w-5" /> @gifts.surprises.usa
              </a>
            </div>
          </m.nav>
        </>
      )}
    </AnimatePresence>
  );
}
