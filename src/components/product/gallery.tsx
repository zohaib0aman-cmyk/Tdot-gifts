"use client";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductImage } from "../product-image";
import { cn } from "@/lib/utils";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const go = (n: number) => {
    const next = (n + images.length) % images.length;
    setI(next);
    scroller.current?.scrollTo({ left: next * scroller.current.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setI((x) => (x + 1) % images.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox, images.length]);

  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative">
        {/* mobile: swipe carousel */}
        <div ref={scroller} onScroll={(e) => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)); }} className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0 lg:hidden">
          {images.map((src, n) => (
            <button key={src} type="button" onClick={() => { setI(n); setLightbox(true); }} className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-surface-2 sm:rounded-[2rem]" aria-label={`Open image ${n + 1} of ${images.length} full screen`}>
              <ProductImage src={src} alt={n === 0 ? name : `${name} — view ${n + 1}`} fill priority={n === 0} sizes="100vw" />
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden>
          {images.map((_, n) => <m.span key={n} className="h-1.5 rounded-full bg-ink" animate={{ width: n === i ? 22 : 6, opacity: n === i ? 1 : 0.25 }} />)}
        </div>

        {/* desktop: hover zoom */}
        <div
          className={cn("relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] bg-surface-2 shadow-soft lg:block", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <m.div key={images[i]} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <ProductImage src={images[i]} alt={i === 0 ? name : `${name} — view ${i + 1}`} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="transition-transform duration-200 ease-out" style={zoom ? { transform: "scale(2.1)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />
            </m.div>
          </AnimatePresence>
          <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-2 text-xs font-semibold shadow-soft backdrop-blur"><ZoomIn size={14} /> Hover to zoom · click to expand</span>
          <button type="button" onClick={(e) => { e.stopPropagation(); go(i - 1); }} aria-label="Previous image" className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-surface/90 shadow-soft"><ChevronLeft size={20} /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); go(i + 1); }} aria-label="Next image" className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-surface/90 shadow-soft"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="mt-4 hidden gap-3 lg:flex">
        {images.map((src, n) => (
          <button key={src} type="button" onClick={() => setI(n)} aria-label={`Show image ${n + 1}`} aria-current={n === i} className={cn("relative aspect-[4/5] w-24 overflow-hidden rounded-2xl bg-surface-2 ring-2 ring-offset-2 ring-offset-bg transition", n === i ? "ring-gold" : "ring-transparent opacity-70 hover:opacity-100")}>
            <ProductImage src={src} alt="" fill sizes="96px" />
          </button>
        ))}
        <button type="button" onClick={() => setLightbox(true)} className="grid aspect-[4/5] w-24 place-items-center rounded-2xl border border-dashed border-line text-muted hover:text-fg" aria-label="Open full-screen gallery"><Expand size={20} /></button>
      </div>

      <AnimatePresence>
        {lightbox && (
          <m.div role="dialog" aria-modal="true" aria-label={`${name} gallery`} className="fixed inset-0 z-[90] flex flex-col bg-black/95 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <span className="px-3 text-sm tabular-nums text-white/70">{i + 1} / {images.length}</span>
              <button autoFocus onClick={() => setLightbox(false)} className="grid h-12 w-12 place-items-center rounded-full hover:bg-white/10" aria-label="Close gallery"><X size={22} /></button>
            </div>
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.div key={i} className="absolute inset-0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => { if (info.offset.x < -60) setI((x) => (x + 1) % images.length); if (info.offset.x > 60) setI((x) => (x - 1 + images.length) % images.length); }}>
                  <m.div className="relative h-full w-full" whileTap={{ scale: 1.6 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
                    <ProductImage src={images[i]} alt={name} fill sizes="100vw" className="!object-contain" />
                  </m.div>
                </m.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button onClick={() => setI((x) => (x - 1 + images.length) % images.length)} className="grid h-12 w-12 place-items-center rounded-full bg-white/10" aria-label="Previous image"><ChevronLeft /></button>
              <button onClick={() => setI((x) => (x + 1) % images.length)} className="grid h-12 w-12 place-items-center rounded-full bg-white/10" aria-label="Next image"><ChevronRight /></button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
