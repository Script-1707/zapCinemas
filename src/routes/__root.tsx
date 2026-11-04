import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useBookings, useHydrated } from "../data/bookings";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-marquee-gradient">404</h1>
        <h2 className="mt-4 font-display text-3xl">Sessão não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que procura não existe ou saiu de cartaz.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-display text-lg tracking-wide text-primary-foreground transition-colors hover:brightness-110"
          >
            Voltar ao cartaz
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl">Esta página não carregou</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado do nosso lado. Pode tentar novamente ou voltar à cartaz.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-display text-lg tracking-wide text-primary-foreground transition hover:brightness-110"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-display text-lg tracking-wide text-foreground transition hover:border-primary"
          >
            Voltar ao cartaz
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#000000" },
      { name: "apple-mobile-web-app-title", content: "ZAP Cinemas" },
      { title: "ZAP Cinemas — Em Exibição e Bilheteira Online" },
      {
        name: "description",
        content:
          "Filmes em exibição na ZAP Cinemas, horários das sessões e bilheteira online com escolha de lugares.",
      },
      { property: "og:title", content: "ZAP Cinemas — Em Exibição e Bilheteira Online" },
      {
        property: "og:description",
        content: "Filmes em exibição, sessões e bilhetes online com escolha de lugares.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/icon-192.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-AO">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export function ZapWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 leading-none ${className}`}>
      <span className="text-marquee-gradient text-[1.35em] font-bold lowercase tracking-tight">
        zap
      </span>
      <span className="font-medium uppercase tracking-wide text-foreground">Cinemas</span>
    </span>
  );
}

const NAV_LINKS = [
  { label: "Em Cartaz", href: "/" },
  { label: "IMAX", href: "/#imax" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Campanhas", href: "/#campanhas" },
  { label: "Preçário", href: "/precario" },
  { label: "Os meus bilhetes", href: "/bilhetes" },
];

/** Atalho para "Os meus bilhetes", com o número de compras deste dispositivo. */
function MyTicketsLink({ label = false }: { label?: boolean }) {
  const hydrated = useHydrated();
  const count = useBookings().length;
  return (
    <Link
      to="/bilhetes"
      aria-label={`Os meus bilhetes${hydrated && count ? ` (${count})` : ""}`}
      className={
        label
          ? "relative flex items-center gap-2 whitespace-nowrap rounded-sm border border-primary px-3 py-1.5 text-primary transition hover:bg-primary hover:text-primary-foreground"
          : "relative flex h-11 w-11 items-center justify-center text-foreground"
      }
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 7h18v3a2 2 0 000 4v3H3v-3a2 2 0 000-4z" />
        <path d="M14 7v10" strokeDasharray="2 2" />
      </svg>
      {label && <span>Os meus bilhetes</span>}
      {hydrated && count > 0 && (
        <span
          className={
            label
              ? "rounded-full bg-primary px-1.5 text-[11px] leading-5 text-primary-foreground"
              : "absolute right-1 top-1.5 min-w-5 rounded-full bg-primary px-1 text-center text-[11px] font-bold leading-5 text-primary-foreground"
          }
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40">
      {/* Barra institucional */}
      <div className="hidden bg-secondary text-xs sm:block">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-4">
          <div className="flex h-full">
            <span className="flex items-center bg-background px-3 font-bold">Particulares</span>
            <span className="flex items-center px-3 text-muted-foreground">Empresas</span>
            <span className="flex items-center px-3 text-muted-foreground">A ZAP</span>
          </div>
          <span className="text-muted-foreground">Angola</span>
        </div>
      </div>
      {/* Menu principal */}
      <div className="bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 sm:h-16">
          <Link to="/" aria-label="ZAP Cinemas — início">
            <ZapWordmark className="text-xl" />
          </Link>
          <nav className="hidden items-center gap-5 text-[13px] font-bold uppercase tracking-wide lg:flex">
            {NAV_LINKS.filter((l) => l.href !== "/bilhetes").map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="whitespace-nowrap text-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            ))}
            <MyTicketsLink label />
          </nav>
          <div className="flex items-center gap-1 lg:hidden">
            <MyTicketsLink />
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="menu-movel"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              className="-mr-2 flex h-11 w-11 items-center justify-center text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="brand-line" />

      {/* Menu móvel */}
      {menuOpen && (
        <div
          id="menu-movel"
          className="animate-in fade-in fixed inset-x-0 bottom-0 top-[calc(3.5rem+4px)] z-40 overflow-y-auto bg-black/95 backdrop-blur-md duration-200 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <nav className="flex flex-col px-4 py-4">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                className="animate-fade-up flex items-center justify-between border-b border-border/60 py-4 text-lg font-bold uppercase tracking-wide text-foreground active:text-primary"
                style={{ "--delay": `${i * 50}ms` } as CSSProperties}
              >
                {l.label}
                <span aria-hidden className="text-primary">
                  ›
                </span>
              </a>
            ))}
            <Link
              to="/"
              hash="em-cartaz"
              className="mt-6 rounded-sm bg-primary py-3.5 text-center font-display text-base text-primary-foreground"
            >
              Comprar bilhetes
            </Link>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Shopping Avennida, Morro Bento · Luanda
            </p>
          </nav>
        </div>
      )}
    </header>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email && agreed) setDone(true);
  };

  return (
    <section className="bg-brand-gradient text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1fr_360px] md:items-center">
        <div>
          <h2 className="text-3xl font-medium">Newsletter</h2>
          <p className="mt-1 max-w-md text-sm">
            Seja o primeiro a saber das novidades de toda a programação da ZAP Cinemas. Subscreva já
            a nossa newsletter!
          </p>
        </div>
        {done ? (
          <p className="text-sm font-bold">Obrigado! A sua subscrição foi registada.</p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <div className="flex rounded-sm border border-white/80">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Inserir e-mail"
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/80 focus:outline-none"
              />
              <button
                type="submit"
                className="border-l border-white/80 px-5 text-sm transition hover:bg-white/15"
              >
                Aderir
              </button>
            </div>
            <label className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                className="mt-0.5"
              />
              <span>
                Ao submeter os seus dados, está a concordar com os{" "}
                <strong>Termos e Condições</strong>.
              </span>
            </label>
          </form>
        )}
      </div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  { title: "ZAP Cinemas", links: ["Em Cartaz", "IMAX", "Serviços", "Campanhas", "Preçário"] },
  {
    title: "Bilheteira",
    links: ["Os meus bilhetes", "Comprar bilhetes", "Escolha de lugares", "Sala VIP", "Sala IMAX"],
  },
  { title: "Ajuda", links: ["FAQs", "Contactos", "Termos e Condições"] },
];

function SiteFooter() {
  return (
    <footer className="mt-16">
      <Newsletter />
      <div className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-xs md:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-[13px] font-bold uppercase">{col.title}</p>
                <ul className="space-y-2 text-muted-foreground">
                  {col.links.map((l) => (
                    <li key={l}>
                      {l === "Preçário" ? (
                        <Link to="/precario" className="transition hover:text-primary">
                          {l}
                        </Link>
                      ) : l === "Os meus bilhetes" ? (
                        <Link to="/bilhetes" className="transition hover:text-primary">
                          {l}
                        </Link>
                      ) : (
                        l
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 md:col-span-1">
              <p className="mb-3 text-[13px] font-bold uppercase">Onde estamos</p>
              <p className="font-bold">Shopping Avennida, Morro Bento</p>
              <p className="text-muted-foreground">Luanda — Angola</p>
              <p className="mt-3 text-muted-foreground">
                Bilheteira aberta todos os dias, 13h–23h.
              </p>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground sm:flex-row sm:justify-between">
            <span>
              <span className="text-primary">© {new Date().getFullYear()} ZAP Cinemas</span> ·
              Termos e Condições · Política de Privacidade
            </span>
            <span>Demonstração: a bilheteira online é uma simulação de interface.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Céu estrelado animado, discreto, por trás das zonas sem fundo próprio. */
function Starfield() {
  return (
    <div aria-hidden className="starfield">
      <div className="starfield-layer starfield-sm" />
      <div className="starfield-layer starfield-md" />
      <div className="starfield-layer starfield-lg" />
      <span
        className="shooting-star"
        style={{ top: "18%", left: "78%", "--duration": "13s", "--delay": "3s" } as CSSProperties}
      />
      <span
        className="shooting-star"
        style={{ top: "55%", left: "95%", "--duration": "19s", "--delay": "11s" } as CSSProperties}
      />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Starfield />
      <div className="flex min-h-screen flex-col overflow-x-clip">
        <SiteHeader />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
