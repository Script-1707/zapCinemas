import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { getMovie } from "@/data/movies";
import { formatPrice, getOccupiedSeats, getSession, parseSeatList } from "@/data/sessions";
import {
  addBooking,
  dateForOffset,
  formatPhone,
  formatSessionDate,
  isValidAngolanMobile,
  newBookingCode,
  newPaymentReference,
  reservedSeats,
  useBookings,
  useHydrated,
  type Booking,
  type PaymentMethod,
} from "@/data/bookings";
import { cn } from "@/lib/utils";

const MAX_SEATS = 6;
/** Tempo até a confirmação simulada na app Multicaixa Express. */
const EXPRESS_CONFIRM_MS = 5000;

export const Route = createFileRoute("/bilheteria/$slug/$sessaoId/pagamento")({
  validateSearch: (search: Record<string, unknown>): { lugares: string } => ({
    lugares: typeof search["lugares"] === "string" ? search["lugares"] : "",
  }),
  loader: ({ params }) => {
    const session = getSession(params.sessaoId);
    if (!session || session.movieSlug !== params.slug) throw notFound();
    const movie = getMovie(params.slug);
    if (!movie) throw notFound();
    return { session, movie };
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `Pagamento — ${loaderData.movie.title} — ZAP Cinemas`
      : "Pagamento — ZAP Cinemas";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: "Pague os seus bilhetes com Multicaixa Express ou por referência.",
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: PaymentPage,
});

function PaymentPage() {
  const { session, movie } = Route.useLoaderData();
  const { lugares } = Route.useSearch();
  const navigate = useNavigate();
  const bookings = useBookings();
  const hydrated = useHydrated();

  const seats = useMemo(() => parseSeatList(lugares), [lugares]);
  const unavailable = useMemo(() => {
    const taken = getOccupiedSeats(session.id);
    for (const s of reservedSeats(bookings, session.id)) taken.add(s);
    return seats.filter((s) => taken.has(s));
  }, [seats, session.id, bookings]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("express");
  const [errors, setErrors] = useState<{ name?: string | undefined; phone?: string | undefined }>(
    {},
  );
  const [waitingExpress, setWaitingExpress] = useState<Booking | null>(null);
  // Depois de gravar a compra, os lugares passam a "ocupados": não mostrar o aviso de indisponível.
  const [completed, setCompleted] = useState(false);

  const total = seats.length * session.price;
  const sessionDate = dateForOffset(session.dayOffset);
  const backToSeats = {
    to: "/bilheteria/$slug/$sessaoId/lugares" as const,
    params: { slug: movie.slug, sessaoId: session.id },
    search: { lugares: seats.join(",") },
  };

  // Multicaixa Express: simula a confirmação do cliente na app.
  useEffect(() => {
    if (!waitingExpress) return;
    const id = window.setTimeout(() => {
      setCompleted(true);
      addBooking({ ...waitingExpress, status: "pago", paidAt: new Date().toISOString() });
      void navigate({
        to: "/bilhetes/$codigo",
        params: { codigo: waitingExpress.code },
        search: { novo: true },
      });
    }, EXPRESS_CONFIRM_MS);
    return () => window.clearTimeout(id);
  }, [waitingExpress, navigate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "").replace(/^244/, "");
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = "Indique o seu nome.";
    if (!isValidAngolanMobile(digits))
      nextErrors.phone = "Número de telemóvel inválido (9 dígitos, começa por 9).";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const booking: Booking = {
      code: newBookingCode(),
      createdAt: new Date().toISOString(),
      movieSlug: movie.slug,
      movieTitle: movie.title,
      sessionId: session.id,
      date: sessionDate,
      time: session.time,
      format: session.format,
      room: session.room,
      tariff: session.tariff,
      seats,
      unitPrice: session.price,
      total,
      customerName: name.trim(),
      phone: digits,
      method,
      status: "pendente",
    };

    if (method === "express") {
      setWaitingExpress(booking);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setCompleted(true);
    addBooking({ ...booking, reference: newPaymentReference() });
    void navigate({
      to: "/bilhetes/$codigo",
      params: { codigo: booking.code },
      search: { novo: true },
    });
  };

  if (completed) return <div className="min-h-[60vh]" />;

  // Sem lugares válidos, ou lugares que entretanto foram comprados.
  if (seats.length === 0 || seats.length > MAX_SEATS || (hydrated && unavailable.length > 0)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Escolha os lugares outra vez</h1>
        <p className="mt-3 text-muted-foreground">
          {unavailable.length > 0
            ? `O${unavailable.length > 1 ? "s lugares" : " lugar"} ${unavailable.join(", ")} já não está disponível.`
            : "Não encontrámos lugares válidos para esta compra."}
        </p>
        <Link
          to="/bilheteria/$slug/$sessaoId/lugares"
          params={{ slug: movie.slug, sessaoId: session.id }}
          className="mt-6 inline-flex rounded-sm bg-primary px-6 py-3 font-display text-base text-primary-foreground"
        >
          Voltar ao mapa de lugares
        </Link>
      </div>
    );
  }

  if (waitingExpress) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center sm:py-16">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PhoneIcon className="h-8 w-8" />
          </span>
        </div>
        <h1 className="mt-6 font-display text-3xl leading-tight">
          Confirme na app Multicaixa Express
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enviámos um pedido de pagamento de{" "}
          <strong className="text-foreground normal-case">{formatPrice(total)}</strong> para{" "}
          <strong className="text-foreground">{formatPhone(waitingExpress.phone)}</strong>. Abra a
          app e aceite o pagamento.
        </p>
        <div className="mx-auto mt-8 h-1 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className="animate-progress h-full bg-primary"
            style={{ "--duration": `${EXPRESS_CONFIRM_MS}ms` } as CSSProperties}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">A aguardar confirmação…</p>
        <button
          type="button"
          onClick={() => setWaitingExpress(null)}
          className="mt-8 rounded-sm border border-border px-5 py-3 text-sm font-bold uppercase text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:pt-10">
      <Link
        {...backToSeats}
        className="text-sm text-muted-foreground transition hover:text-primary"
      >
        ← Alterar lugares
      </Link>

      <div className="mt-4">
        <span className="font-display text-sm tracking-[0.4em] text-primary">PAGAMENTO</span>
        <h1 className="mt-1 font-display text-4xl leading-none sm:text-5xl">Finalize a compra</h1>
      </div>

      <div className="mt-6 grid gap-6 sm:mt-10 lg:grid-cols-[1fr_340px] lg:gap-10">
        {/* Resumo */}
        <aside className="h-max rounded-sm border border-border bg-card p-5 lg:order-2 lg:sticky lg:top-24">
          <div className="flex gap-4">
            <img
              src={movie.poster}
              alt=""
              width={1024}
              height={1536}
              className="aspect-[2/3] w-16 shrink-0 object-cover"
            />
            <div className="min-w-0 text-sm">
              <p className="font-bold uppercase leading-tight">{movie.title}</p>
              <p className="mt-1 capitalize text-muted-foreground">
                {hydrated ? formatSessionDate(sessionDate) : sessionDate} · {session.time}
              </p>
              <p className="text-muted-foreground">
                {session.format} · {session.room}
              </p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Lugares">{seats.join(", ")}</Row>
            <Row label="Tarifa">{session.tariff}</Row>
            <Row label="Preço">
              {seats.length} × {formatPrice(session.price)}
            </Row>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-3xl text-primary normal-case!">
              {formatPrice(total)}
            </span>
          </div>
        </aside>

        {/* Formulário */}
        <form onSubmit={submit} noValidate className="flex flex-col gap-6 lg:order-1">
          <fieldset className="grid gap-4">
            <legend className="mb-3 text-sm font-bold uppercase tracking-wide">
              Os seus dados
            </legend>
            <Field label="Nome" error={errors.name}>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((er) => ({ ...er, name: undefined }));
                }}
                className="w-full rounded-sm border border-input bg-card px-4 py-3 text-base outline-none transition focus:border-primary"
                placeholder="O seu nome"
              />
            </Field>
            <Field label="Telemóvel" error={errors.phone}>
              <div className="flex rounded-sm border border-input bg-card transition focus-within:border-primary">
                <span className="flex items-center border-r border-input px-3 text-muted-foreground">
                  +244
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors((er) => ({ ...er, phone: undefined }));
                  }}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base outline-none"
                  placeholder="9XX XXX XXX"
                />
              </div>
            </Field>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-bold uppercase tracking-wide">
              Método de pagamento
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <MethodOption
                checked={method === "express"}
                onSelect={() => setMethod("express")}
                icon={<PhoneIcon className="h-7 w-7" />}
                title="Multicaixa Express"
                text="Confirme o pagamento na app, no seu telemóvel. Os bilhetes ficam logo disponíveis."
              />
              <MethodOption
                checked={method === "referencia"}
                onSelect={() => setMethod("referencia")}
                icon={<ReferenceIcon className="h-7 w-7" />}
                title="Pagamento por Referência"
                text="Receba entidade e referência para pagar num ATM ou no Internet Banking (24 horas)."
              />
            </div>
          </fieldset>

          <button
            type="submit"
            className="shine shine-loop w-full rounded-sm bg-primary px-6 py-4 font-display text-lg text-primary-foreground transition hover:brightness-110 sm:w-auto sm:self-start"
          >
            {method === "express" ? "Pagar" : "Gerar referência"}{" "}
            <span className="normal-case">{formatPrice(total)}</span>
          </button>
          <p className="text-xs text-muted-foreground">
            A compra fica guardada neste dispositivo, em{" "}
            <strong className="text-foreground">Os meus bilhetes</strong>.
          </p>
        </form>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium normal-case">{children}</dd>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
      {error && <span className="text-xs font-bold text-[#ff6fae]">{error}</span>}
    </label>
  );
}

function MethodOption({
  checked,
  onSelect,
  icon,
  title,
  text,
}: {
  checked: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer gap-3 rounded-sm border p-4 transition",
        checked
          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--brand-yellow)]"
          : "border-border bg-card hover:border-primary/60",
      )}
    >
      <input type="radio" name="metodo" checked={checked} onChange={onSelect} className="sr-only" />
      <span className={cn("shrink-0", checked ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
      <span>
        <span className="block font-bold uppercase leading-tight">{title}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{text}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute right-3 top-3 h-4 w-4 rounded-full border-2",
          checked ? "border-primary bg-primary" : "border-muted-foreground",
        )}
      />
    </label>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <path d="M10.5 18.5h3M9 9.5l2 2 4-4" />
    </svg>
  );
}

function ReferenceIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M7 9h4M7 12.5h10M7 16h7M15 9h2" />
    </svg>
  );
}
