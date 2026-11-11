"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function RailButtons({ target }: { target: string }) {
  const scroll = (d: number) => { const el = document.getElementById(target); el?.scrollBy({ left: d * el.clientWidth * 0.8, behavior: "smooth" }); };
  return (
    <div className="hidden gap-2 sm:flex">
      <button onClick={() => scroll(-1)} aria-label="Scroll left" className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface transition hover:border-gold"><ArrowLeft size={18} /></button>
      <button onClick={() => scroll(1)} aria-label="Scroll right" className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface transition hover:border-gold"><ArrowRight size={18} /></button>
    </div>
  );
}
