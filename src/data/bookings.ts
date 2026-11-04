import { useSyncExternalStore } from "react";

/**
 * Compras de bilhetes guardadas no browser (localStorage).
 *
 * O projecto é só front-end: não há servidor nem pagamentos reais. As compras
 * ficam neste dispositivo e os pagamentos são simulados. Para produção, estas
 * funções devem passar a chamar a API da bilheteira e do gateway de pagamento.
 */

export type PaymentMethod = "express" | "referencia";
export type BookingStatus = "pago" | "pendente";

export interface PaymentReference {
  entity: string;
  number: string;
  /** ISO 8601 */
  expiresAt: string;
}

export interface Booking {
  code: string;
  /** ISO 8601 */
  createdAt: string;
  movieSlug: string;
  movieTitle: string;
  sessionId: string;
  /** Dia da sessão, AAAA-MM-DD */
  date: string;
  time: string;
  format: string;
  room: string;
  tariff: string;
  seats: string[];
  unitPrice: number;
  total: number;
  customerName: string;
  phone: string;
  method: PaymentMethod;
  status: BookingStatus;
  reference?: PaymentReference;
  /** ISO 8601 */
  paidAt?: string;
}

const STORAGE_KEY = "zap-cinemas:compras";
const CHANGE_EVENT = "zap-cinemas:compras-alteradas";

/** Entidade de demonstração para os pagamentos por referência. */
export const DEMO_ENTITY = "12345";

const EMPTY: Booking[] = [];
let cachedRaw: string | null = null;
let cachedList: Booking[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): Booking[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(parsed) ? (parsed as Booking[]) : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

function getServerSnapshot(): Booking[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function save(list: Booking[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Armazenamento indisponível (modo privado, etc.): a compra só dura esta sessão.
    cachedRaw = null;
    cachedList = list;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Todas as compras deste dispositivo, mais recentes primeiro. */
export function useBookings(): Booking[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** `false` no servidor e durante a hidratação; `true` depois, no browser. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function addBooking(booking: Booking): void {
  save([booking, ...getSnapshot()]);
}

export function markBookingPaid(code: string): void {
  save(
    getSnapshot().map((b) =>
      b.code === code ? { ...b, status: "pago", paidAt: new Date().toISOString() } : b,
    ),
  );
}

/** Lugares já comprados (pagos ou a aguardar pagamento) numa sessão. */
export function reservedSeats(bookings: Booking[], sessionId: string): string[] {
  return bookings.filter((b) => b.sessionId === sessionId).flatMap((b) => b.seats);
}

function randomDigits(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => String(b % 10)).join("");
}

/** Código da compra, ex.: ZAP-4F7K2Q. */
export function newBookingCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `ZAP-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

/** Referência de pagamento válida por 24 horas. */
export function newPaymentReference(now = new Date()): PaymentReference {
  return {
    entity: DEMO_ENTITY,
    number: randomDigits(9),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/** "123456789" → "123 456 789" */
export function formatReference(n: string): string {
  return n.replace(/(\d{3})(?=\d)/g, "$1 ");
}

/** "923456789" → "+244 923 456 789" */
export function formatPhone(n: string): string {
  return `+244 ${formatReference(n)}`;
}

export function isValidAngolanMobile(n: string): boolean {
  return /^9\d{8}$/.test(n);
}

/** AAAA-MM-DD do dia `offset` dias a partir de hoje (hora local). */
export function dateForOffset(offset: number, now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "2026-11-04" → "qua, 4 nov 2026" */
export function formatSessionDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const value = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  const weekday = new Intl.DateTimeFormat("pt-AO", { weekday: "short" })
    .format(value)
    .replace(".", "");
  const month = new Intl.DateTimeFormat("pt-AO", { month: "short" }).format(value).replace(".", "");
  return `${weekday}, ${value.getDate()} ${month} ${value.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-AO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** A sessão já passou? (usa a hora de início da sessão) */
export function isPastSession(b: Pick<Booking, "date" | "time">, now = new Date()): boolean {
  const [y, m, d] = b.date.split("-").map(Number);
  const [hh, mi] = b.time.split(":").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, hh ?? 0, mi ?? 0) < now;
}
