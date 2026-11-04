import type { AgeRating } from "@/data/movies";
import { cn } from "@/lib/utils";

const RATING_STYLES: Record<AgeRating, string> = {
  L: "border-success/50 bg-success/15 text-success",
  "12": "border-chart-5/60 bg-chart-5/15 text-chart-5",
  "14": "border-velvet/70 bg-velvet/25 text-velvet-foreground",
  "16": "border-destructive/60 bg-destructive/20 text-destructive-foreground",
};

export function AgeBadge({ rating }: { rating: AgeRating }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-md border px-2 font-display text-sm leading-none",
        RATING_STYLES[rating],
      )}
    >
      {rating}
    </span>
  );
}
