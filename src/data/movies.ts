import ecosPoster from "@/assets/posters/ecos-do-amanha.jpg";
import casaPoster from "@/assets/posters/a-casa-nas-colinas.jpg";
import sertaoPoster from "@/assets/posters/sertao-vermelho.jpg";
import orbitaPoster from "@/assets/posters/orbita-zero.jpg";
import jardimPoster from "@/assets/posters/o-jardim-secreto-da-aurora.jpg";
import chamadaPoster from "@/assets/posters/ultima-chamada.jpg";

export type AgeRating = "L" | "12" | "14" | "16";

export interface Movie {
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  genre: string;
  durationMin: number;
  ageRating: AgeRating;
  year: number;
  poster: string;
  trailerId: string;
  director: string;
  cast: string[];
}

export const movies: Movie[] = [
  {
    slug: "ecos-do-amanha",
    title: "Ecos do Amanhã",
    tagline: "O futuro chama de volta.",
    synopsis:
      "A arqueóloga Helena Vasques descobre que uma cidade futura envia sinais ao passado — e cada resposta apaga um dia da sua memória. Um épico de ficção científica sobre o preço de salvar o amanhã.",
    genre: "Ficção científica",
    durationMin: 138,
    ageRating: "12",
    year: 2026,
    poster: ecosPoster,
    trailerId: "zSWdZVtXT7E",
    director: "Marina Duarte",
    cast: ["Helena Vasques", "Pedro Bittar", "Ícaro Lins"],
  },
  {
    slug: "a-casa-nas-colinas",
    title: "A Casa nas Colinas",
    tagline: "Alguns lugares não devem ser encontrados.",
    synopsis:
      "Quando a família Duarte herda uma fazenda isolada no alto das colinas, descobre que a casa guarda a memória de quem nunca a deixou. Um terror de atmosfera sobre heranças que não deveriam ser abertas.",
    genre: "Terror",
    durationMin: 104,
    ageRating: "16",
    year: 2026,
    poster: casaPoster,
    trailerId: "DzfpyUB60YY",
    director: "Caio Ribeiro",
    cast: ["Lívia Martins", "Rodrigo Almeida", "Antônio Ferraz"],
  },
  {
    slug: "sertao-vermelho",
    title: "Sertão Vermelho",
    tagline: "Algumas terras não são feitas para serem esquecidas.",
    synopsis:
      "No coração do sertão, o vaqueiro Bento percorre a terra vermelha em busca da resposta pelo desaparecimento do irmão — e encontra um povo inteiro disposto a não esquecer. Um drama sobre terra, gente e resistência.",
    genre: "Drama",
    durationMin: 121,
    ageRating: "14",
    year: 2025,
    poster: sertaoPoster,
    trailerId: "7d_jQycdQGo",
    director: "Luiz Carlos Oliveira",
    cast: ["João Pedro Santos", "Marta Cavalcanti", "Zé do Vale"],
  },
  {
    slug: "orbita-zero",
    title: "Órbita Zero",
    tagline: "Uma missão. Um só caminho. Zero gravidade.",
    synopsis:
      "A piloto Lucía Santos tem 90 minutos para despressurizar a Estação Aurora antes que ela colida com a Terra — sem comunicação, sem combustível e sem segunda chance.",
    genre: "Ação · Ficção científica",
    durationMin: 129,
    ageRating: "14",
    year: 2026,
    poster: orbitaPoster,
    trailerId: "hEJnMQG9ev8",
    director: "Diego Lemos",
    cast: ["Lucía Santos", "Daniel Keller", "Martín Ruiz"],
  },
  {
    slug: "o-jardim-secreto-da-aurora",
    title: "O Jardim Secreto da Aurora",
    tagline: "Segredos só florescem quando a gente acredita.",
    synopsis:
      "Aurora, 9 anos, ganha um jardim que só floresce para quem acredita. Com a ajuda da Raposa, ela descobre que os segredos mais bonitos crescem devagar — e precisam de companhia.",
    genre: "Animação · Família",
    durationMin: 96,
    ageRating: "L",
    year: 2026,
    poster: jardimPoster,
    trailerId: "Ga6RYejo6Hk",
    director: "Bela Fontes",
    cast: ["Alice Prado (voz)", "Tonho Braga (voz)", "Duda Lins (voz)"],
  },
  {
    slug: "ultima-chamada",
    title: "Última Chamada",
    tagline: "Algumas ligações não deveriam ser atendidas.",
    synopsis:
      "Um telefonista noturno atende uma ligação que nunca deveria existir: a própria voz, pedindo ajuda de três dias no futuro. A cada minuto que passa, escolher a quem acreditar se torna uma questão de sobrevivência.",
    genre: "Suspense",
    durationMin: 112,
    ageRating: "16",
    year: 2026,
    poster: chamadaPoster,
    trailerId: "YoHD9XEInc0",
    director: "Rafael Mendes",
    cast: ["Otávio Nunes", "Carla Reis", "Nando Prado"],
  },
];

export function getMovie(slug: string | undefined): Movie | undefined {
  return movies.find((m) => m.slug === slug);
}
