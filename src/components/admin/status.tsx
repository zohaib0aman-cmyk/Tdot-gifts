import { cn, STATUS_LABEL } from "@/lib/utils";

const TONE: Record<string, string> = {
  pending: "bg-surface-2 text-muted",
  paid: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  processing: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  shipped: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  out_for_delivery: "bg-orange-500/15 text-orange-800 dark:text-orange-300",
  delivered: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  cancelled: "bg-surface-2 text-muted line-through",
  refunded: "bg-rose/10 text-rose",
  failed: "bg-rose/10 text-rose",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.7rem] font-semibold", TONE[status] ?? TONE.pending, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
