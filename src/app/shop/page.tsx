import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

type Product = {
  id: string;
  naam: string;
  beschrijving: string;
  prijs: string;
  icoon: string;
  kleur: string;
  link: string;
  knopTekst: string;
};

const PRODUCTEN: Product[] = [
  {
    id: "jerrycan-5l",
    naam: "Jerrycan 5 liter",
    beschrijving:
      "Goedgekeurde metalen jerrycan voor benzine of diesel. Ideaal om mee te nemen over de grens en extra te besparen.",
    prijs: "€18,95",
    icoon: "⛽",
    kleur: "from-red-500 to-orange-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
  },
  {
    id: "jerrycan-10l",
    naam: "Jerrycan 10 liter",
    beschrijving:
      "Grotere metalen jerrycan met UN-keurmerk. Bespaar nog meer per rit door extra liters mee te nemen.",
    prijs: "€24,95",
    icoon: "🛢️",
    kleur: "from-red-600 to-red-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
  },
  {
    id: "jerrycan-20l",
    naam: "Jerrycan 20 liter",
    beschrijving:
      "Professionele 20L jerrycan met schenktuit. Maximale besparing voor wie regelmatig over de grens tankt.",
    prijs: "€32,95",
    icoon: "🏗️",
    kleur: "from-orange-500 to-amber-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
  },
  {
    id: "brandstofslang",
    naam: "Brandstofslang met pomp",
    beschrijving:
      "Handmatige overhevelpomp met slang. Makkelijk brandstof overhevelen van jerrycan naar tank.",
    prijs: "€12,95",
    icoon: "🔧",
    kleur: "from-gray-600 to-gray-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
  },
  {
    id: "koeltas-groot",
    naam: "Koeltas XL (30 liter)",
    beschrijving:
      "Geïsoleerde koeltas die je boodschappen vers houdt op de terugweg. Past makkelijk in de kofferbak.",
    prijs: "€29,95",
    icoon: "🧊",
    kleur: "from-sky-500 to-blue-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
  },
  {
    id: "koeltas-compact",
    naam: "Koeltas Compact (15 liter)",
    beschrijving:
      "Compacte koeltas voor kleinere boodschappen. Ideaal voor zuivel en vlees.",
    prijs: "€19,95",
    icoon: "❄️",
    kleur: "from-cyan-500 to-teal-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
  },
  {
    id: "boodschappentas-set",
    naam: "Herbruikbare tassen (set van 4)",
    beschrijving:
      "Stevige, opvouwbare boodschappentassen. Bespaar op tasjes en draag meer mee van je grensrit.",
    prijs: "€14,95",
    icoon: "🛍️",
    kleur: "from-emerald-500 to-green-400",
    link: "#",
    knopTekst: "Bestel hier",
  },
  {
    id: "kofferbak-organizer",
    naam: "Kofferbak organizer",
    beschrijving:
      "Opvouwbare kofferbak-organizer met meerdere vakken. Houd je jerrycans en boodschappen geordend.",
    prijs: "€22,95",
    icoon: "📦",
    kleur: "from-violet-500 to-purple-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
  },
];

export default function ShopPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Grensrit Shop"
        subtitle="Handige producten voor je rit over de grens"
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="space-y-6">
          {/* Intro */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-5 text-white">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🚗</span>
              <div>
                <h2 className="font-bold">Maak het meeste van je grensrit</h2>
                <p className="mt-1 text-sm text-accent-light/90">
                  Met de juiste uitrusting bespaar je nog meer. Neem extra
                  brandstof mee in een jerrycan en houd je boodschappen vers met
                  een koeltas.
                </p>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {PRODUCTEN.map((product) => (
              <ProductKaart key={product.id} product={product} />
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Let op: het is wettelijk toegestaan om maximaal 10 liter brandstof
            in een goedgekeurde jerrycan mee te nemen over de grens. Prijzen
            zijn indicatief.
          </p>

          {/* CTA terug */}
          <div className="flex justify-center">
            <Link
              href="/resultaat"
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-surface-hover active:scale-95 dark:border-gray-700 dark:text-gray-400"
            >
              &larr; Terug naar resultaat
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProductKaart({ product }: { product: Product }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-surface shadow-sm transition-all hover:shadow-md dark:border-gray-800">
      {/* Afbeelding placeholder */}
      <div
        className={`flex h-40 items-center justify-center bg-gradient-to-br ${product.kleur}`}
      >
        <span className="text-6xl drop-shadow-lg transition-transform group-hover:scale-110">
          {product.icoon}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {product.naam}
          </h3>
          <span className="shrink-0 rounded-lg bg-accent/10 px-2 py-0.5 text-sm font-extrabold text-primary dark:text-accent">
            {product.prijs}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {product.beschrijving}
        </p>

        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-accent/90 hover:shadow-md active:scale-95"
        >
          {product.knopTekst}
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
