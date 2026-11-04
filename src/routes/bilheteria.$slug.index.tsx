import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
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
      ? `Sessões de ${loaderData.movie.title} — ZAP Cinemas`
      : "Sessões — ZAP Cinemas";
    const description = loaderData
      ? `Horários das sessões de ${loaderData.movie.title} na ZAP Cinemas. Escolha o dia, a sessão e seleccione os seus lugares na bilheteira online.`
      : "Horários das sessões da ZAP Cinemas.";
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
            BILHETEIRA ONLINE
          </span>
          <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">Escolha a sessão</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {movie.genre} · {formatDuration(movie.durationMin)}
        </p>
      </div>

      {/* Dias */}
      <div className="mt-6 grid grid-cols-5 gap-1.5 sm:mt-8 sm:flex sm:gap-2 sm:overflow-x-auto sm:pb-2">
        {days.map((d) => (
          <button
            key={d.offset}
            type="button"
            onClick={() => setDayOffset(d.offset)}
            className={cn(
              "flex min-w-0 flex-col items-center rounded-sm border px-1 py-2.5 transition duration-300 hover:-translate-y-1 sm:min-w-20 sm:px-4 sm:py-3",
              d.offset === dayOffset
                ? "border-primary bg-primary text-primary-foreground glow-marquee"
                : "border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground",
            )}
          >
            <span className="font-display text-xs sm:hidden">
              {d.offset === 0 ? "Hoje" : d.weekday}
            </span>
            <span className="hidden font-display text-sm sm:inline">{d.label}</span>
            <span className="font-display text-2xl leading-none">{d.day}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">{d.month}</span>
          </button>
        ))}
      </div>

      {/* Sessões do dia */}
      <div key={dayOffset} className="mt-6 grid gap-3">
        {sessions.map((s, i) => (
          <Link
            key={s.id}
            style={{ "--delay": `${i * 80}ms` } as CSSProperties}
            to="/bilheteria/$slug/$sessaoId/lugares"
            params={{ slug: movie.slug, sessaoId: s.id }}
            className="group animate-fade-up grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 rounded-sm border border-border bg-card p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/70 hover:bg-accent hover:shadow-[0_10px_30px_-12px_rgba(245,208,8,0.5)] sm:flex sm:gap-6"
          >
            <span className="font-display text-4xl leading-none group-hover:text-primary">
              {s.time}
            </span>
            <div className="sm:min-w-36">
              <p className="text-sm font-semibold">{s.format}</p>
              <p className="text-xs text-muted-foreground">{s.room}</p>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-4 border-t border-border/60 pt-3 sm:ml-auto sm:justify-end sm:border-0 sm:pt-0">
              <span className="text-left sm:text-right">
                <span className="block font-display text-xl text-primary normal-case!">
                  {formatPrice(s.price)}
                </span>
                <span className="block text-[11px] text-muted-foreground">{s.tariff}</span>
              </span>
              <span className="shine shine-hover whitespace-nowrap rounded-sm bg-primary px-4 py-2.5 font-display text-sm tracking-wide sm:px-3 sm:py-2 sm:text-base text-primary-foreground transition group-hover:brightness-110">
                Escolher lugares
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Preço por bilhete, segundo o dia da semana (Económico de 2.ª a 5.ª, Quartas Loucas à
        quarta-feira, Normal de 6.ª a domingo).{" "}
        <Link to="/precario" className="text-primary underline-offset-2 hover:underline">
          Ver preçário completo
        </Link>
      </p>
    </div>
  );
}
