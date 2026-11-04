import { SEAT_ROWS, SEATS_PER_ROW } from "@/data/sessions";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  occupied: Set<string>;
  selected: Set<string>;
  onToggle: (seat: string) => void;
}

export function SeatMap({ occupied, selected, onToggle }: SeatMapProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="mx-auto w-max">
        {/* Tela */}
        <div className="mx-auto mb-10 w-3/4 min-w-72">
          <div className="h-2 rounded-t-full bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
          <p className="mt-3 text-center font-display text-sm tracking-[0.5em] text-muted-foreground">
            TELA
          </p>
        </div>

        {/* Fileiras */}
        <div className="flex flex-col gap-2.5">
          {SEAT_ROWS.map((row) => (
            <div key={row} className="flex items-center justify-center gap-2">
              <span className="w-5 text-center font-display text-sm text-muted-foreground">
                {row}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                  const seat = `${row}${i + 1}`;
                  const isOccupied = occupied.has(seat);
                  const isSelected = selected.has(seat);
                  return (
                    <button
                      key={seat}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => onToggle(seat)}
                      aria-label={`Lugar ${seat}${isOccupied ? " (ocupado)" : isSelected ? " (selecionado)" : " (disponível)"}`}
                      title={isOccupied ? `${seat} — ocupado` : seat}
                      className={cn(
                        "h-7 w-7 rounded-md text-[10px] font-semibold transition-all sm:h-8 sm:w-8 sm:text-xs",
                        i === 6 && "mr-6", // corredor central
                        isOccupied &&
                          "cursor-not-allowed bg-destructive/70 text-destructive-foreground",
                        !isOccupied &&
                          !isSelected &&
                          "border border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary",
                        isSelected && "bg-primary text-primary-foreground glow-marquee"
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
