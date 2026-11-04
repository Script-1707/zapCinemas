# ZAP Cinemas — Bilheteira Online

Front-end de um site de cinema com a identidade visual da **ZAP Cinemas**
(Luanda, Angola): filmes em exibição, detalhes e trailer, bilheteira online com
escolha de dia, sessão e lugares, e preçário.

> **Demonstração:** é só front-end. Os filmes são os que estavam em exibição no
> ZAP Cinemas Shopping Avenida na semana de 4 de novembro de 2026 (fonte:
> filmSPOT), mas os horários das sessões e os lugares ocupados são gerados no
> próprio código. Os pagamentos são simulados e
> as compras ficam guardadas no browser (`localStorage`) do dispositivo.

---

## Funcionalidades

### Percurso de compra

1. **Em exibição** (`/`): banner com o filme em destaque, letreiro com os
   títulos, atalhos (Em Cartaz, IMAX, Serviços, Campanhas, Preçário), filtro
   por dia e grelha de cartazes. Cada cartaz mostra a classificação etária e a
   fita da sala especial (SALA IMAX / SALA VIP) quando o filme tem sessões
   nessa sala.
2. **Detalhes do filme** (`/filmes/:slug`): sinopse, realização, elenco,
   duração, classificação e trailer do YouTube numa janela sobreposta.
3. **Escolha da sessão** (`/bilheteria/:slug`): próximos 5 dias e sessões de
   cada dia, com formato (2D Legendado, 2D Dobrado, 3D, VIP, IMAX), sala, preço
   e nome da tarifa aplicada.
4. **Escolha de lugares** (`/bilheteria/:slug/:sessaoId/lugares`): mapa da
   sala (filas A–J, 14 lugares por fila, corredor central), lugares ocupados,
   máximo de 6 lugares por compra, total actualizado ao vivo. Os lugares já
   comprados neste dispositivo aparecem ocupados.
5. **Pagamento** (`/bilheteria/:slug/:sessaoId/pagamento?lugares=A1,A2`):
   resumo da compra, nome e telemóvel (+244, 9 dígitos a começar por 9) e
   escolha do método:
   - **Multicaixa Express:** pedido enviado para o telemóvel e ecrã de espera
     pela confirmação na app (simulada ao fim de 5 segundos). Os bilhetes ficam
     logo disponíveis.
   - **Pagamento por Referência:** gera Entidade, Referência e Montante, válidos
     por 24 horas. A compra fica "Aguarda pagamento" e os lugares ficam
     reservados. O botão **Simular pagamento** confirma o pagamento.
6. **Os meus bilhetes** (`/bilhetes`): lista das compras deste dispositivo,
   separada em próximas sessões e sessões anteriores, com o estado (Pago /
   Aguarda pagamento). Acessível pelo ícone 🎫 no cabeçalho (com o número de
   compras), pelo menu e pelo rodapé.
7. **Detalhe da compra** (`/bilhetes/:codigo`): um bilhete por lugar (filme,
   data, hora, sala, fila, lugar e código de validação), ou os dados da
   referência quando o pagamento está pendente, e o resumo da compra.

#### Pagamentos reais

Toda a lógica de compras está em
[`src/data/bookings.ts`](src/data/bookings.ts) (`addBooking`,
`markBookingPaid`, `newPaymentReference`…). Para produção, estas funções devem
passar a chamar a API da bilheteira e de um fornecedor de pagamentos (EMIS /
banco). Valores de demonstração a substituir:

- Entidade `12345` (`DEMO_ENTITY`) e números de referência aleatórios.
- O código de validação de cada bilhete tem o aspecto de um QR, mas é
  decorativo: não é legível por um leitor de QR.

### Preçário (`/precario`)

Tabela completa de bilhetes da ZAP Cinemas, com separadores Bilhetes / Menus.
Os valores estão em [`src/data/prices.ts`](src/data/prices.ts).

O preço de cada sessão é calculado pelo dia da semana
(`tariffFor` em [`src/data/sessions.ts`](src/data/sessions.ts)):

| Dia                              | 2D       | 3D       |
| -------------------------------- | -------- | -------- |
| 2.ª, 3.ª e 5.ª feira — Económico | 2.200 Kz | 3.100 Kz |
| 4.ª feira — Quartas Loucas       | 1.900 Kz | 2.400 Kz |
| 6.ª feira a domingo — Normal     | 3.000 Kz | 3.600 Kz |

- **IMAX:** 5.500 Kz.
- **Sala VIP:** 7.500 Kz. **Valor provisório**: a Sala VIP não aparece no
  preçário público e o preço deve ser confirmado.
- As tarifas Matinal, Escola, pacotes Família, Aniversário e Óculos 3D aparecem
  no preçário, mas ainda não são aplicadas na compra.
- O separador **Menus** ainda não tem conteúdo.

---

## Identidade visual

Baseada na página "Em Exibição" e no preçário do site da ZAP Cinemas. Os
tokens estão em [`src/styles.css`](src/styles.css).

| Token           | Cor       | Uso                                      |
| --------------- | --------- | ---------------------------------------- |
| fundo           | `#000000` | Fundo principal, como uma sala de cinema |
| `brand-navy`    | `#232F3E` | Barra institucional e rodapé             |
| `brand-yellow`  | `#F5D008` | Cor de acção: botões, preços, datas      |
| `brand-magenta` | `#C70D6A` | Gradiente; lugares ocupados              |
| `brand-purple`  | `#5A4A9A` | Gradiente; fitas das salas               |
| `brand-blue`    | `#0C76BC` | Gradiente; destaques                     |
| `brand-green`   | `#81A560` | Gradiente                                |

- **Gradiente da marca:** magenta → roxo → azul → verde → amarelo, nas linhas
  entre secções (animadas) e no fundo da newsletter.
- **Tipografia:** Ubuntu (Google Fonts). Títulos em maiúsculas e negrito.
- **Cantos rectos** em cartazes e botões; arredondado só nos controlos
  circulares.
- **Língua:** português de Angola (bilhete, bilheteira, ecrã, realização) e
  preços em Kwanzas no formato `2.200 Kz`.
- **Logótipo:** o cabeçalho usa uma versão em texto ("zap CINEMAS") e o ícone
  da aba é um desenho ao estilo da marca. Para usar o logótipo oficial,
  substitua `ZapWordmark` em [`src/routes/__root.tsx`](src/routes/__root.tsx)
  e os ícones em [`public/`](public/).

### Animações

- Banner em carrossel automático (pára ao passar o rato ou ao tocar) com zoom
  lento na imagem.
- Céu estrelado de fundo em todas as páginas: três camadas de estrelas que
  cintilam e deslizam, e estrelas cadentes ocasionais.
- Entradas em cascata nos cartazes, sessões e cartões do preçário; brilho a
  passar nos botões de compra; lugares com efeito "pop" ao seleccionar.
- Quem tem activada a opção do sistema **reduzir movimento** vê o site sem
  animações.

### Telemóvel

O site foi ajustado para telemóvel (testado a 360px e 390px) e tablet (768px):

- Menu ☰ com todas as opções.
- Banner com troca por deslize do dedo.
- Atalhos numa linha e filtro de dias com deslize horizontal.
- Título e género por baixo de cada cartaz.
- Mapa de lugares que cabe no ecrã (14 lugares por fila) e barra fixa em baixo
  com os lugares escolhidos, o total e o botão **Continuar**.
- Preçário em duas colunas; rodapé compacto.
- Ícone e nome "ZAP Cinemas" ao adicionar o site ao ecrã inicial
  ([`public/site.webmanifest`](public/site.webmanifest)).

---

## Estrutura do projecto

```
src/
├── routes/
│   ├── __root.tsx                          # Cabeçalho, menu móvel, céu estrelado, newsletter, rodapé
│   ├── index.tsx                           # Em exibição (página inicial)
│   ├── filmes.$slug.tsx                    # Detalhes do filme e trailer
│   ├── bilheteria.$slug.index.tsx          # Escolha do dia e da sessão
│   ├── bilheteria.$slug.$sessaoId.lugares.tsx    # Mapa de lugares
│   ├── bilheteria.$slug.$sessaoId.pagamento.tsx  # Pagamento (Express / Referência)
│   ├── bilhetes.index.tsx                  # Os meus bilhetes
│   ├── bilhetes.$codigo.tsx                # Detalhe da compra e bilhetes
│   └── precario.tsx                        # Preçário
├── components/
│   ├── seat-map.tsx                        # Mapa da sala
│   ├── ticket.tsx                          # Bilhete individual
│   ├── status-badge.tsx                    # Estado da compra (Pago / Aguarda)
│   ├── age-badge.tsx                       # Classificação etária
│   └── ui/                                 # Componentes base (shadcn/ui)
├── data/
│   ├── movies.ts                           # Filmes em exibição
│   ├── sessions.ts                         # Sessões, tarifas, lugares ocupados
│   ├── prices.ts                           # Preçário ZAP Cinemas
│   └── bookings.ts                         # Compras, pagamentos e referências
├── assets/posters/                         # Cartazes dos filmes (600×890)
├── assets/backdrops/                       # Imagens horizontais para fundos (1280×720)
└── styles.css                              # Tokens da marca e animações
public/                                     # Ícones, manifest, robots.txt
```

### Onde mudar o quê

- **Filmes:** [`src/data/movies.ts`](src/data/movies.ts). Cada filme tem
  título (e título original), sinopse, género, duração, classificação (M/6 a
  M/16), cartaz, imagem de fundo e id do trailer no YouTube. `imax: true` dá-lhe
  sessões na Sala IMAX; `dubbedOnly: true` deixa só sessões dobradas (filmes
  infantis). Os três primeiros da lista aparecem no banner principal. Para
  mudar o cartaz da semana, troque a lista e as imagens.
- **Horários e formatos das sessões:** `SESSION_TEMPLATES` em
  [`src/data/sessions.ts`](src/data/sessions.ts).
- **Preços:** [`src/data/prices.ts`](src/data/prices.ts). O preço da Sala VIP
  está em `VIP_PRICE`, em `sessions.ts`.
- **Morada e textos do rodapé:** `SiteFooter` em
  [`src/routes/__root.tsx`](src/routes/__root.tsx).

---

## Tecnologia

- [TanStack Start](https://tanstack.com/start) (React 19, roteamento por
  ficheiros e renderização no servidor)
- Tailwind CSS v4 e componentes shadcn/ui
- Vite
- Vitest para testes

O projecto está ligado ao Lovable: os commits enviados para `main` são
sincronizados com o editor.

## Desenvolvimento

É preciso Node.js e npm ([instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone https://github.com/Script-1707/cineseat-tickets.git
cd cineseat-tickets
npm i
npm run dev
```

| Comando          | O que faz                   |
| ---------------- | --------------------------- |
| `npm run dev`    | Servidor de desenvolvimento |
| `npm run build`  | Build de produção           |
| `npm test`       | Testes                      |
| `npm run lint`   | Lint                        |
| `npm run format` | Formatação com Prettier     |

> Não corra `npm install` com `sudo`. Se a pasta `node_modules` ficar a
> pertencer ao root, o Vite não consegue criar a cache e a página carrega mas
> **não responde a cliques**. Para corrigir:
> `sudo chown -R $USER:$USER node_modules` e depois `npm run dev -- --force`.
