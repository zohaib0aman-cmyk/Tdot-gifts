"use client";
import { AnimatePresence, m } from "framer-motion";
import { Check, Cookie, Home, Info, Search, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { CartIcon, HeartIcon } from "./icons";
import { ProductImage } from "./product-image";
import { buttonClass } from "./ui";
import { cartCount, useCart, useHydrated, useToasts, useUI, useWishlist } from "@/lib/client-store";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ mobile bottom bar */
export function BottomNav() {
  const pathname = usePathname();
  const { lines, bump } = useCart();
  const wish = useWishlist((s) => s.ids.length);
  const { setCart, setSearch, searchOpen, cartOpen } = useUI();
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(lines) : 0;
  const items = [
    { key: "home", label: "Home", href: "/", icon: <Home size={21} strokeWidth={1.7} />, active: pathname === "/" && !searchOpen && !cartOpen },
    { key: "search", label: "Search", onClick: () => setSearch(true), icon: <Search size={21} strokeWidth={1.7} />, active: searchOpen },
    { key: "wish", label: "Wishlist", href: "/account/wishlist", icon: <HeartIcon active={hydrated && wish > 0} size={21} />, active: pathname === "/account/wishlist" },
    { key: "cart", label: "Cart", onClick: () => setCart(true), icon: <CartIcon count={count} bump={bump} />, active: cartOpen || pathname === "/cart" },
    { key: "account", label: "Account", href: "/account", icon: <User size={21} strokeWidth={1.7} />, active: pathname.startsWith("/account") && pathname !== "/account/wishlist" },
  ];
  if (pathname.startsWith("/checkout")) return null;
  return (
    <nav aria-label="Quick navigation" className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((it) => {
          const inner = (
            <>
              <span className="relative">
                {it.active && <m.span layoutId="bottom-pill" className="absolute -inset-x-3 -inset-y-1.5 rounded-full bg-blush" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{it.icon}</span>
              </span>
              <span className={cn("text-[0.65rem] font-semibold tracking-wide", it.active ? "text-fg" : "text-muted")}>{it.label}</span>
            </>
          );
          const cls = "flex min-h-[60px] w-full flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform";
          return (
            <li key={it.key}>
              {it.href ? (
                <Link href={it.href} className={cls} aria-current={it.active ? "page" : undefined}>{inner}</Link>
              ) : (
                <button type="button" onClick={it.onClick} className={cls}>{inner}</button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------ toasts */
export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[84px] z-[80] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:right-6 lg:left-auto lg:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <m.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-3 pr-2 shadow-lift"
            role="status"
          >
            {t.image ? (
              <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2"><ProductImage src={t.image} alt="" fill sizes="40px" /></span>
            ) : (
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", t.tone === "error" ? "bg-rose/12 text-rose" : t.tone === "info" ? "bg-surface-2 text-fg" : "bg-gold/20 text-gold-ink")}>
                {t.tone === "error" ? <X size={18} /> : t.tone === "info" ? <Info size={18} /> : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><m.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} /></svg>
                )}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{t.title}</p>
              {t.description && <p className="truncate text-xs text-muted">{t.description}</p>}
            </div>
            {t.action && (t.action.href ? (
              <Link href={t.action.href} onClick={() => dismiss(t.id)} className="shrink-0 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-gold-ink hover:bg-surface-2">{t.action.label}</Link>
            ) : (
              <button onClick={() => { t.action?.onClick?.(); dismiss(t.id); }} className="shrink-0 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider text-gold-ink hover:bg-surface-2">{t.action.label}</button>
            ))}
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2"><X size={16} /></button>
            <m.span className="absolute bottom-0 left-0 h-0.5 bg-gold" initial={{ width: "100%" }} animate={{ width: 0 }} transition={{ duration: 4.2, ease: "linear" }} />
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------ cookie consent */
const CONSENT_KEY = "gs-cookie-consent";
const subscribe = (cb: () => void) => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); };
const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return "unavailable"; } };

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, readConsent, () => "ssr");
  const [closed, setClosed] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const decide = (v: "all" | "essential") => {
    try { localStorage.setItem(CONSENT_KEY, v); } catch { /* ignore */ }
    setClosed(true);
  };
  const show = !closed && consent === null;
  return (
    <AnimatePresence>
      {show && (
        <m.div role="dialog" aria-label="Cookie preferences" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 1.2 }} className="fixed inset-x-3 bottom-[76px] z-[70] mx-auto max-w-lg rounded-3xl border border-line bg-surface p-5 shadow-lift lg:bottom-6 lg:left-6 lg:right-auto">
          <div className="flex gap-4">
            <m.span animate={{ rotate: [0, -12, 10, 0] }} transition={{ duration: 1.2, delay: 1.8 }} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blush text-gold-ink"><Cookie size={22} /></m.span>
            <div className="space-y-1">
              <p className="font-display text-lg">A sweet note about cookies</p>
              <p className="text-sm leading-relaxed text-muted">We use essential cookies to keep your cart and wishlist safe, and optional analytics to improve the store. <Link href="/policies/privacy" className="underline underline-offset-2">Privacy Policy</Link></p>
            </div>
          </div>
          <AnimatePresence>
            {prefs && (
              <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 space-y-2 rounded-2xl bg-surface-2 p-3 text-sm">
                  <div className="flex min-h-11 items-center justify-between"><span>Essential (cart, checkout, security)</span><span className="flex items-center gap-1 text-xs font-semibold text-muted"><Check size={14} /> Always on</span></div>
                  <label className="flex min-h-11 cursor-pointer items-center justify-between"><span>Analytics</span>
                    <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-line transition before:block before:h-4 before:w-4 before:translate-x-0.5 before:rounded-full before:bg-white before:shadow before:transition checked:bg-ink checked:before:translate-x-[18px]" />
                  </label>
                </div>
              </m.div>
            )}
          </AnimatePresence>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => decide("all")} className={buttonClass("primary", "sm", "flex-1")}>Accept all</button>
            {prefs ? (
              <button onClick={() => decide(analytics ? "all" : "essential")} className={buttonClass("outline", "sm", "flex-1")}>Save choices</button>
            ) : (
              <button onClick={() => decide("essential")} className={buttonClass("outline", "sm", "flex-1")}>Essential only</button>
            )}
            {!prefs && <button onClick={() => setPrefs(true)} className="min-h-10 px-3 text-sm font-semibold text-muted underline-offset-2 hover:underline">Preferences</button>}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
