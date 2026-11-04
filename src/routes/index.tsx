import { createFileRoute, Link } from "@tanstack/react-router";
import { movies } from "@/data/movies";
import { formatDuration } from "@/data/sessions";
import { AgeBadge } from "@/components/age-badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cine Aurora — Filmes em Cartaz" },
      {
        name: "description",
        content:
          "Programação do Cine Aurora: filmes em cartaz, sessões de hoje e bilheteria online com escolha de lugares.",
      },
      { property: "og:title", content: "Cine Aurora — Filmes em Cartaz" },
      {
        property: "og:description",
        content: "Filmes em cartaz, horários das sessões e bilheteria online com escolha de lugares.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = movies[0];

  return (
    <div className="pb-20">
      {/* Destaque */}
      <section className="relative isolate overflow-hidden">
        <img
          src={featured.poster}
          alt=""
          width={1024}
          height={1536}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-top opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/75 to-background/30" />
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-20 sm:py-28">
          <span className="font-display text-sm tracking-[0.5em] text-primary">EM CARTAZ</span>
          <h1 className="font-display text-6xl leading-none sm:text-7xl">{featured.title}</h1>
          <p className="max-w-xl text-lg text-muted-foreground">{featured.tagline}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <AgeBadge rating={featured.ageRating} />
            <span>{featured.genre}</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>{formatDuration(featured.durationMin)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              to="/bilheteria/$slug"
              params={{ slug: featured.slug }}
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-display text-lg tracking-wide text-primary-foreground transition hover:brightness-110 glow-marquee"
            >
              Comprar ingressos
            </Link>
            <Link
              to="/filmes/$slug"
              params={{ slug: featured.slug }}
              className="inline-flex items-center rounded-lg border border-border bg-card/60 px-6 py-3 font-display text-lg tracking-wide text-foreground transition hover:border-primary hover:text-primary"
            >
              Ver detalhes
            </Link>
          </div>
        </div>
      </section>

      {/* Cartaz */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl">Filmes em cartaz</h2>
          <p className="text-sm text-muted-foreground">{movies.length} filmes</p>
        </div>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie) => (
            <article key={movie.slug} className="group flex flex-col">
              <Link
                to="/filmes/$slug"
                params={{ slug: movie.slug }}
                className="relative block overflow-hidden rounded-xl border border-border transition group-hover:border-primary/60"
              >
                <img
                  src={movie.poster}
                  alt={`Pôster do filme ${movie.title}`}
                  width={1024}
                  height={1536}
                  loading="lazy"
                  className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3">
                  <AgeBadge rating={movie.ageRating} />
                </span>
              </Link>
              <div className="mt-4 flex flex-1 flex-col gap-2">
                <h3 className="font-display text-2xl leading-none">{movie.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {movie.genre} · {formatDuration(movie.durationMin)}
                </p>
                <div className="mt-auto flex gap-2 pt-2">
                  <Link
                    to="/bilheteria/$slug"
                    params={{ slug: movie.slug }}
                    className="flex-1 rounded-md bg-primary px-3 py-2 text-center font-display text-base tracking-wide text-primary-foreground transition hover:brightness-110"
                  >
                    Sessões
                  </Link>
                  <Link
                    to="/filmes/$slug"
                    params={{ slug: movie.slug }}
                    className="rounded-md border border-border px-3 py-2 font-display text-base tracking-wide text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    Detalhes
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
