import Link from "next/link";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn, money } from "@/lib/utils";

/* ------------------------------------------------------------ button */
type Variant = "primary" | "gold" | "outline" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg" | "icon";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-on-ink hover:opacity-90 shadow-soft",
  gold: "gold-bg text-[#2a1d06] shadow-soft hover:brightness-105",
  outline: "border border-line bg-surface/60 text-fg hover:border-gold hover:text-gold-ink backdrop-blur",
  ghost: "text-fg hover:bg-surface-2",
  soft: "bg-surface-2 text-fg hover:bg-blush",
  danger: "bg-rose text-white hover:opacity-90",
};
const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
  icon: "h-11 w-11 justify-center",
};
export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-300 ease-out-expo active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean };
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant, size, className, loading, children, disabled, ...rest }, ref) {
  return (
    <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ href, variant, size, className, children, ...rest }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------ form */
const field =
  "w-full rounded-2xl border border-line bg-surface px-4 text-[0.95rem] text-fg placeholder:text-muted/70 transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15 disabled:opacity-60";
export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(field, "h-12", className)} {...p} />;
});
export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(field, "min-h-28 py-3", className)} {...p} />;
});
export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function Select({ className, children, ...p }, ref) {
  return (
    <select ref={ref} className={cn(field, "h-12 appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23998' stroke-width='1.6' fill='none'/%3E%3C/svg%3E\")" }} {...p}>
      {children}
    </select>
  );
});
export function Field({ label, hint, error, children, className, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-rose" role="alert">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
export function Checkbox({ label, className, ...p }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 text-sm", className)}>
      <input type="checkbox" className="peer sr-only" {...p} />
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-line bg-surface transition peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-4 peer-focus-visible:ring-gold/30 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
        <svg viewBox="0 0 12 10" className="h-3 w-3 text-on-ink" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 5l3.5 3.5L11 1" /></svg>
      </span>
      <span>{label}</span>
    </label>
  );
}

/* ------------------------------------------------------------ display */
export function Badge({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "gold" | "rose" | "ink" | "green" | "muted"; className?: string }) {
  const tones = {
    default: "bg-surface/90 text-fg border border-line",
    gold: "gold-bg text-[#2a1d06]",
    rose: "bg-rose text-white",
    ink: "bg-ink text-on-ink",
    green: "bg-emerald-600/12 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20",
    muted: "bg-surface-2 text-muted",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.1em]", tones[tone], className)}>{children}</span>;
}

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  const pct = `${(Math.max(0, Math.min(5, rating)) / 5) * 100}%`;
  return (
    <span className={cn("relative inline-block whitespace-nowrap leading-none tracking-[0.08em]", className)} style={{ fontSize: size }} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="text-gold/30" aria-hidden>★★★★★</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden text-gold" style={{ width: pct }} aria-hidden>★★★★★</span>
    </span>
  );
}

export function Price({ value, compareAt, className, size = "md" }: { value: number; compareAt?: number; className?: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "text-sm", md: "text-base", lg: "text-2xl" }[size];
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold tabular-nums", s)}>{money(value)}</span>
      {compareAt && compareAt > value ? <span className="text-sm text-muted line-through tabular-nums">{money(compareAt)}</span> : null}
    </span>
  );
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-ink", className)}>
      <span className="h-px w-8 bg-gold" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, sub, action, className, align = "left" }: { eyebrow?: string; title: ReactNode; sub?: string; action?: ReactNode; className?: string; align?: "left" | "center" }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between", align === "center" && "items-center text-center sm:flex-col sm:items-center", className)}>
      <div className={cn("max-w-2xl space-y-3", align === "center" && "flex flex-col items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="text-[2rem] leading-[1.05] sm:text-5xl">{title}</h2>
        {sub && <p className="text-[0.98rem] leading-relaxed text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-2xl", className)} aria-hidden />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-7", className)}>{children}</div>;
}
