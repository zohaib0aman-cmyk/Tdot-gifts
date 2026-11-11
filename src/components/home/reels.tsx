"use client";
import { Play, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container, SectionHeading } from "../ui";
import { cn } from "@/lib/utils";

export type Reel = { src: string; poster: string; caption: string; place?: string; href: string; product: string };

/** One vertical video: plays only while on screen (saves data & battery), muted by default. */
function ReelCard({ reel, index }: { reel: Reel; index: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.6 && !reduce) v.play().catch(() => {});
      else v.pause();
    }, { threshold: [0, 0.6, 1] });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <figure className="group relative w-[68%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] bg-[#140e0f] shadow-lift sm:w-[44%] lg:w-auto">
      <video
        ref={ref}
        src={reel.src}
        poster={reel.poster}
        muted={muted}
        loop
        playsInline
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={(e) => { const v = e.currentTarget; if (v.paused) v.play().catch(() => {}); else v.pause(); }}
        className="aspect-[9/16] w-full cursor-pointer object-cover"
        aria-label={`Delivery video ${index + 1}: ${reel.caption}`}
      />
      {!playing && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#140e0f] shadow-lift"><Play size={22} className="ml-0.5" fill="currentColor" /></span>
      )}
      <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute video" : "Mute video"} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white backdrop-blur">
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-16 text-white">
        {reel.place && <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#f3dc92]">📍 {reel.place}</p>}
        <p className="mt-1 font-display text-lg leading-snug">{reel.caption}</p>
        <Link href={reel.href} className="mt-2 inline-flex min-h-10 items-center rounded-full bg-white/90 px-4 text-xs font-bold text-[#140e0f] transition hover:bg-white">Shop: {reel.product}</Link>
      </figcaption>
    </figure>
  );
}

export function DeliveryReels({ reels }: { reels: Reel[] }) {
  return (
    <section className="py-16 sm:py-24" aria-labelledby="reels-h">
      <Container>
        <SectionHeading eyebrow="Real deliveries" title={<span id="reels-h">Watch the <em className="gold-text">magic</em> happen</span>} sub="Every surprise is filmed — tap a video to play, pause or turn the sound on." />
      </Container>
      <div className={cn("no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6", "lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-4 lg:overflow-visible lg:px-8")}>
        {reels.map((r, i) => <ReelCard key={r.src} reel={r} index={i} />)}
      </div>
    </section>
  );
}
