import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal primitives. Pure markup + CSS: a single IntersectionObserver
 * (<RevealObserver/>, mounted once in the layout) toggles `is-visible`.
 * No per-element hydration, LCP-safe (content is visible without JS), and
 * reduced-motion users get no transforms.
 */
type Tag = "div" | "section" | "li" | "ul";

export function Reveal({ children, className, delay = 0, as: As = "div" }: { children: ReactNode; className?: string; delay?: number; y?: number; as?: Tag }) {
  return (
    <As data-reveal="" className={className} style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}>
      {children}
    </As>
  );
}

export function Stagger({ children, className, as: As = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" }) {
  return (
    <As data-stagger="" className={className}>
      {children}
    </As>
  );
}

export function StaggerItem({ children, className, as: As = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  return <As data-stagger-item="" className={cn(className)}>{children}</As>;
}
