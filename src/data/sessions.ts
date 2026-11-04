import { movies } from "./movies";
import { getTicketPrice } from "./prices";

export type SessionFormat = "2D Legendado" | "2D Dobrado" | "3D" | "VIP" | "IMAX";

export interface Session {
  id: string;
  movieSlug: string;
  dayOffset: number; // 0 = hoje
  time: string;
  format: SessionFormat;
  room: string;
  price: number;
  /** Nome da tarifa do preçário aplicada (ex.: "Bilhete Quartas Loucas 2D"). */
  tariff: string;
}

export interface DayOption {
  offset: number;
  weekday: string;
  day: number;
  month: string;
  label: string; // "Hoje" | "Amanhã" | dia da semana
}

/**
 * A Sala VIP não aparece no preçário público da ZAP: valor provisório,
 * a confirmar com o cinema.
 */
const VIP_PRICE = 7500;

/** Tarifa do preçário para um formato num dado dia (0 = domingo … 6 = sábado). */
export function tariffFor(format: SessionFormat, weekday: number): { name: string; price: number } {
  if (format === "VIP") return { name: "Bilhete Sala VIP", price: VIP_PRICE };
  if (format === "IMAX") {
    const imax = getTicketPrice("imax");
    return { name: imax.name, price: imax.price };
  }
  const dim = format === "3D" ? "3d" : "2d";
  const kind = weekday === 3 ? "quartas" : weekday >= 1 && weekday <= 4 ? "economico" : "normal";
  const item = getTicketPrice(`${kind}-${dim}`);
  return { name: item.name, price: item.price };
}

function weekdayForOffset(dayOffset: number): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset).getDay();
}

const SESSION_TEMPLATES: { time: string; format: SessionFormat }[][] = [
  [
    { time: "14:30", format: "2D Legendado" },
    { time: "17:15", format: "VIP" },
    { time: "20:00", format: "2D Dobrado" },
    { time: "22:30", format: "2D Legendado" },
  ],
  [
    { time: "13:00", format: "2D Dobrado" },
    { time: "16:00", format: "2D Legendado" },
    { time: "19:00", format: "IMAX" },
    { time: "21:45", format: "2D Dobrado" },
  ],
  [
    { time: "15:30", format: "3D" },
    { time: "18:00", format: "VIP" },
    { time: "20:45", format: "2D Legendado" },
  ],
];

function roomFor(format: SessionFormat): string {
  if (format === "IMAX") return "Sala IMAX";
  if (format === "VIP") return "Sala VIP 2";
  if (format === "3D") return "Sala 5";
  return "Sala 3";
}

export function getSessionsForDay(movieSlug: string, dayOffset: number): Session[] {
  const movieIndex = Math.max(
    0,
    movies.findIndex((m) => m.slug === movieSlug),
  );
  const template = SESSION_TEMPLATES[movieIndex % SESSION_TEMPLATES.length];
  const rotation = (dayOffset + movieIndex) % template.length;
  const weekday = weekdayForOffset(dayOffset);
  return template.map((_, i) => {
    const slot = template[(i + rotation) % template.length];
    return {
      id: `${movieSlug}-${dayOffset}-${slot.time.replace(":", "")}`,
      movieSlug,
      dayOffset,
      time: slot.time,
      format: slot.format,
      room: roomFor(slot.format),
      ...(() => {
        const t = tariffFor(slot.format, weekday);
        return { price: t.price, tariff: t.name };
      })(),
    };
  });
}

/** Reconstrói a sessão a partir do id `<slug>-<dia>-<hhmm>`. */
export function getSession(sessionId: string): Session | undefined {
  const parts = sessionId.split("-");
  if (parts.length < 3) return undefined;
  const time = parts[parts.length - 1];
  const day = Number(parts[parts.length - 2]);
  if (Number.isNaN(day) || day < 0 || day > 30) return undefined;
  const slug = parts.slice(0, -2).join("-");
  return getSessionsForDay(slug, day).find((s) => s.id === sessionId);
}

export function getDays(): DayOption[] {
  const now = new Date();
  const weekdayFmt = new Intl.DateTimeFormat("pt-AO", { weekday: "short" });
  const monthFmt = new Intl.DateTimeFormat("pt-AO", { month: "short" });
  return Array.from({ length: 5 }, (_, offset) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const weekday = weekdayFmt.format(d).replace(".", "");
    return {
      offset,
      weekday,
      day: d.getDate(),
      month: monthFmt.format(d).replace(".", ""),
      label: offset === 0 ? "Hoje" : offset === 1 ? "Amanhã" : weekday,
    };
  });
}

export function formatPrice(value: number): string {
  // Formato do preçário ZAP: "2.200 Kz" (ponto como separador de milhares).
  return `${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Kz`;
}

export function formatDuration(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}min`;
}

/* ---- Mapa de lugares -------------------------------------------------- */

export const SEAT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "J"];
export const SEATS_PER_ROW = 14;

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lugares ocupados de uma sessão — determinístico por sessão (demo). */
export function getOccupiedSeats(sessionId: string): Set<string> {
  const random = mulberry32(hashString(sessionId));
  const occupied = new Set<string>();
  for (const row of SEAT_ROWS) {
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      if (random() < 0.42) occupied.add(`${row}${n}`);
    }
  }
  return occupied;
}

export function ticketCode(sessionId: string, seats: string[]): string {
  const n = hashString(`${sessionId}|${[...seats].sort().join(",")}`) % 100000;
  return `ZAP-${String(n).padStart(5, "0")}`;
}
