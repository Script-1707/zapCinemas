import type { CSSProperties } from "react";
import type { Booking } from "@/data/bookings";
import { formatSessionDate } from "@/data/bookings";

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Padrão de validação ao estilo de um código QR, único por bilhete.
 * É decorativo (demonstração): um leitor de QR não o consegue ler.
 */
function TicketPattern({ value }: { value: string }) {
  const n = 21;
  let seed = hash(value);
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  const cells: string[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && next() < 0.5) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  const finder = (x: number, y: number) =>
    `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;

  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      className="h-full w-full"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Código do bilhete ${value}`}
    >
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      <path
        d={`${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${cells.join("")}`}
        fill="#000"
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Bilhete individual (um por lugar). */
export function Ticket({
  booking,
  seat,
  index,
}: {
  booking: Booking;
  seat: string;
  index: number;
}) {
  const ticketId = `${booking.code}-${seat}`;
  const row = seat.charAt(0);
  const number = seat.slice(1);

  return (
    <article
      className="animate-fade-up relative overflow-hidden rounded-md bg-card text-card-foreground shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
      style={{ "--delay": `${index * 90}ms` } as CSSProperties}
    >
      <div className="brand-line" />
      <div className="grid grid-cols-[1fr_auto]">
        <div className="min-w-0 p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            ZAP Cinemas · Bilhete
          </p>
          <h3 className="mt-1 truncate text-lg font-bold uppercase leading-tight sm:text-xl">
            {booking.movieTitle}
          </h3>
          <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
            <div className="col-span-2">
              <dt className="text-muted-foreground">Data</dt>
              <dd className="font-bold capitalize">{formatSessionDate(booking.date)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Hora</dt>
              <dd className="font-bold">{booking.time}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Sala</dt>
              <dd className="font-bold">{booking.room.replace("Sala ", "")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Fila</dt>
              <dd className="text-lg font-bold leading-none text-primary">{row}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Lugar</dt>
              <dd className="text-lg font-bold leading-none text-primary">{number}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {booking.format} · {booking.tariff}
          </p>
        </div>

        {/* Canhoto destacável */}
        <div className="relative flex w-28 flex-col items-center justify-center gap-2 border-l-2 border-dashed border-border p-3 sm:w-32">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-background" />
          <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-background" />
          <div className="w-full max-w-24">
            <TicketPattern value={ticketId} />
          </div>
          <p className="text-center font-mono text-[10px] leading-tight text-muted-foreground">
            {ticketId}
          </p>
        </div>
      </div>
    </article>
  );
}
