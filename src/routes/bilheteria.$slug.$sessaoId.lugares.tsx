import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getMovie } from "@/data/movies";
import {
  formatPrice,
  getDays,
  getOccupiedSeats,
  getSession,
  ticketCode,
} from "@/data/sessions";
import { SeatMap } from "@/components/seat-map";

const MAX_SEATS = 6;

export const Route = createFileRoute("/bilheteria/$slug/$sessaoId/lugares")({
  loader: ({ params }) => {
    const session = getSession(params.sessaoId);
    if (!session || session.movieSlug !== params.slug) throw notFound();
    const movie = getMovie(params.slug);
    if (!movie) throw notFound();
    return { session, movie };
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `Escolha de lugares — ${loaderData.movie.title} — Cine Aurora`
      : "Escolha de lugares — Cine Aurora";
    return {
      meta: [
        { title },
        { name: "description", content: "Escolha seus lugares na sala e confirme a reserva." },
        { property: "og:title", content: title },
        { property: "og:description", content: "Escolha seus lugares na sala e confirme a reserva." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SeatPicker,
});

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden
    >
      <path d="M4 12.5l5 5L20 7" />
    </svg>
  );
}

function SeatPicker() {
  const { session, movie } = Route.useLoaderData();
  const occupied = useMemo(() => getOccupiedSeats(session.id), [session.id]);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const days = getDays();
  const day = days[session.dayOffset];
  const dayLabel = day ? `${day.label} · ${day.day} ${day.month}` : "Sessão";

  const toggle = (seat: string) => {
    if (confirmed) return;
    setSelected((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : prev.length >= MAX_SEATS
          ? prev
          : [...prev, seat]
    );
  };

  const total = selected.length * session.price;
  const code = confirmed ? ticketCode(session.id, selected) : "";

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckIcon />
        </div>
        <h1 className="mt-6 font-display text-5xl leading-none">Reserva confirmada!</h1>
        <p className="mt-3 text-muted-foreground">
          Apresente o código na bilheteria até 30 minutos antes da sessão.
        </p>
        <div className="mt-8 rounded-2xl border border-primary/40 bg-card p-6 text-left glow-marquee">
          <p className="text-center font-display text-3xl tracking-[0.3em] text-primary">{code}</p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Filme</dt>
              <dd className="text-right font-medium">{movie.title}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Dia e horário</dt>
              <dd className="text-right font-medium">
                {dayLabel} · {session.time}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Formato</dt>
              <dd className="text-right font-medium">{session.format}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Sala</dt>
              <dd className="text-right font-medium">{session.room}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Lugares</dt>
              <dd className="text-right font-medium">{selected.join(", ")}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-display text-2xl">{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/bilheteria/$slug"
            params={{ slug: movie.slug }}
            className="rounded-lg bg-primary px-5 py-3 font-display text-lg tracking-wide text-primary-foreground transition hover:brightness-110"
          >
            Escolher outra sessão
          </Link>
          <button
            type="button"
            onClick={() => {
              setConfirmed(false);
              setSelected([]);
            }}
            className="rounded-lg border border-border px-5 py-3 font-display text-lg tracking-wide text-foreground transition hover:border-primary hover:text-primary"
          >
            Comprar mais lugares
          </button>
          <Link
            to="/"
            className="rounded-lg border border-border px-5 py-3 font-display text-lg tracking-wide text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            Voltar à cartaz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10">
      <Link
        to="/bilheteria/$slug"
        params={{ slug: movie.slug }}
        className="text-sm text-muted-foreground transition hover:text-primary"
      >
        ← Trocar sessão
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-display text-sm tracking-[0.4em] text-primary">
            BILHETERIA ONLINE
          </span>
          <h1 className="mt-1 font-display text-5xl leading-none">Escolha seus lugares</h1>
        </div>
        <div className="text-left text-sm text-muted-foreground sm:text-right">
          <p className="font-semibold text-foreground">{movie.title}</p>
          <p>
            {dayLabel} · {session.time}
          </p>
          <p>
            {session.format} · {session.room}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div>
          <SeatMap occupied={occupied} selected={new Set(selected)} onToggle={toggle} />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border border-border bg-muted/50" /> Disponível
            </span>
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-primary" /> Selecionado
            </span>
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-destructive/70" /> Ocupado
            </span>
          </div>
        </div>

        <aside className="h-max rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <p className="font-display text-2xl">Sua reserva</p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{movie.title}</p>
            <p>
              {dayLabel} · {session.time}
            </p>
            <p>
              {session.format} · {session.room}
            </p>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Lugares ({selected.length})
            </p>
            {selected.length === 0 ? (
              <p className="mt-2 text-sm italic text-muted-foreground">
                Toque nos lugares livres do mapa.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-3xl">{formatPrice(total)}</span>
          </div>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => setConfirmed(true)}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-3 font-display text-xl tracking-wide text-primary-foreground transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirmar reserva
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Máximo de {MAX_SEATS} lugares por reserva.
          </p>
        </aside>
      </div>
    </div>
  );
}
