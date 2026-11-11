"use client";
import { AnimatePresence, m } from "framer-motion";
import { ExternalLink, Inbox, LayoutDashboard, LogOut, MessageSquareQuote, Package, Palette, Settings, ShoppingCart, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogoBadge } from "../brand";
import { ThemeToggle } from "../header";
import { MenuIcon } from "../icons";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/inbox", label: "Inbox & emails", icon: Inbox },
  { href: "/admin/customize", label: "Customize", icon: Palette },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavList({ onNavigate, counts }: { onNavigate?: () => void; counts: Record<string, number> }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {ADMIN_NAV.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        const c = counts[n.href];
        return (
          <li key={n.href}>
            <Link href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition", active ? "text-on-ink" : "text-muted hover:bg-surface-2 hover:text-fg")}>
              {active && <m.span layoutId="admin-nav" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <n.icon size={18} className="relative" />
              <span className="relative flex-1">{n.label}</span>
              {c ? <span className={cn("relative rounded-full px-2 py-0.5 text-[0.65rem] font-bold", active ? "bg-gold text-[#2a1d06]" : "bg-rose text-white")}>{c}</span> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({ children, email, counts, storeName, logoUrl, backend }: { children: React.ReactNode; email: string; counts: Record<string, number>; storeName: string; logoUrl: string; backend: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [prev, setPrev] = useState(pathname);
  if (prev !== pathname) { setPrev(pathname); setOpen(false); }
  const logout = async () => { await fetch("/api/admin/login", { method: "DELETE" }); router.push("/admin/login"); router.refresh(); };
  const brand = (
    <Link href="/admin" className="flex items-center gap-3 px-2">
      <LogoBadge src={logoUrl} size={40} />
      <span className="leading-tight"><span className="block font-display text-base">{storeName}</span><span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold-ink">Admin</span></span>
    </Link>
  );
  const footer = (
    <div className="space-y-2 border-t border-line pt-4">
      <div className="flex items-center justify-between px-2 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", backend === "supabase" ? "bg-emerald-500" : "bg-amber-500")} />{backend === "supabase" ? "Supabase connected" : "Demo data store"}</span>
        <ThemeToggle />
      </div>
      <Link href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"><ExternalLink size={17} /> View store</Link>
      <button onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"><LogOut size={17} /> Sign out <span className="ml-auto truncate text-xs">{email}</span></button>
    </div>
  );
  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-line bg-surface p-4 lg:flex">
        <div className="pt-2">{brand}</div>
        <nav className="flex-1 overflow-y-auto" aria-label="Admin"><NavList counts={counts} /></nav>
        {footer}
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-2 backdrop-blur-xl lg:hidden">
          <button onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2"><MenuIcon open={open} /></button>
          {brand}
          <Link href="/" target="_blank" aria-label="View store" className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2"><ExternalLink size={19} /></Link>
        </header>
        <AnimatePresence>
          {open && (
            <>
              <m.div className="fixed inset-0 z-40 bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <m.nav aria-label="Admin" className="fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-xs flex-col gap-6 bg-surface p-4 shadow-lift lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 340, damping: 36 }}>
                <div className="pt-2">{brand}</div>
                <div className="flex-1 overflow-y-auto"><NavList counts={counts} onNavigate={() => setOpen(false)} /></div>
                {footer}
              </m.nav>
            </>
          )}
        </AnimatePresence>
        <main id="main" className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden" aria-label="Admin quick navigation">
          <ul className="grid grid-cols-5">
            {[ADMIN_NAV[0], ADMIN_NAV[1], ADMIN_NAV[2], ADMIN_NAV[7], { href: "/admin/settings", label: "Settings", icon: Settings }].map((n) => {
              const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link href={n.href} className={cn("flex min-h-[60px] flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold", active ? "text-fg" : "text-muted")}>
                    <span className={cn("grid h-8 w-12 place-items-center rounded-full transition", active && "bg-blush")}><n.icon size={19} /></span>{n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-line bg-surface p-4 shadow-soft sm:p-6", className)}>
      {(title || action) && <div className="mb-4 flex items-center justify-between gap-3">{title && <h2 className="font-display text-xl">{title}</h2>}{action}</div>}
      {children}
    </section>
  );
}


