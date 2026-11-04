import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { movies, type Movie } from "@/data/movies";
import { formatDuration, getDays, getSessionsForDay } from "@/data/sessions";
import { AgeBadge } from "@/components/age-badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZAP Cinemas — Em Exibição" },
      {
        name: "description",
        content:
          "Programação da ZAP Cinemas: filmes em exibição, sessões de hoje e bilheteira online com escolha de lugares.",
      },
      { property: "og:title", content: "ZAP Cinemas — Em Exibição" },
      {
        property: "og:description",
        content:
          "Filmes em exibição, horários das sessões e bilheteira online com escolha de lugares.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const HERO_COUNT = 3;
const HERO_INTERVAL_MS = 6500;

const BRAND_COLORS = ["#c70d6a", "#5a4a9a", "#0c76bc", "#81a560", "#f5d008"];

/** Fita diagonal de sala especial (SALA IMAX / SALA VIP) para o filme. */
function roomRibbon(movie: Movie, dayOffset: number | null): string | null {
  const offsets = dayOffset === null ? getDays().map((d) => d.offset) : [dayOffset];
  const formats = new Set(
    offsets.flatMap((o) => getSessionsForDay(movie.slug, o).map((s) => s.format)),
  );
  if (formats.has("IMAX")) return "Sala IMAX";
  if (formats.has("VIP")) return "Sala VIP";
  return null;
}

function Index() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [dayFilter, setDayFilter] = useState<number | null>(null);
  const days = getDays();
  const featured = movies[heroIndex] as Movie;

  const [paused, setPaused] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);

  const move = (delta: number) => setHeroIndex((i) => (i + delta + HERO_COUNT) % HERO_COUNT);

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setHeroIndex((i) => (i + 1) % HERO_COUNT), HERO_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [heroIndex, paused]);

  return (
    <div className="pb-4">
      {/* Banner em carrossel */}
      <section
        className="relative isolate overflow-hidden bg-brand-hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={(e) => {
          setPaused(true);
          setTouchX(e.touches[0]?.clientX ?? null);
        }}
        onTouchEnd={(e) => {
          const endX = e.changedTouches[0]?.clientX;
          if (touchX !== null && endX !== undefined && Math.abs(endX - touchX) > 50) {
            move(endX < touchX ? 1 : -1);
          }
          setTouchX(null);
          setPaused(false);
        }}
      >
        {/* Fundos em crossfade com zoom lento */}
        {movies.slice(0, HERO_COUNT).map((m, i) => (
          <div
            key={m.slug}
            aria-hidden
            className={cn(
              "absolute inset-0 -z-20 overflow-hidden transition-opacity duration-1000",
              i === heroIndex ? "opacity-100" : "opacity-0",
            )}
          >
            <img
              key={i === heroIndex ? `${m.slug}-on` : m.slug}
              src={m.backdrop}
              alt=""
              width={1280}
              height={720}
              className={cn(
                "h-full w-full object-cover opacity-40",
                i === heroIndex && "animate-ken-burns",
              )}
            />
          </div>
        ))}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/40 to-black/75" />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 sm:py-14 lg:px-14 md:grid-cols-[1fr_280px] md:py-20">
          <div key={featured.slug} className="flex flex-col gap-4 sm:gap-5">
            <p
              className="animate-fade-up text-xl font-bold uppercase text-primary sm:text-3xl"
              style={{ "--delay": "0ms" } as CSSProperties}
            >
              Compre já o seu bilhete!
            </p>
            <h1
              className="animate-fade-up font-display text-4xl leading-[1.05] drop-shadow-[0_4px_24px_rgba(12,118,188,0.5)] sm:text-6xl"
              style={{ "--delay": "120ms" } as CSSProperties}
            >
              {featured.title}
            </h1>
            <p
              className="animate-fade-up max-w-xl text-base text-muted-foreground sm:text-lg"
              style={{ "--delay": "240ms" } as CSSProperties}
            >
              {featured.tagline}
            </p>
            <div
              className="animate-fade-up flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
              style={{ "--delay": "320ms" } as CSSProperties}
            >
              <AgeBadge rating={featured.ageRating} />
              <span>{featured.genre}</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{formatDuration(featured.durationMin)}</span>
            </div>
            <div
              className="animate-fade-up flex items-start gap-2 text-sm"
              style={{ "--delay": "400ms" } as CSSProperties}
            >
              <PinIcon />
              <p>
                <span className="font-bold uppercase">Shopping Avennida Morro Bento</span>
                <br />
                <span className="text-muted-foreground">Luanda, Angola</span>
              </p>
            </div>
            <div
              className="animate-fade-up mt-2 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap"
              style={{ "--delay": "480ms" } as CSSProperties}
            >
              <Link
                to="/bilheteria/$slug"
                params={{ slug: featured.slug }}
                className="shine shine-loop inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-3 py-3 font-display text-sm sm:px-6 sm:text-base text-primary-foreground shadow-[0_0_30px_-6px_rgba(245,208,8,0.7)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <TicketMini />
                <span className="sm:hidden">Comprar</span>
                <span className="hidden sm:inline">Comprar bilhetes</span>
              </Link>
              <Link
                to="/filmes/$slug"
                params={{ slug: featured.slug }}
                className="inline-flex items-center justify-center rounded-sm border border-white px-3 py-3 font-display text-sm text-foreground sm:px-6 sm:text-base transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                Ver detalhes
              </Link>
            </div>
          </div>

          <Link
            key={`poster-${featured.slug}`}
            to="/filmes/$slug"
            params={{ slug: featured.slug }}
            className="animate-poster-in hidden flex-col items-center gap-4 md:flex"
            style={{ "--delay": "150ms" } as CSSProperties}
          >
            <div className="animate-float">
              <img
                src={featured.poster}
                alt={`Cartaz do filme ${featured.title}`}
                width={600}
                height={890}
                className="aspect-[2/3] w-full object-cover shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),0_0_60px_-10px_rgba(90,74,154,0.8)]"
              />
            </div>
            <span className="text-xl font-bold uppercase text-primary">Em exibição</span>
          </Link>
        </div>

        <CarouselArrow side="left" onClick={() => move(-1)} />
        <CarouselArrow side="right" onClick={() => move(1)} />
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {Array.from({ length: HERO_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Destaque ${i + 1}`}
              onClick={() => setHeroIndex(i)}
              className={cn(
                "relative h-1.5 overflow-hidden rounded-full before:absolute before:-inset-3 before:content-[''] bg-white/30 transition-all duration-300",
                i === heroIndex ? "w-10" : "w-1.5 hover:bg-white/60",
              )}
            >
              {i === heroIndex && (
                <span
                  key={`${heroIndex}-${paused}`}
                  className={cn(
                    "absolute inset-0 rounded-full bg-white",
                    !paused && "animate-progress",
                  )}
                  style={{ "--duration": `${HERO_INTERVAL_MS}ms` } as CSSProperties}
                />
              )}
            </button>
          ))}
        </div>
      </section>
      <div className="brand-line" />

      {/* Letreiro em movimento */}
      <div className="overflow-hidden border-b border-border/60 bg-black/50 py-3 backdrop-blur-sm">
        <div className="animate-ticker flex w-max gap-10 whitespace-nowrap text-sm font-bold uppercase tracking-wide">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-10" aria-hidden={copy === 1}>
              {movies.map((m, i) => (
                <Link
                  key={m.slug}
                  to="/filmes/$slug"
                  params={{ slug: m.slug }}
                  tabIndex={copy === 1 ? -1 : undefined}
                  className="flex items-center gap-10 transition hover:text-primary"
                >
                  <span
                    className="h-2 w-2 rotate-45"
                    style={{ background: BRAND_COLORS[i % BRAND_COLORS.length] }}
                  />
                  <span>{m.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Atalhos */}
      <nav className="mx-auto grid max-w-3xl grid-cols-5 gap-1 px-2 py-6 sm:flex sm:justify-center sm:gap-10 sm:px-4 sm:py-10">
        <Shortcut href="#em-cartaz" label="Em Cartaz" icon={<ClapperIcon />} />
        <Shortcut href="#em-cartaz" label="IMAX" icon={<GlassesIcon />} />
        <Shortcut href="#em-cartaz" label="Serviços" icon={<ServiceIcon />} />
        <Shortcut href="#em-cartaz" label="Campanhas" icon={<MegaphoneIcon />} />
        <Shortcut href="/precario" label="Preçário" icon={<TicketIcon />} />
      </nav>
      <div className="brand-line" />

      {/* Filtro por dia + cartazes */}
      <section
        id="em-cartaz"
        className="mx-auto max-w-4xl scroll-mt-20 px-4 pt-8 sm:scroll-mt-28 sm:pt-10"
      >
        <div className="-mx-4 mb-6 flex items-center gap-x-4 overflow-x-auto whitespace-nowrap px-4 text-sm [scrollbar-width:none] sm:mx-0 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          <span className="shrink-0 text-muted-foreground">Filtrar por dia:</span>
          <DayButton active={dayFilter === null} onClick={() => setDayFilter(null)}>
            Todos
          </DayButton>
          {days.map((d) => (
            <DayButton
              key={d.offset}
              active={dayFilter === d.offset}
              onClick={() => setDayFilter(d.offset)}
            >
              {d.offset < 2 ? d.label : `${d.day} ${d.month}`}
            </DayButton>
          ))}
        </div>

        <div
          key={dayFilter ?? "todos"}
          className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-6 md:grid-cols-4"
        >
          {movies.map((movie, index) => {
            const ribbon = roomRibbon(movie, dayFilter);
            return (
              <article
                key={movie.slug}
                className="group animate-fade-up"
                style={{ "--delay": `${index * 90}ms` } as CSSProperties}
              >
                <Link
                  to="/filmes/$slug"
                  params={{ slug: movie.slug }}
                  className="glow-brand shine shine-hover relative block overflow-hidden group-hover:-translate-y-2"
                  aria-label={movie.title}
                >
                  <img
                    src={movie.poster}
                    alt={`Cartaz do filme ${movie.title}`}
                    width={600}
                    height={890}
                    loading="lazy"
                    className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-110"
                  />
                  {ribbon && (
                    <span className="absolute -left-9 top-4 w-32 -rotate-45 bg-brand-purple py-0.5 text-center text-[9px] font-bold uppercase tracking-wide text-white shadow">
                      {ribbon}
                    </span>
                  )}
                  <span className="absolute right-2 top-2">
                    <AgeBadge rating={movie.ageRating} />
                  </span>
                  <div className="absolute inset-0 flex translate-y-4 flex-col justify-end gap-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <span className="font-display text-sm leading-tight">{movie.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {movie.genre} · {formatDuration(movie.durationMin)}
                    </span>
                  </div>
                </Link>
                <div className="mt-2 sm:hidden">
                  <h3 className="line-clamp-2 text-sm font-bold uppercase leading-tight">
                    {movie.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {movie.genre} · {formatDuration(movie.durationMin)}
                  </p>
                </div>
                <Link
                  to="/bilheteria/$slug"
                  params={{ slug: movie.slug }}
                  className="shine shine-hover mt-2 block rounded-sm bg-primary py-2.5 sm:mt-3 sm:py-1.5 text-center text-xs font-bold uppercase text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_rgba(245,208,8,0.8)]"
                >
                  Comprar bilhete
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DayButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 py-2 capitalize transition after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-[image:var(--gradient-marquee)] after:transition-transform after:duration-300",
        active
          ? "text-foreground after:scale-x-100"
          : "text-foreground/80 after:scale-x-0 hover:text-primary hover:after:scale-x-100",
      )}
    >
      {children}
    </button>
  );
}

function CarouselArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Destaque anterior" : "Destaque seguinte"}
      className={cn(
        "absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 lg:flex items-center justify-center rounded-full border border-white/90 bg-black/20 text-white backdrop-blur-sm transition hover:scale-110 hover:border-primary hover:text-primary",
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d={side === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

function Shortcut({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      className="group flex flex-col items-center gap-2 py-1 text-foreground sm:w-20 transition duration-300 hover:-translate-y-1 hover:text-primary"
    >
      <span className="group-hover-wiggle h-8 w-8 transition sm:h-10 sm:w-10 group-hover:drop-shadow-[0_0_10px_rgba(245,208,8,0.7)]">
        {icon}
      </span>
      <span className="text-center text-[10px] font-medium uppercase leading-tight tracking-wide sm:text-[11px]">
        {label}
      </span>
    </a>
  );
}

/* ---- Ícones lineares (traço 1.5px, monocromáticos) ---------------------- */

const iconProps = {
  viewBox: "0 0 40 40",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
  className: "h-full w-full",
  "aria-hidden": true,
};

function ClapperIcon() {
  return (
    <svg {...iconProps}>
      <rect x="5" y="16" width="30" height="18" />
      <path d="M5 16l29-7 1.5 5L5 21M12 14l3 5M20 12l3 5M28 10l3 5M5 24h30" />
    </svg>
  );
}

function GlassesIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 18h34M5 18l2 10h10l2-7h2l2 7h10l2-10M7 18l4-8M33 18l-4-8" />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="24" cy="10" r="4" />
      <path d="M24 3v2M24 15v2M17 10h2M29 10h2M19 5l1.5 1.5M27.5 13.5L29 15M19 15l1.5-1.5M27.5 6.5L29 5" />
      <path d="M5 26h6l7 2h7a2 2 0 010 4h-8M25 30l9-5a2 2 0 012 3l-10 7H11l-6-3" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 15h8l18-8v26l-18-8H6zM10 25l3 9h4l-2-9" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 12h30v5a3 3 0 000 6v5H5v-5a3 3 0 000-6z" />
    </svg>
  );
}

function TicketMini() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M3 7h18v3a2 2 0 000 4v3H3v-3a2 2 0 000-4z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-0.5 h-5 w-5 shrink-0 animate-bounce text-chart-3"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5z" />
    </svg>
  );
}
