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
    const title = loaderData ? `${loaderData.movie.title} — Cine Aurora` : "Cine Aurora";
    const description = loaderData
      ? `${loaderData.movie.genre} · ${formatDuration(loaderData.movie.durationMin)} · ${loaderData.movie.tagline} Veja o trailer e compre ingressos online com escolha de lugares.`
      : "Programação do Cine Aurora.";
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
      <section className="relative isolate">
        <img
          src={movie.poster}
          alt=""
          width={1024}
          height={1536}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-top opacity-25 blur-sm"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[300px_1fr]">
          <img
            src={movie.poster}
            alt={`Pôster do filme ${movie.title}`}
            width={1024}
            height={1536}
            className="w-full self-start rounded-xl border border-border shadow-2xl"
          />
          <div className="flex flex-col gap-4">
            <span className="font-display text-sm tracking-[0.5em] text-primary">
              {movie.genre}
            </span>
            <h1 className="font-display text-6xl leading-none">{movie.title}</h1>
            <p className="text-lg italic text-muted-foreground">“{movie.tagline}”</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <AgeBadge rating={movie.ageRating} />
              <span>{movie.year}</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{formatDuration(movie.durationMin)}</span>
            </div>
            <p className="max-w-2xl text-foreground/90">{movie.synopsis}</p>
            <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                <span className="text-foreground">Direção:</span> {movie.director}
              </p>
              <p>
                <span className="text-foreground">Elenco:</span> {movie.cast.join(", ")}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                to="/bilheteria/$slug"
                params={{ slug: movie.slug }}
                className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-display text-xl tracking-wide text-primary-foreground transition hover:brightness-110 glow-marquee"
              >
                Bilheteria online
              </Link>
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-6 py-3 font-display text-xl tracking-wide text-foreground transition hover:border-primary hover:text-primary"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
                Assistir trailer
              </button>
            </div>
          </div>
        </div>
      </section>

      {trailerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
          onClick={() => setTrailerOpen(false)}
        >
          <div className="w-full max-w-4xl">
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
              className="aspect-video overflow-hidden rounded-xl border border-border bg-black"
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
