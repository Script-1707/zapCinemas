import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type CSSProperties, type ReactNode } from "react";
import { formatPrice } from "@/data/sessions";
import {
  formatDateTime,
  formatPhone,
  formatReference,
  formatSessionDate,
  markBookingPaid,
  useBookings,
  useHydrated,
  type Booking,
} from "@/data/bookings";
import { Ticket } from "@/components/ticket";
import { StatusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/bilhetes/$codigo")({
  // ?novo=1 — acabou de comprar: mostra a mensagem de sucesso.
  validateSearch: (search: Record<string, unknown>): { novo?: boolean } =>
    search["novo"] === true || search["novo"] === "true" || search["novo"] === 1
      ? { novo: true }
      : {},
  head: ({ params }) => ({
    meta: [
      { title: `Compra ${params.codigo} — ZAP Cinemas` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  const { codigo } = Route.useParams();
  const { novo } = Route.useSearch();
  const hydrated = useHydrated();
  const booking = useBookings().find((b) => b.code === codigo);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-10 w-2/3 animate-pulse rounded-sm bg-card" />
        <div className="mt-6 h-48 animate-pulse rounded-sm bg-card" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Compra não encontrada</h1>
        <p className="mt-3 text-muted-foreground">
          Não encontrámos a compra <span className="font-mono">{codigo}</span> neste dispositivo. As
          compras ficam guardadas no browser onde foram feitas.
        </p>
        <Link
          to="/bilhetes"
          className="mt-6 inline-flex rounded-sm bg-primary px-6 py-3 font-display text-base text-primary-foreground"
        >
          Os meus bilhetes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      <Link to="/bilhetes" className="text-sm text-muted-foreground transition hover:text-primary">
        ← Os meus bilhetes
      </Link>

      {booking.status === "pago" ? (
        <PaidView booking={booking} justBought={!!novo} />
      ) : (
        <PendingView booking={booking} justBought={!!novo} />
      )}

      <Summary booking={booking} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          hash="em-cartaz"
          className="rounded-sm border border-border px-5 py-3 text-center font-display text-base text-foreground transition hover:border-primary hover:text-primary"
        >
          Comprar mais bilhetes
        </Link>
      </div>
    </div>
  );
}

function PaidView({ booking, justBought }: { booking: Booking; justBought: boolean }) {
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {justBought && (
          <span className="animate-pop flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckIcon />
          </span>
        )}
        <h1 className="font-display text-3xl leading-none sm:text-4xl">
          {justBought ? "Pagamento confirmado!" : "Os seus bilhetes"}
        </h1>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Apresente cada bilhete à entrada da sala, no telemóvel. Chegue até 15 minutos antes da
        sessão.
      </p>
      <div className="mt-6 grid gap-4">
        {booking.seats.map((seat, i) => (
          <Ticket key={seat} booking={booking} seat={seat} index={i} />
        ))}
      </div>
    </>
  );
}

function PendingView({ booking, justBought }: { booking: Booking; justBought: boolean }) {
  const [paying, setPaying] = useState(false);
  const ref = booking.reference;
  const expired = ref ? new Date(ref.expiresAt) < new Date() : false;

  return (
    <>
      <h1 className="mt-4 font-display text-3xl leading-none sm:text-4xl">
        {justBought ? "Referência gerada" : "A aguardar pagamento"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Pague num ATM Multicaixa, no Internet Banking ou na app do seu banco, em{" "}
        <strong className="text-foreground">Pagamentos → Pagamento por Referência</strong>. Os
        lugares ficam reservados até ao fim do prazo; depois do pagamento, os bilhetes aparecem
        nesta página.
      </p>

      {ref && (
        <div
          className="animate-poster-in mt-6 overflow-hidden rounded-md border border-primary/50 bg-card glow-marquee"
          style={{ "--delay": "100ms" } as CSSProperties}
        >
          <div className="brand-line" />
          <dl className="grid divide-y divide-border">
            <RefRow label="Entidade" value={ref.entity} />
            <RefRow label="Referência" value={formatReference(ref.number)} />
            <RefRow label="Montante" value={formatPrice(booking.total)} highlight />
          </dl>
          <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            {expired ? "Prazo expirado em " : "Válida até "}
            <strong className="text-foreground">{formatDateTime(ref.expiresAt)}</strong>
          </p>
        </div>
      )}

      <div className="mt-6 rounded-sm border border-dashed border-border p-4">
        <p className="text-xs text-muted-foreground">
          Demonstração: não há ligação a um banco. Use o botão para simular que o pagamento foi
          feito.
        </p>
        <button
          type="button"
          disabled={paying}
          onClick={() => {
            setPaying(true);
            window.setTimeout(() => markBookingPaid(booking.code), 1200);
          }}
          className="mt-3 w-full rounded-sm bg-primary px-5 py-3 font-display text-base text-primary-foreground transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
        >
          {paying ? "A confirmar pagamento…" : "Simular pagamento"}
        </button>
      </div>
    </>
  );
}

function RefRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span
          className={
            highlight
              ? "whitespace-nowrap text-xl font-bold text-primary sm:text-2xl"
              : "whitespace-nowrap font-mono text-lg font-bold tracking-wide sm:text-2xl sm:tracking-wider"
          }
        >
          {value}
        </span>
        {!highlight && (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(value.replace(/\s/g, "")).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="shrink-0 rounded-sm border border-border px-2 py-1.5 text-[10px] font-bold uppercase text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        )}
      </dd>
    </div>
  );
}

function Summary({ booking }: { booking: Booking }) {
  return (
    <section className="mt-8 rounded-sm border border-border bg-card/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide">Resumo da compra</h2>
        <StatusBadge status={booking.status} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <Item label="Código">
          <span className="font-mono">{booking.code}</span>
        </Item>
        <Item label="Filme">{booking.movieTitle}</Item>
        <Item label="Sessão">
          <span className="capitalize">{formatSessionDate(booking.date)}</span> · {booking.time}
        </Item>
        <Item label="Sala">
          {booking.room} · {booking.format}
        </Item>
        <Item label="Lugares">{booking.seats.join(", ")}</Item>
        <Item label="Tarifa">
          {booking.seats.length} × {booking.tariff} ({formatPrice(booking.unitPrice)})
        </Item>
        <Item label="Pagamento">
          {booking.method === "express" ? "Multicaixa Express" : "Pagamento por Referência"}
        </Item>
        <Item label="Cliente">
          {booking.customerName} · {formatPhone(booking.phone)}
        </Item>
        <Item label="Comprado em">{formatDateTime(booking.createdAt)}</Item>
        {booking.paidAt && <Item label="Pago em">{formatDateTime(booking.paidAt)}</Item>}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <dt className="text-muted-foreground">Total</dt>
          <dd className="text-xl font-bold text-primary">{formatPrice(booking.total)}</dd>
        </div>
      </dl>
    </section>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M4 12.5l5 5L20 7" />
    </svg>
  );
}
