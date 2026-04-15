"use client";

import { useState, useMemo } from "react";
import {
  CATEGORIE_LABELS,
  CATEGORIE_KORTING,
  schatBuitenlandPrijzen,
  type Categorie,
  type EigenProduct,
} from "./producten";

const CATEGORIEEN = Object.keys(CATEGORIE_LABELS) as Categorie[];

const ICOON_SUGGESTIES = [
  "🛒", "📦", "🍞", "🥚", "🍅", "🥔", "🧅", "🥕", "🍎", "🍌",
  "🍋", "🧄", "🥒", "🫑", "🥦", "🧂", "🍚", "🥫", "🍪", "🍫",
  "🧃", "🍯", "🫖", "🍵", "🧽", "🧼", "🧻", "🪒",
];

type Props = {
  onSluiten: () => void;
  onToevoegen: (product: EigenProduct) => void;
};

export function EigenProductModal({ onSluiten, onToevoegen }: Props) {
  const [naam, setNaam] = useState("");
  const [prijsNL, setPrijsNL] = useState("");
  const [categorie, setCategorie] = useState<Categorie>("basis");
  const [icoon, setIcoon] = useState("🛒");
  const [eenheid, setEenheid] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  // Live berekening van geschatte DE/BE prijs
  const schatting = useMemo(() => {
    const prijs = parseFloat(prijsNL.replace(",", "."));
    if (!prijs || prijs <= 0) return null;
    const { prijsDE, prijsBE } = schatBuitenlandPrijzen(prijs, categorie);
    const korting = CATEGORIE_KORTING[categorie];
    return {
      prijsDE,
      prijsBE,
      besparingDE: prijs - prijsDE,
      besparingBE: prijs - prijsBE,
      kortingDE: korting.DE,
      kortingBE: korting.BE,
    };
  }, [prijsNL, categorie]);

  function handleOpslaan() {
    setFout(null);
    const prijs = parseFloat(prijsNL.replace(",", "."));

    if (!naam.trim()) {
      setFout("Vul een productnaam in");
      return;
    }
    if (!prijs || prijs <= 0) {
      setFout("Vul een geldige prijs in");
      return;
    }
    if (prijs > 999) {
      setFout("Prijs lijkt te hoog");
      return;
    }

    const { prijsDE, prijsBE } = schatBuitenlandPrijzen(prijs, categorie);
    const product: EigenProduct = {
      id: `eigen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      naam: naam.trim(),
      merkType: "huismerk",
      eenheid: eenheid.trim() || "1 stuk",
      categorie,
      icoon,
      prijsNL: prijs,
      prijsDE,
      prijsBE,
      isEigen: true,
    };

    onToevoegen(product);
    onSluiten();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onSluiten}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-slide-in-bottom dark:bg-navy sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-extrabold text-navy dark:text-white">
              + Eigen product
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Product niet in de lijst? Voeg het zelf toe.
            </p>
          </div>
          <button
            onClick={onSluiten}
            className="rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 active:scale-90 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulier */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
          {/* Naam */}
          <div>
            <label className="block text-xs font-extrabold text-navy dark:text-white">
              Productnaam *
            </label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="bijv. Keukenzout"
              maxLength={40}
              className="mt-1.5 w-full rounded-xl border-2 border-gray-200 px-3.5 py-2.5 text-sm font-bold text-navy placeholder:font-normal placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
              autoFocus
            />
          </div>

          {/* Prijs NL */}
          <div>
            <label className="block text-xs font-extrabold text-navy dark:text-white">
              Prijs in Nederland *
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">€</span>
              <input
                type="text"
                inputMode="decimal"
                value={prijsNL}
                onChange={(e) => setPrijsNL(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder="1,20"
                className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-8 pr-3.5 text-sm font-bold text-navy placeholder:font-normal placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
              />
            </div>
          </div>

          {/* Eenheid (optioneel) */}
          <div>
            <label className="block text-xs font-extrabold text-navy dark:text-white">
              Eenheid <span className="font-normal text-gray-400">(optioneel)</span>
            </label>
            <input
              type="text"
              value={eenheid}
              onChange={(e) => setEenheid(e.target.value)}
              placeholder="bijv. 500 gram of 1 liter"
              maxLength={20}
              className="mt-1.5 w-full rounded-xl border-2 border-gray-200 px-3.5 py-2.5 text-sm font-bold text-navy placeholder:font-normal placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
            />
          </div>

          {/* Categorie */}
          <div>
            <label className="block text-xs font-extrabold text-navy dark:text-white">
              Categorie *
            </label>
            <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Bepaalt de geschatte besparing over de grens
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIEEN.map((cat) => {
                const { label, icoon: catIcoon } = CATEGORIE_LABELS[cat];
                const korting = CATEGORIE_KORTING[cat];
                const isActief = cat === categorie;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategorie(cat)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all active:scale-95 ${
                      isActief
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-navy/50 dark:text-gray-300"
                    }`}
                  >
                    <div className="text-lg">{catIcoon}</div>
                    <div className="text-[11px] font-extrabold">{label}</div>
                    <div className={`text-[10px] font-medium ${isActief ? "text-accent" : "text-gray-400"}`}>
                      −{Math.round(korting.DE * 100)}% DE
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icoon kiezer */}
          <div>
            <label className="block text-xs font-extrabold text-navy dark:text-white">
              Icoon <span className="font-normal text-gray-400">(optioneel)</span>
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ICOON_SUGGESTIES.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcoon(emoji)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 text-lg transition-all active:scale-90 ${
                    icoon === emoji
                      ? "border-accent bg-accent/10 scale-110"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-navy/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Live schatting */}
          {schatting && (
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-accent">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Geschatte besparing
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">🇳🇱 Nederland</span>
                  <span className="font-extrabold tabular-nums text-navy dark:text-white">
                    €{parseFloat(prijsNL.replace(",", ".")).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    🇩🇪 Duitsland <span className="text-[10px] opacity-60">(−{Math.round(schatting.kortingDE * 100)}%)</span>
                  </span>
                  <span className="font-extrabold tabular-nums text-accent">
                    €{schatting.prijsDE.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    🇧🇪 België <span className="text-[10px] opacity-60">(−{Math.round(schatting.kortingBE * 100)}%)</span>
                  </span>
                  <span className="font-extrabold tabular-nums text-accent">
                    €{schatting.prijsBE.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="mt-2.5 border-t border-accent/10 pt-2 text-[10px] font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                ⓘ Schatting op basis van gemiddelde categorieprijzen.
                Werkelijke winkelprijs kan afwijken.
              </p>
            </div>
          )}

          {/* Foutmelding */}
          {fout && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {fout}
            </div>
          )}
        </div>

        {/* Actieknoppen */}
        <div className="flex gap-2 border-t border-gray-100 p-4 dark:border-white/10">
          <button
            onClick={onSluiten}
            className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-extrabold text-gray-600 transition-all hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-300"
          >
            Annuleer
          </button>
          <button
            onClick={handleOpslaan}
            className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 active:scale-95"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
