"use client";
import { m } from "framer-motion";
import Link from "next/link";
import { buttonClass } from "./ui";

export function NotFoundView() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative h-44 w-44">
        <m.svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
          <defs><linearGradient id="nf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e3a1" /><stop offset=".5" stopColor="#c9a14a" /><stop offset="1" stopColor="#9c7a2e" /></linearGradient></defs>
          <ellipse cx="100" cy="180" rx="60" ry="8" fill="currentColor" opacity=".08" />
          <rect x="45" y="95" width="110" height="80" rx="8" fill="#16110f" />
          <rect x="91" y="95" width="18" height="80" fill="url(#nf)" />
          <m.g animate={{ y: [0, -22, -16, -22], rotate: [0, -14, -8, -14] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} style={{ transformOrigin: "100px 95px" }}>
            <rect x="38" y="78" width="124" height="22" rx="6" fill="#241b1d" />
            <rect x="91" y="78" width="18" height="22" fill="url(#nf)" />
            <path d="M100 80 C 80 55 58 66 66 80 C 72 90 88 86 100 80Z M100 80 C 120 55 142 66 134 80 C 128 90 112 86 100 80Z" fill="url(#nf)" />
          </m.g>
          <m.text x="100" y="72" textAnchor="middle" fontSize="28" animate={{ opacity: [0, 1, 0], y: [80, 50, 30] }} transition={{ duration: 2.4, repeat: Infinity }}>?</m.text>
        </m.svg>
      </div>
      <p className="mt-4 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink">Error 404</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">This box is empty!</h1>
      <p className="mt-3 text-muted">The page you&apos;re looking for has been moved, unwrapped, or never existed. Let&apos;s find you something better.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonClass("primary", "lg")}>Back to home</Link>
        <Link href="/shop" className={buttonClass("outline", "lg")}>Browse gifts</Link>
      </div>
    </div>
  );
}
