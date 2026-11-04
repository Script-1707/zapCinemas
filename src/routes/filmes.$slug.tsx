import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getMovie } from "@/data/movies";
import { formatDuration } from "@/data/sessions";
import { AgeBadge } from "@/components/age-badge";

export const Route = createFileRoute("/filmes/$slug")({
  loader: ({ params }) => {
    const movie = getMovie(params.slug);
    if (!movie) throw notFound();
    return { movie };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.movie.title} — ZAP Cinemas` : "ZAP Cinemas";
    const description = loaderData
      ? `${loaderData.movie.genre} · ${formatDuration(loaderData.movie.durationMin)} · ${loaderData.movie.tagline} Veja o trailer e compre bilhetes online com escolha de lugares.`
      : "Programação da ZAP Cinemas.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "video.movie" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: MovieDetail,
});

function MovieDetail() {
  const { movie } = Route.useLoaderData();
  const [trailerOpen, setTrailerOpen] = useState(false);

  return (
    <div className="pb-20">
      <section className="relative isolate overflow-hidden">
        <img
          src={movie.poster}
          alt=""
          width={1024}
          height={1536}
          className="animate-ken-burns absolute inset-0 -z-10 h-full w-full object-cover object-top opacity-25 blur-sm"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[300px_1fr]">
          <img
            src={movie.poster}
            alt={`Cartaz do filme ${movie.title}`}
            width={1024}
            height={1536}
            className="animate-poster-in mx-auto w-40 self-start rounded-sm sm:w-56 md:w-full border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),0_0_60px_-10px_rgba(90,74,154,0.8)]"
          />
          <div className="animate-fade-up flex flex-col gap-4" style={{ animationDelay: "200ms" }}>
            <span className="font-display text-xs tracking-[0.3em] text-primary sm:text-sm sm:tracking-[0.5em]">
              {movie.genre}
            </span>
            <h1 className="font-display text-4xl leading-none sm:text-6xl">{movie.title}</h1>
            <p className="text-base italic text-muted-foreground sm:text-lg">“{movie.tagline}”</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <AgeBadge rating={movie.ageRating} />
              <span>{movie.year}</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{formatDuration(movie.durationMin)}</span>
            </div>
            <p className="max-w-2xl text-foreground/90">{movie.synopsis}</p>
            <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                <span className="text-foreground">Realização:</span> {movie.director}
              </p>
              <p>
                <span className="text-foreground">Elenco:</span> {movie.cast.join(", ")}
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Link
                to="/bilheteria/$slug"
                params={{ slug: movie.slug }}
                className="shine shine-loop inline-flex items-center justify-center rounded-sm bg-primary px-3 py-3 font-display text-base sm:px-6 sm:text-xl tracking-wide text-primary-foreground transition hover:-translate-y-0.5 hover:brightness-110 glow-marquee"
              >
                <span className="sm:hidden">Bilhetes</span>
                <span className="hidden sm:inline">Bilheteira online</span>
              </Link>
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-card/60 px-3 py-3 font-display text-base sm:px-6 sm:text-xl tracking-wide text-foreground transition hover:border-primary hover:text-primary"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                Ver trailer
              </button>
            </div>
          </div>
        </div>
      </section>

      {trailerOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm duration-300"
          onClick={() => setTrailerOpen(false)}
        >
          <div className="animate-in zoom-in-90 w-full max-w-4xl duration-300">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setTrailerOpen(false)}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                Fechar ✕
              </button>
            </div>
            <div
              className="aspect-video overflow-hidden rounded-sm border border-border bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&rel=0`}
                title={`Trailer — ${movie.title}`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
