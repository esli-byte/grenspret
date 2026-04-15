"use client";

import { useState, useMemo } from "react";
import { MIJ_ID, MIJ_KLEUR, type Persoon, type Toewijzingen } from "@/lib/personen";
import type { Product, EigenProduct } from "./producten";

type ProductOfEigen = Product | EigenProduct;

type Props = {
  personen: Persoon[];
  mijnNaam: string;
  toewijzingen: Toewijzingen;
  producten: ProductOfEigen[];
};

function euro(bedrag: number) {
  return `€${bedrag.toFixed(2)}`;
}

type VerdelingPerPersoon = {
  id: string;
  naam: string;
  kleur: string;
  isMij: boolean;
  totaalNL: number;
  totaalBuitenland: number; // gemiddeld DE/BE
  totaalDE: number;
  totaalBE: number;
  aantalProducten: number;
};

export function VerdelingDashboard({ personen, mijnNaam, toewijzingen, producten }: Props) {
  const [gekopieerd, setGekopieerd] = useState<string | null>(null);

  const verdeling = useMemo<VerdelingPerPersoon[]>(() => {
    const alle: { id: string; naam: string; kleur: string; isMij: boolean }[] = [
      { id: MIJ_ID, naam: mijnNaam, kleur: MIJ_KLEUR, isMij: true },
      ...personen.map((p) => ({ id: p.id, naam: p.naam, kleur: p.kleur, isMij: false })),
    ];

    // Lookup van product id naar product
    const productMap = new Map(producten.map((p) => [p.id, p]));

    return alle.map((pers) => {
      let totaalNL = 0;
      let totaalDE = 0;
      let totaalBE = 0;
      let aantalProducten = 0;

      for (const [productId, perPersoon] of Object.entries(toewijzingen)) {
        const qty = perPersoon[pers.id] ?? 0;
        if (qty <= 0) continue;
        const product = productMap.get(productId);
        if (!product) continue;
        totaalNL += product.prijsNL * qty;
        totaalDE += product.prijsDE * qty;
        totaalBE += product.prijsBE * qty;
        aantalProducten += qty;
      }

      return {
        ...pers,
        totaalNL,
        totaalDE,
        totaalBE,
        totaalBuitenland: Math.min(totaalDE, totaalBE), // beste optie
        aantalProducten,
      };
    });
  }, [personen, mijnNaam, toewijzingen, producten]);

  const totalen = useMemo(() => {
    return verdeling.reduce(
      (acc, v) => ({
        nl: acc.nl + v.totaalNL,
        buitenland: acc.buitenland + v.totaalBuitenland,
        aantal: acc.aantal + v.aantalProducten,
      }),
      { nl: 0, buitenland: 0, aantal: 0 },
    );
  }, [verdeling]);

  async function kopieerBericht(v: VerdelingPerPersoon) {
    const bedrag = v.totaalBuitenland.toFixed(2);
    const bericht =
      `Hoi ${v.naam}! 👋\n\n` +
      `Ik heb vandaag boodschappen gedaan over de grens en ${v.aantalProducten} product${v.aantalProducten !== 1 ? "en" : ""} voor jou meegenomen.\n` +
      `Totaal: €${bedrag}\n\n` +
      `Via Grenspret (grenspret.nl) — samen besparen op boodschappen.`;

    try {
      await navigator.clipboard.writeText(bericht);
      setGekopieerd(v.id);
      setTimeout(() => setGekopieerd(null), 2500);
    } catch {
      // fallback: gebruiker kan niks kopiëren
      alert(bericht);
    }
  }

  const hebbenAndersen = verdeling.some((v) => !v.isMij && v.aantalProducten > 0);
  if (!hebbenAndersen && totalen.aantal === 0) return null;

  return (
    <div className="card-bold p-5 space-y-3">
      <div>
        <h3 className="text-base font-extrabold text-navy dark:text-white">
          💰 Wie betaalt wat?
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Verdeling op basis van de beste prijs (Duitsland of België)
        </p>
      </div>

      <div className="space-y-2.5">
        {verdeling.map((v) => {
          if (v.aantalProducten === 0) return null;
          const isGekopieerd = gekopieerd === v.id;
          return (
            <div
              key={v.id}
              className="flex items-center gap-3 rounded-2xl border-2 p-3"
              style={{
                borderColor: `${v.kleur}40`,
                backgroundColor: `${v.kleur}0d`,
              }}
            >
              {/* Avatar */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow"
                style={{ backgroundColor: v.kleur }}
              >
                {v.naam[0]?.toUpperCase()}
              </div>

              {/* Naam + aantal + bedrag */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-extrabold text-navy dark:text-white">
                    {v.isMij ? `${v.naam} (ik)` : v.naam}
                  </span>
                  <span
                    className="shrink-0 font-extrabold tabular-nums"
                    style={{ color: v.kleur }}
                  >
                    {euro(v.totaalBuitenland)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="text-gray-500 dark:text-gray-400">
                    {v.aantalProducten} product{v.aantalProducten !== 1 ? "en" : ""}
                  </span>
                  <span className="text-gray-400 line-through">
                    {euro(v.totaalNL)}
                  </span>
                </div>
              </div>

              {/* Kopieer knop (alleen voor anderen) */}
              {!v.isMij && (
                <button
                  onClick={() => kopieerBericht(v)}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-extrabold transition-all active:scale-95 ${
                    isGekopieerd
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                  }`}
                  title="Kopieer betaalverzoek"
                >
                  {isGekopieerd ? (
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Gekopieerd
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                      </svg>
                      Tikkie
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Totaal besparing van de hele groep */}
      {totalen.aantal > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-accent/10 px-4 py-3">
          <div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
              Totaal groep bespaart
            </p>
            <p className="text-lg font-extrabold tabular-nums text-accent">
              {euro(totalen.nl - totalen.buitenland)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
              Was {euro(totalen.nl)}
            </p>
            <p className="text-lg font-extrabold tabular-nums text-navy dark:text-white">
              {euro(totalen.buitenland)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
