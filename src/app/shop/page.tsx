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
  categorie: "brandstof" | "koeling" | "tassen";
  populair?: boolean;
};

const PRODUCTEN: Product[] = [
  {
    id: "jerrycan-5l",
    naam: "Jerrycan 5L",
    beschrijving: "Goedgekeurde metalen jerrycan voor benzine of diesel. Compact en makkelijk mee te nemen.",
    prijs: "€18,95",
    icoon: "⛽",
    kleur: "from-red-500 to-orange-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
    categorie: "brandstof",
  },
  {
    id: "jerrycan-10l",
    naam: "Jerrycan 10L",
    beschrijving: "Grotere metalen jerrycan met UN-keurmerk. Bespaar nog meer per rit.",
    prijs: "€24,95",
    icoon: "🛢️",
    kleur: "from-red-600 to-red-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
    categorie: "brandstof",
    populair: true,
  },
  {
    id: "jerrycan-20l",
    naam: "Jerrycan 20L",
    beschrijving: "Professionele 20L jerrycan met schenktuit. Maximale besparing.",
    prijs: "€32,95",
    icoon: "🏗️",
    kleur: "from-orange-500 to-amber-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
    categorie: "brandstof",
  },
  {
    id: "brandstofslang",
    naam: "Overhevelpomp",
    beschrijving: "Handmatige overhevelpomp met slang. Makkelijk brandstof overhevelen.",
    prijs: "€12,95",
    icoon: "🔧",
    kleur: "from-gray-600 to-gray-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
    categorie: "brandstof",
  },
  {
    id: "koeltas-groot",
    naam: "Koeltas XL (30L)",
    beschrijving: "Geïsoleerde koeltas voor je boodschappen. Past makkelijk in de kofferbak.",
    prijs: "€29,95",
    icoon: "🧊",
    kleur: "from-sky-500 to-blue-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
    categorie: "koeling",
    populair: true,
  },
  {
    id: "koeltas-compact",
    naam: "Koeltas Compact (15L)",
    beschrijving: "Compacte koeltas voor zuivel en vlees. Ideaal voor kleinere ritten.",
    prijs: "€19,95",
    icoon: "❄️",
    kleur: "from-cyan-500 to-teal-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
    categorie: "koeling",
  },
  {
    id: "boodschappentas-set",
    naam: "Tassen set (4x)",
    beschrijving: "Stevige, opvouwbare boodschappentassen. Bespaar op tasjes.",
    prijs: "€14,95",
    icoon: "🛍️",
    kleur: "from-emerald-500 to-green-400",
    link: "#",
    knopTekst: "Bestel hier",
    categorie: "tassen",
  },
  {
    id: "kofferbak-organizer",
    naam: "Kofferbak organizer",
    beschrijving: "Opvouwbare organizer met meerdere vakken. Houd alles geordend.",
    prijs: "€22,95",
    icoon: "📦",
    kleur: "from-violet-500 to-purple-400",
    link: "#",
    knopTekst: "Bekijk op Amazon",
    categorie: "tassen",
    populair: true,
  },
];

const CATEGORIEEN = [
  { id: "brandstof" as const, label: "Brandstof", icoon: "⛽" },
  { id: "koeling" as const, label: "Koeling", icoon: "❄️" },
  { id: "tassen" as const, label: "Tassen & Opbergen", icoon: "🛍️" },
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
          {/* Intro banner */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-primary p-6 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <span className="text-3xl drop-shadow-lg">🚗</span>
              <div>
                <h2 className="font-extrabold text-lg">Maak het meeste van je grensrit</h2>
                <p className="mt-1.5 text-sm font-medium text-gray-300">
                  Met de juiste uitrusting bespaar je nog meer. Neem extra brandstof
                  mee in een jerrycan en houd je boodschappen vers.
                </p>
              </div>
            </div>
          </div>

          {/* Categorieen */}
          {CATEGORIEEN.map((cat) => {
            const producten = PRODUCTEN.filter((p) => p.categorie === cat.id);
            return (
              <div key={cat.id}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-navy dark:text-white">
                  <span>{cat.icoon}</span>
                  {cat.label}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {producten.map((product) => (
                    <ProductKaart key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Disclaimer */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200/50 p-4 dark:bg-amber-900/20 dark:border-amber-800/30">
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  Het is wettelijk toegestaan om maximaal 10 liter brandstof in een
                  goedgekeurde jerrycan mee te nemen over de grens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProductKaart({ product }: { product: Product }) {
  return (
    <div className="card-bold group relative overflow-hidden">
      {/* Populair badge */}
      {product.populair && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-cta px-3 py-1 text-[10px] font-extrabold text-white shadow-lg shadow-cta/25">
          Populair
        </div>
      )}

      {/* Afbeelding */}
      <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${product.kleur}`}>
        <span className="text-5xl drop-shadow-lg transition-transform duration-200 group-hover:scale-110">
          {product.icoon}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-extrabold text-navy dark:text-white">
            {product.naam}
          </h3>
          <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-sm font-extrabold text-accent">
            {product.prijs}
          </span>
        </div>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-gray-500 dark:text-gray-400">
          {product.beschrijving}
        </p>

        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill btn-pill-accent mt-3 w-full text-xs"
        >
          {product.knopTekst}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </div>
  );
}
