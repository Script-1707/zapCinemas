import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getMovie } from "@/data/movies";
import { formatPrice, getDays, getOccupiedSeats, getSession, parseSeatList } from "@/data/sessions";
import { reservedSeats, useBookings } from "@/data/bookings";
import { SeatMap } from "@/components/seat-map";

export const MAX_SEATS = 6;

export const Route = createFileRoute("/bilheteria/$slug/$sessaoId/lugares")({
  // ?lugares=A1,A2 — reabre a página com os lugares já escolhidos (ao voltar do pagamento).
  validateSearch: (search: Record<string, unknown>): { lugares?: string } =>
    typeof search["lugares"] === "string" && search["lugares"]
      ? { lugares: search["lugares"] }
      : {},
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

function SeatPicker() {
  const { session, movie } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const bookings = useBookings();

  // Lugares ocupados = ocupação simulada da sala + lugares já comprados neste dispositivo.
  const occupied = useMemo(() => {
    const set = getOccupiedSeats(session.id);
    for (const seat of reservedSeats(bookings, session.id)) set.add(seat);
    return set;
  }, [session.id, bookings]);

  const [picked, setPicked] = useState<string[]>(() =>
    parseSeatList(search["lugares"] ?? "").slice(0, MAX_SEATS),
  );
  // Um lugar que entretanto ficou ocupado deixa de contar como escolhido.
  const selected = picked.filter((s) => !occupied.has(s));

  const days = getDays();
  const day = days[session.dayOffset];
  const dayLabel = day ? `${day.label} · ${day.day} ${day.month}` : "Sessão";

  const toggle = (seat: string) => {
    setPicked((prev) => {
      const current = prev.filter((s) => !occupied.has(s));
      return current.includes(seat)
        ? current.filter((s) => s !== seat)
        : current.length >= MAX_SEATS
          ? current
          : [...current, seat];
    });
  };

  const total = selected.length * session.price;

  const goToPayment = () => {
    if (selected.length === 0) return;
    void navigate({
      to: "/bilheteria/$slug/$sessaoId/pagamento",
      params: { slug: movie.slug, sessaoId: session.id },
      search: { lugares: selected.join(",") },
    });
  };

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
            onClick={goToPayment}
            className={`shine mt-4 hidden w-full lg:block rounded-sm bg-primary px-4 py-3 font-display text-xl tracking-wide text-primary-foreground transition enabled:hover:-translate-y-0.5 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${selected.length > 0 ? "shine-loop" : ""}`}
          >
            Continuar para pagamento
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
          onClick={goToPayment}
          className={`shine shrink-0 rounded-sm bg-primary px-5 py-3 font-display text-base text-primary-foreground transition disabled:opacity-40 ${selected.length > 0 ? "shine-loop" : ""}`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
