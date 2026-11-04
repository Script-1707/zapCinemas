/*
 * Filmes em exibição no ZAP Cinemas (Shopping Avenida, Luanda) — programação
 * da semana de 4 de novembro de 2026, segundo o filmSPOT.
 * Cartazes, imagens de fundo e trailers: filmSPOT / distribuidoras.
 * Para actualizar o cartaz, edite esta lista e troque as imagens em
 * src/assets/posters e src/assets/backdrops.
 */
import odisseiaPoster from "@/assets/posters/a-odisseia.jpg";
import streetFighterPoster from "@/assets/posters/street-fighter.jpg";
import clayfacePoster from "@/assets/posters/clayface.jpg";
import verityPoster from "@/assets/posters/verity.jpg";
import teeraoPoster from "@/assets/posters/operacao-teerao.jpg";
import heartPoster from "@/assets/posters/heart-of-the-beast.jpg";
import outraMaePoster from "@/assets/posters/uma-outra-mae.jpg";
import escolaPoster from "@/assets/posters/a-escola-dos-animais-magicos-4.jpg";
import odisseiaBackdrop from "@/assets/backdrops/a-odisseia.jpg";
import streetFighterBackdrop from "@/assets/backdrops/street-fighter.jpg";
import clayfaceBackdrop from "@/assets/backdrops/clayface.jpg";
import verityBackdrop from "@/assets/backdrops/verity.jpg";
import teeraoBackdrop from "@/assets/backdrops/operacao-teerao.jpg";
import heartBackdrop from "@/assets/backdrops/heart-of-the-beast.jpg";
import outraMaeBackdrop from "@/assets/backdrops/uma-outra-mae.jpg";
import escolaBackdrop from "@/assets/backdrops/a-escola-dos-animais-magicos-4.jpg";

/** Classificação etária (M/6, M/12, …). */
export type AgeRating = "6" | "12" | "14" | "16";

export interface Movie {
  slug: string;
  title: string;
  /** Título original, quando diferente do português. */
  originalTitle?: string | undefined;
  /** Frase curta de apresentação. */
  tagline: string;
  synopsis: string;
  genre: string;
  durationMin: number;
  ageRating: AgeRating;
  year: number;
  /** Cartaz vertical (600×890). */
  poster: string;
  /** Imagem horizontal (1280×720) para fundos. */
  backdrop: string;
  /** ID do trailer no YouTube. */
  trailerId: string;
  director: string;
  cast: string[];
  /** Tem sessões na Sala IMAX. */
  imax?: boolean | undefined;
  /** Só em versão portuguesa (dobrado) — filmes infantis. */
  dubbedOnly?: boolean | undefined;
}

export const POSTER_SIZE = { width: 600, height: 890 } as const;
export const BACKDROP_SIZE = { width: 1280, height: 720 } as const;

export const movies: Movie[] = [
  {
    slug: "a-odisseia",
    title: "A Odisseia",
    originalTitle: "The Odyssey",
    tagline: "O épico de Homero, por Christopher Nolan, em IMAX.",
    synopsis:
      "Depois da Guerra de Troia, Ulisses, rei de Ítaca, tenta regressar a casa. Durante dez anos enfrenta deuses, monstros e provações sem fim, enquanto luta para reencontrar a mulher e recuperar o seu reino.",
    genre: "Aventura · Ação · Fantasia",
    durationMin: 172,
    ageRating: "14",
    year: 2026,
    poster: odisseiaPoster,
    backdrop: odisseiaBackdrop,
    trailerId: "Y7kyuElktjo",
    director: "Christopher Nolan",
    cast: ["Matt Damon", "Tom Holland", "Anne Hathaway", "Robert Pattinson"],
    imax: true,
  },
  {
    slug: "street-fighter",
    title: "Street Fighter",
    tagline: "O torneio World Warrior chega ao grande ecrã.",
    synopsis:
      "Em 1993, Ryu e Ken Masters voltam a cruzar-se quando a misteriosa Chun-Li os recruta para o torneio World Warrior. Por trás da competição esconde-se uma conspiração mortal, que os obriga a lutar um contra o outro e a enfrentar o próprio passado.",
    genre: "Ação · Fantasia",
    durationMin: 119,
    ageRating: "12",
    year: 2026,
    poster: streetFighterPoster,
    backdrop: streetFighterBackdrop,
    trailerId: "R7F6nQtBd5k",
    director: "Kitao Sakurai",
    cast: ["Andrew Koji", "Noah Centineo", "Callina Liang", "Joe Anoa'i"],
    imax: true,
  },
  {
    slug: "clayface",
    title: "Clayface",
    tagline: "Terror no universo DC: um rosto que pode ser qualquer um.",
    synopsis:
      "Um actor de filmes série B injecta-se com uma substância experimental e ganha a capacidade de moldar o rosto e o corpo. A transformação não pára — e ele torna-se uma figura de argila viva, cada vez menos humana.",
    genre: "Terror · Thriller · Ficção científica",
    durationMin: 109,
    ageRating: "16",
    year: 2026,
    poster: clayfacePoster,
    backdrop: clayfaceBackdrop,
    trailerId: "ZEERntEKOOM",
    director: "James Watkins",
    cast: ["Tom Rhys Harries", "Naomi Ackie", "Eddie Marsan", "Max Minghella"],
  },
  {
    slug: "verity",
    title: "Verity",
    tagline: "Baseado no best-seller de Colleen Hoover.",
    synopsis:
      "Lowen Ashleigh, escritora com dificuldades financeiras, aceita terminar a série de sucesso de Verity Crawford, que ficou incapacitada após um acidente misterioso. Ao chegar à casa da autora, descobre que a verdade é muito diferente do que parece.",
    genre: "Thriller · Mistério",
    durationMin: 117,
    ageRating: "14",
    year: 2026,
    poster: verityPoster,
    backdrop: verityBackdrop,
    trailerId: "Z0hAZ6W8s28",
    director: "Michael Showalter",
    cast: ["Dakota Johnson", "Anne Hathaway", "Josh Hartnett", "Ismael Cruz Córdova"],
  },
  {
    slug: "operacao-teerao",
    title: "Operação Teerão",
    originalTitle: "The Fix",
    tagline: "Uma última missão para quem já não tem nada a perder.",
    synopsis:
      "Depois do fim da guerra no Afeganistão, um grupo de antigos agentes da CIA, desacreditados e marcados pelo conflito, parte para Teerão numa última missão que pode dar um novo rumo às suas vidas.",
    genre: "Ação · Thriller",
    durationMin: 142,
    ageRating: "16",
    year: 2026,
    poster: teeraoPoster,
    backdrop: teeraoBackdrop,
    trailerId: "e4-HN8pbzSc",
    director: "Guy Moshe",
    cast: ["Zachary Levi", "Liam Neeson", "Wes Chatham", "Titus Welliver"],
  },
  {
    slug: "heart-of-the-beast",
    title: "Heart of the Beast — Heróis Inseparáveis",
    originalTitle: "Heart of the Beast",
    tagline: "Um homem, um cão e o Alasca selvagem.",
    synopsis:
      "Um antigo militar e o seu cão ficam isolados no Alasca depois de um acidente de avião. Para voltarem à civilização, terão de sobreviver a um terreno implacável — e aos fantasmas que o acompanham.",
    genre: "Aventura · Thriller",
    durationMin: 101,
    ageRating: "12",
    year: 2026,
    poster: heartPoster,
    backdrop: heartBackdrop,
    trailerId: "9b8nU3QT908",
    director: "David Ayer",
    cast: ["Brad Pitt", "J.K. Simmons", "Anna Lambe"],
  },
  {
    slug: "uma-outra-mae",
    title: "Uma Outra Mãe",
    originalTitle: "Other Mommy",
    tagline: "Há uma mãe no armário que quer entrar no seu coração.",
    synopsis:
      "Bela, de oito anos, cresce numa casa abalada pelo casamento difícil dos pais. Começa a ser visitada por uma entidade a quem chama «Outra Mamã». Quando Bela recusa deixá-la entrar no seu coração, a presença torna-se cada vez mais agressiva e põe toda a família em perigo.",
    genre: "Terror",
    durationMin: 93,
    ageRating: "16",
    year: 2026,
    poster: outraMaePoster,
    backdrop: outraMaeBackdrop,
    trailerId: "4SKyCiDgl3s",
    director: "Rob Savage",
    cast: ["Jessica Chastain", "Arabella Olivia Clark", "Jay Duplass", "Dichen Lachman"],
  },
  {
    slug: "a-escola-dos-animais-magicos-4",
    title: "A Escola dos Animais Mágicos 4",
    originalTitle: "Die Schule der magischen Tiere 4",
    tagline: "A turma mais mágica tem de salvar a escola. Versão portuguesa.",
    synopsis:
      "Miriam muda-se por uns meses para casa da amiga Ida e entra na Escola Winterstein, onde descobre uma comunidade mágica. Recebe como companheiro o irrequieto társio Fitzgeraldo. Quando a turma descobre que a escola pode fechar, decide enfrentar um desafio que pode ser a última esperança.",
    genre: "Fantasia · Aventura · Família",
    durationMin: 102,
    ageRating: "6",
    year: 2025,
    poster: escolaPoster,
    backdrop: escolaBackdrop,
    trailerId: "ihTIWO5i9zw",
    director: "Bernhard Jasper, Maggie Peren",
    cast: ["Emilia Maier", "Loris Sichrovsky", "Marleen Lohse", "Lilith Julie Johna"],
    dubbedOnly: true,
  },
];

export function getMovie(slug: string | undefined): Movie | undefined {
  return movies.find((m) => m.slug === slug);
}
