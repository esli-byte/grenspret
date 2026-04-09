# Grensbesparing

Bereken of het loont om in Duitsland of België te tanken en boodschappen te doen. Een Progressive Web App gebouwd met Next.js, TypeScript en Tailwind CSS.

## Features

- **Tankbesparing** — Voer je kenteken in (via RDW Open Data API) en bereken de besparing op een volle tank in DE/BE vs NL
- **Boodschappen** — Vergelijk 20 populaire producten en bereken je besparing
- **Routeberekening** — Geschatte afstand, rijtijd en reiskosten op basis van postcode
- **Grenslocaties** — 30 tankstations en supermarkten dicht bij de grens
- **Groepsbesparing** — Bereken besparing voor meerdere huishoudens
- **Live brandstofprijzen** — Duitse prijzen via Tankerkoenig API (optioneel)
- **PWA** — Installeerbaar, offline support, native app-gevoel
- **Affiliate shop** — Aanbevolen producten voor je grensrit

## Aan de slag

### Vereisten

- Node.js 18+
- npm

### Installatie

```bash
# Clone de repository
git clone <repo-url>
cd grensbesparings-app

# Installeer dependencies
npm install

# Kopieer environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

### Environment variables

| Variable | Verplicht | Beschrijving |
|---|---|---|
| `TANKERKOENIG_API_KEY` | Nee | API key voor live Duitse brandstofprijzen. Gratis account: [tankerkoenig.de](https://creativecommons.tankerkoenig.de/). Zonder key worden indicatieve prijzen gebruikt. |

### Build

```bash
npm run build
npm start
```

## Projectstructuur

```
src/
  app/
    api/fuel-prices/    — API route voor brandstofprijzen
    boodschappen/       — Boodschappen vergelijken
    offline/            — Offline fallback pagina
    resultaat/          — Totaaloverzicht met netto besparing
    shop/               — Affiliate producten
    tanken/             — Tankbesparing berekenen
  components/           — Gedeelde UI componenten
  lib/
    grenslocaties.ts    — Database met grenstankstations en supermarkten
    opslag.ts           — localStorage wrapper voor gedeelde state
public/
  icons/                — PWA iconen en splash screen
  sw.js                 — Service worker voor offline support
```

## Deployen op Vercel

1. Push je code naar GitHub
2. Ga naar [vercel.com/new](https://vercel.com/new) en importeer je repository
3. Voeg environment variables toe onder **Settings > Environment Variables**:
   - `TANKERKOENIG_API_KEY` (optioneel)
4. Deploy

De app bouwt automatisch bij elke push naar `main`.

## Technologie

- [Next.js 16](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) — Styling
- [RDW Open Data API](https://opendata.rdw.nl/) — Nederlandse voertuiggegevens
- [Tankerkoenig API](https://creativecommons.tankerkoenig.de/) — Duitse brandstofprijzen
