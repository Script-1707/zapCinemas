import type { BookingStatus } from "@/data/bookings";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
        status === "pago" ? "bg-success/15 text-success" : "bg-primary/15 text-primary",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "pago" ? "bg-success" : "animate-pulse bg-primary",
        )}
      />
      {status === "pago" ? "Pago" : "Aguarda pagamento"}
    </span>
  );
}
