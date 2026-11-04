import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { getMovie } from "@/data/movies";
import { formatPrice } from "@/data/sessions";
import {
  formatSessionDate,
  isPastSession,
  useBookings,
  useHydrated,
  type Booking,
} from "@/data/bookings";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/bilhetes/")({
  head: () => ({
    meta: [
      { title: "Os meus bilhetes — ZAP Cinemas" },
      { name: "description", content: "Bilhetes comprados e pagamentos pendentes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyTickets,
});

function MyTickets() {
  const hydrated = useHydrated();
  const bookings = useBookings();

  const upcoming = bookings.filter((b) => !isPastSession(b));
  const past = bookings.filter((b) => isPastSession(b));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      <span className="font-display text-sm tracking-[0.4em] text-primary">ÁREA DO CLIENTE</span>
      <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">Os meus bilhetes</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        As compras ficam guardadas neste dispositivo e neste browser.
      </p>

      {!hydrated ? (
        <div className="mt-8 grid gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-sm bg-card" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-10 rounded-sm border border-border bg-card/70 p-8 text-center">
          <p className="font-display text-2xl">Ainda não tem bilhetes</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Escolha um filme, a sessão e os lugares. Depois do pagamento, os bilhetes aparecem aqui.
          </p>
          <Link
            to="/"
            hash="em-cartaz"
            className="mt-6 inline-flex rounded-sm bg-primary px-6 py-3 font-display text-base text-primary-foreground"
          >
            Ver filmes em cartaz
          </Link>
        </div>
      ) : (
        <>
          <Section title="Próximas sessões" bookings={upcoming} empty="Sem sessões marcadas." />
          {past.length > 0 && <Section title="Sessões anteriores" bookings={past} faded />}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  bookings,
  empty,
  faded,
}: {
  title: string;
  bookings: Booking[];
  empty?: string;
  faded?: boolean;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className={faded ? "grid gap-3 opacity-60" : "grid gap-3"}>
          {bookings.map((b, i) => (
            <BookingCard key={b.code} booking={b} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const movie = getMovie(booking.movieSlug);
  return (
    <Link
      to="/bilhetes/$codigo"
      params={{ codigo: booking.code }}
      className="group animate-fade-up flex gap-4 rounded-sm border border-border bg-card p-3 transition hover:border-primary/70 sm:p-4"
      style={{ "--delay": `${index * 70}ms` } as CSSProperties}
    >
      {movie && (
        <img
          src={movie.poster}
          alt=""
          width={1024}
          height={1536}
          loading="lazy"
          className="aspect-[2/3] w-16 shrink-0 object-cover sm:w-20"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold uppercase leading-tight group-hover:text-primary">
            {booking.movieTitle}
          </p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {formatSessionDate(booking.date)} · {booking.time}
        </p>
        <p className="text-sm text-muted-foreground">
          {booking.room} · Lugares {booking.seats.join(", ")}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="font-mono text-xs text-muted-foreground">{booking.code}</span>
          <span className="font-bold text-primary">{formatPrice(booking.total)}</span>
        </div>
      </div>
    </Link>
  );
}
