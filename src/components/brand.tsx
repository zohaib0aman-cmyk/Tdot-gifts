import Image from "next/image";
import { cn } from "@/lib/utils";

export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="font-display text-[1.06rem] font-bold uppercase tracking-[0.08em] sm:text-[1.2rem]">
        Gifts <span className="font-script text-[1.35em] font-normal normal-case text-gold-ink">&amp;</span> Surprises
      </span>
      {!compact && (
        <span className="mt-0.5 flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.5em] text-gold-ink">
          <span className="h-px w-4 bg-gold" aria-hidden /> USA <span className="h-px w-4 bg-gold" aria-hidden />
        </span>
      )}
    </span>
  );
}

export function LogoBadge({ src, size = 44, className, priority }: { src: string; size?: number; className?: string; priority?: boolean }) {
  return (
    <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-gold/40 shadow-soft", className)} style={{ width: size, height: size }}>
      <Image src={src} alt="" fill sizes={`${size * 2}px`} className="object-cover" priority={priority} unoptimized={src.endsWith(".svg")} />
    </span>
  );
}

export function Logo({ logoUrl, mode, className }: { logoUrl: string; mode: "badge" | "wordmark" | "badge+wordmark"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mode !== "wordmark" && <LogoBadge src={logoUrl} size={mode === "badge" ? 52 : 42} priority />}
      {mode !== "badge" && <Wordmark />}
      <span className="sr-only">Gifts &amp; Surprises USA — home</span>
    </span>
  );
}
