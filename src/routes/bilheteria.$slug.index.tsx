import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getMovie } from "@/data/movies";
import { formatDuration, formatPrice, getDays, getSessionsForDay } from "@/data/sessions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bilheteria/$slug/")({
  loader: ({ params }) => {
    const movie = getMovie(params.slug);
    if (!movie) throw notFound();
    return { movie };
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `Sessões de ${loaderData.movie.title} — Cine Aurora`
      : "Sessões — Cine Aurora";
    const description = loaderData
      ? `Horários das sessões de ${loaderData.movie.title} no Cine Aurora. Escolha o dia, a sessão e selecione seus lugares na bilheteria online.`
      : "Horários das sessões do Cine Aurora.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SessionsPage,
});

function SessionsPage() {
  const { movie } = Route.useLoaderData();
  const days = getDays();
  const [dayOffset, setDayOffset] = useState(0);
  const sessions = getSessionsForDay(movie.slug, dayOffset);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10">
      <Link
        to="/filmes/$slug"
        params={{ slug: movie.slug }}
        className="text-sm text-muted-foreground transition hover:text-primary"
      >
        ← {movie.title}
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-display text-sm tracking-[0.4em] text-primary">
            BILHETERIA ONLINE
          </span>
          <h1 className="mt-1 font-display text-5xl leading-none">Escolha a sessão</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {movie.genre} · {formatDuration(movie.durationMin)}
        </p>
      </div>

      {/* Dias */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => (
          <button
            key={d.offset}
            type="button"
            onClick={() => setDayOffset(d.offset)}
            className={cn(
              "flex min-w-20 flex-col items-center rounded-xl border px-4 py-3 transition",
              d.offset === dayOffset
                ? "border-primary bg-primary text-primary-foreground glow-marquee"
                : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground"
            )}
          >
            <span className="font-display text-sm">{d.label}</span>
            <span className="font-display text-2xl leading-none">{d.day}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">{d.month}</span>
          </button>
        ))}
      </div>

      {/* Sessões do dia */}
      <div className="mt-6 grid gap-3">
        {sessions.map((s) => (
          <Link
            key={s.id}
            to="/bilheteria/$slug/$sessaoId/lugares"
            params={{ slug: movie.slug, sessaoId: s.id }}
            className="group flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/70 hover:bg-accent sm:gap-6"
          >
            <span className="font-display text-4xl leading-none group-hover:text-primary">
              {s.time}
            </span>
            <div className="min-w-36">
              <p className="text-sm font-semibold">{s.format}</p>
              <p className="text-xs text-muted-foreground">{s.room}</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="font-display text-xl">{formatPrice(s.price)}</span>
              <span className="rounded-md bg-primary px-3 py-2 font-display text-base tracking-wide text-primary-foreground transition group-hover:brightness-110">
                Escolher lugares
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Preços de ingresso inteiro. Meia-entrada disponível na bilheteria do cinema.
      </p>
    </div>
  );
}
