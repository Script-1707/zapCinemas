/**
 * Preçário ZAP Cinemas (bilhetes), conforme a página de preçário do site
 * (consultada a 04/11/2026). Valores em Kwanzas.
 */

export interface PriceItem {
  id: string;
  name: string;
  days?: string;
  price: number;
}

export const TICKET_PRICES: PriceItem[] = [
  { id: "economico-2d", name: "Bilhete Económico 2D", days: "2.ª Feira a 5.ª Feira", price: 2200 },
  {
    id: "normal-2d",
    name: "Bilhete Normal 2D",
    days: "6.ª Feira a Domingo e feriados",
    price: 3000,
  },
  { id: "economico-3d", name: "Bilhete Económico 3D", days: "2.ª Feira a 5.ª Feira", price: 3100 },
  {
    id: "normal-3d",
    name: "Bilhete Normal 3D",
    days: "6.ª Feira a Domingo e feriados",
    price: 3600,
  },
  { id: "imax", name: "Bilhete IMAX", days: "6.ª Feira a Domingo e feriados", price: 5500 },
  {
    id: "escola-2d",
    name: "Bilhete Escola 2D",
    days: "Sábado, Domingos e feriados de manhã",
    price: 1600,
  },
  {
    id: "escola-3d",
    name: "Bilhete Escola 3D",
    days: "Sábado, Domingos e feriados de manhã",
    price: 2500,
  },
  { id: "quartas-2d", name: "Bilhete Quartas Loucas 2D", days: "Quarta-feira", price: 1900 },
  { id: "quartas-3d", name: "Bilhete Quartas Loucas 3D", days: "Quarta-feira", price: 2400 },
  { id: "matinal-2d", name: "Bilhete Matinal 2D", price: 1900 },
  { id: "matinal-3d", name: "Bilhete Matinal 3D", price: 2400 },
  {
    id: "familia-eco-2d",
    name: "Pacote Família Económico (2 adultos e uma criança) 2D",
    days: "2.ª Feira a 5.ª Feira",
    price: 6000,
  },
  {
    id: "familia-extra-eco-2d",
    name: "Bilhete Família Extra Económico (adicione até 4 crianças) 2D",
    days: "2.ª Feira a 5.ª Feira",
    price: 2000,
  },
  {
    id: "familia-eco-3d",
    name: "Pacote Família Económico (2 adultos e uma criança) 3D",
    days: "2.ª Feira a 5.ª Feira",
    price: 8700,
  },
  {
    id: "familia-extra-eco-3d",
    name: "Bilhete Família Extra Económico (adicione até 4 crianças) 3D",
    days: "2.ª Feira a 5.ª Feira",
    price: 2900,
  },
  {
    id: "familia-normal-2d",
    name: "Pacote Família Normal (2 adultos e uma criança) 2D",
    days: "6.ª Feira a Domingo e feriados",
    price: 8700,
  },
  {
    id: "familia-extra-normal-2d",
    name: "Bilhete Família Extra Normal (adicione até 4 crianças) 2D",
    days: "6.ª Feira a Domingo e feriados",
    price: 2900,
  },
  {
    id: "familia-normal-3d",
    name: "Pacote Família Normal (2 adultos e uma criança) 3D",
    days: "6.ª Feira a Domingo e feriados",
    price: 10200,
  },
  {
    id: "familia-extra-normal-3d",
    name: "Bilhete Família Extra Normal (adicione até 4 crianças) 3D",
    days: "6.ª Feira a Domingo e feriados",
    price: 3400,
  },
  { id: "aniversario", name: "Pacote Aniversário", price: 7100 },
  { id: "oculos-3d", name: "Óculos 3D", price: 1500 },
];

export function getTicketPrice(id: string): PriceItem {
  const item = TICKET_PRICES.find((p) => p.id === id);
  if (!item) throw new Error(`Preço desconhecido: ${id}`);
  return item;
}
