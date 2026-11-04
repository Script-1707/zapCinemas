import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { getMovie } from "@/data/movies";
import { formatPrice, getDays, getOccupiedSeats, getSession, ticketCode } from "@/data/sessions";
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
      ? `Escolha de lugares — ${loaderData.movie.title} — ZAP Cinemas`
      : "Escolha de lugares — ZAP Cinemas";
    return {
      meta: [
        { title },
        { name: "description", content: "Escolha os seus lugares na sala e confirme a reserva." },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Escolha os seus lugares na sala e confirme a reserva.",
        },
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

const CONFETTI_COLORS = ["#c70d6a", "#5a4a9a", "#0c76bc", "#81a560", "#f5d008"];
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  left: `${(i * 23) % 100}%`,
  x: `${((i * 53) % 160) - 80}px`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `${(i % 10) * 0.08}s`,
  duration: `${2 + (i % 5) * 0.35}s`,
}));

function ConfettiBurst() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden"
    >
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti"
          style={
            {
              left: c.left,
              background: c.color,
              "--x": c.x,
              "--delay": c.delay,
              "--duration": c.duration,
            } as CSSProperties
          }
        />
      ))}
    </div>
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
          : [...prev, seat],
    );
  };

  const total = selected.length * session.price;

  // No telemóvel o botão está no fundo da página: ao confirmar, volta ao topo.
  useEffect(() => {
    if (confirmed) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [confirmed]);
  const code = confirmed ? ticketCode(session.id, selected) : "";

  if (confirmed) {
    return (
      <div className="relative mx-auto max-w-2xl px-4 py-10 text-center sm:py-16">
        <ConfettiBurst />
        <div className="animate-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckIcon />
        </div>
        <h1
          className="animate-fade-up mt-6 font-display text-4xl leading-none sm:text-5xl"
          style={{ "--delay": "150ms" } as CSSProperties}
        >
          Reserva confirmada!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Apresente o código na bilheteira até 30 minutos antes da sessão.
        </p>
        <div
          className="animate-poster-in mt-8 rounded-sm border border-primary/40 bg-card p-6 text-left glow-marquee"
          style={{ "--delay": "300ms" } as CSSProperties}
        >
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
              <dd className="font-display text-2xl normal-case!">{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            to="/bilheteria/$slug"
            params={{ slug: movie.slug }}
            className="rounded-sm bg-primary px-5 py-3 font-display text-lg tracking-wide text-primary-foreground transition hover:brightness-110"
          >
            Escolher outra sessão
          </Link>
          <button
            type="button"
            onClick={() => {
              setConfirmed(false);
              setSelected([]);
            }}
            className="rounded-sm border border-border px-5 py-3 font-display text-lg tracking-wide text-foreground transition hover:border-primary hover:text-primary"
          >
            Comprar mais lugares
          </button>
          <Link
            to="/"
            className="rounded-sm border border-border px-5 py-3 font-display text-lg tracking-wide text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            Voltar ao cartaz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-4 pt-6 sm:pt-10 lg:pb-20">
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
            BILHETEIRA ONLINE
          </span>
          <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">
            Escolha os seus lugares
          </h1>
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

      <div className="mt-6 grid gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <SeatMap occupied={occupied} selected={new Set(selected)} onToggle={toggle} />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:mt-8 sm:gap-6">
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

        <aside className="h-max rounded-sm border border-border bg-card p-5 lg:sticky lg:top-24">
          <p className="font-display text-2xl">A sua reserva</p>
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
                    className="animate-pop rounded-sm bg-primary/15 px-2 py-1 text-xs font-semibold text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span key={total} className="animate-pop font-display text-3xl normal-case!">
              {formatPrice(total)}
            </span>
          </div>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => setConfirmed(true)}
            className={`shine mt-4 hidden w-full lg:block rounded-sm bg-primary px-4 py-3 font-display text-xl tracking-wide text-primary-foreground transition enabled:hover:-translate-y-0.5 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${selected.length > 0 ? "shine-loop" : ""}`}
          >
            Confirmar reserva
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Máximo de {MAX_SEATS} lugares por reserva.
          </p>
        </aside>
      </div>

      {/* Barra fixa no telemóvel: total e confirmação sempre à mão */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-6 flex items-center gap-3 border-t border-border bg-black/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {selected.length === 0
              ? "Escolha os lugares no mapa"
              : `${selected.length} ${selected.length === 1 ? "lugar" : "lugares"}: ${selected.join(", ")}`}
          </p>
          <p key={total} className="animate-pop font-display text-2xl leading-tight normal-case!">
            {formatPrice(total)}
          </p>
        </div>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => setConfirmed(true)}
          className={`shine shrink-0 rounded-sm bg-primary px-5 py-3 font-display text-base text-primary-foreground transition disabled:opacity-40 ${selected.length > 0 ? "shine-loop" : ""}`}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
