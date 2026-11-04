import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { TICKET_PRICES } from "@/data/prices";
import { formatPrice } from "@/data/sessions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/precario")({
  head: () => ({
    meta: [
      { title: "Preçário — ZAP Cinemas" },
      {
        name: "description",
        content:
          "Preçário da ZAP Cinemas: bilhetes 2D, 3D e IMAX, Quartas Loucas, sessões matinais, pacotes família e aniversário.",
      },
      { property: "og:title", content: "Preçário — ZAP Cinemas" },
      {
        property: "og:description",
        content: "Bilhetes 2D, 3D e IMAX, Quartas Loucas, pacotes família e aniversário.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PricesPage,
});

type Tab = "bilhetes" | "menus";

function PricesPage() {
  const [tab, setTab] = useState<Tab>("bilhetes");

  return (
    <div className="pb-4">
      <section className="relative isolate overflow-hidden bg-brand-hero">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <span className="spotlight spotlight-magenta left-[10%]" />
          <span className="spotlight spotlight-blue right-[10%]" />
        </div>
        <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:py-20">
          <p className="animate-fade-up text-sm font-bold uppercase tracking-[0.3em] text-primary">
            ZAP Cinemas
          </p>
          <h1
            className="animate-fade-up mt-2 font-display text-5xl sm:text-6xl"
            style={{ "--delay": "120ms" } as CSSProperties}
          >
            Preçário
          </h1>
          <p
            className="animate-fade-up mx-auto mt-3 max-w-xl text-muted-foreground"
            style={{ "--delay": "240ms" } as CSSProperties}
          >
            Às quartas-feiras é dia de Quartas Loucas. De 2.ª a 5.ª feira, bilhete económico.
          </p>
        </div>
      </section>
      <div className="brand-line" />

      <section className="mx-auto max-w-4xl px-4 pt-6 sm:pt-10">
        <div role="tablist" className="mb-6 flex gap-8 text-sm sm:mb-10">
          {(["bilhetes", "menus"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "relative py-2 capitalize text-primary transition after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-primary after:transition-transform after:duration-300",
                tab === t ? "after:scale-x-100" : "opacity-70 after:scale-x-0 hover:opacity-100",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "bilhetes" ? (
          <div key="bilhetes" className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
            {TICKET_PRICES.map((item, i) => (
              <article
                key={item.id}
                className="animate-fade-up group flex flex-col overflow-hidden rounded-lg border border-white/85 transition duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_14px_36px_-12px_rgba(245,208,8,0.45)]"
                style={{ "--delay": `${i * 40}ms` } as CSSProperties}
              >
                <div className="flex min-h-[96px] flex-1 flex-col items-center justify-center px-2 py-3 text-center sm:min-h-[110px] sm:px-3 sm:py-4">
                  <h2 className="text-[11px] font-bold uppercase leading-tight sm:text-[13px]">
                    {item.name}
                  </h2>
                  {item.days && (
                    <p className="mt-1 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                      {item.days}
                    </p>
                  )}
                </div>
                <div className="shine shine-hover border-t border-white/85 py-2.5 sm:py-3 text-center text-sm font-bold text-primary transition group-hover:border-primary">
                  {formatPrice(item.price)}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            key="menus"
            className="animate-fade-up rounded-lg border border-white/85 p-8 text-center"
          >
            <h2 className="font-display text-2xl">Menus do bar</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pipocas, bebidas e menus estão disponíveis no bar do cinema. Os preços dos menus ainda
              não foram carregados nesta bilheteira online.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/"
            hash="em-cartaz"
            className="shine shine-loop inline-flex items-center rounded-sm bg-primary px-6 py-3 font-display text-base text-primary-foreground transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Ver filmes em cartaz
          </Link>
        </div>
      </section>
    </div>
  );
}
