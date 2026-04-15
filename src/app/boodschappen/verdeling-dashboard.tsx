"use client";

import { useState, useMemo, useEffect } from "react";
import { MIJ_ID, MIJ_KLEUR, type Persoon, type Toewijzingen } from "@/lib/personen";
import type { Product, EigenProduct } from "./producten";
import { leesTanken, type TankenOpslag } from "@/lib/opslag";

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

type BesteldItem = { aantal: number; naam: string };

type VerdelingPerPersoon = {
  id: string;
  naam: string;
  kleur: string;
  isMij: boolean;
  totaalBoodschappenNL: number;
  totaalBoodschappenBuitenland: number;
  reiskostenAandeel: number;
  totaalTeBetalen: number;
  aantalProducten: number;
  bestelling: BesteldItem[];
};

const DEEL_REISKOSTEN_KEY = "grensbesparing_deel_reiskosten";

function leesDeelReiskosten(): boolean {
  try {
    return localStorage.getItem(DEEL_REISKOSTEN_KEY) === "1";
  } catch {
    return false;
  }
}

function slaaDeelReiskostenOp(aan: boolean) {
  try {
    localStorage.setItem(DEEL_REISKOSTEN_KEY, aan ? "1" : "0");
  } catch {
    /* no-op */
  }
}

export function VerdelingDashboard({ personen, mijnNaam, toewijzingen, producten }: Props) {
  const [gekopieerd, setGekopieerd] = useState<string | null>(null);
  const [tanken, setTanken] = useState<TankenOpslag | null>(null);
  const [deelReiskosten, setDeelReiskosten] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage pas na hydration
    setTanken(leesTanken());
    setDeelReiskosten(leesDeelReiskosten());
  }, []);

  // Beste route = laagste reiskosten
  const reiskostenTotaal = useMemo(() => {
    if (!tanken?.route || tanken.route.length === 0) return 0;
    return Math.min(...tanken.route.map((r) => r.reiskosten ?? 0));
  }, [tanken]);

  const heeftReiskosten = reiskostenTotaal > 0;

  const verdeling = useMemo<VerdelingPerPersoon[]>(() => {
    const alle: { id: string; naam: string; kleur: string; isMij: boolean }[] = [
      { id: MIJ_ID, naam: mijnNaam, kleur: MIJ_KLEUR, isMij: true },
      ...personen.map((p) => ({ id: p.id, naam: p.naam, kleur: p.kleur, isMij: false })),
    ];

    const productMap = new Map(producten.map((p) => [p.id, p]));

    // Alleen mensen die ECHT producten hebben tellen mee voor reiskosten verdeling
    const personenMetProducten = alle.filter((pers) =>
      Object.values(toewijzingen).some((perPersoon) => (perPersoon[pers.id] ?? 0) > 0),
    );
    const aantalDelers = Math.max(personenMetProducten.length, 1);
    const reiskostenAandeel =
      deelReiskosten && heeftReiskosten ? reiskostenTotaal / aantalDelers : 0;

    return alle.map((pers) => {
      let totaalNL = 0;
      let totaalDE = 0;
      let totaalBE = 0;
      let aantalProducten = 0;
      const bestelling: BesteldItem[] = [];

      for (const [productId, perPersoon] of Object.entries(toewijzingen)) {
        const qty = perPersoon[pers.id] ?? 0;
        if (qty <= 0) continue;
        const product = productMap.get(productId);
        if (!product) continue;
        totaalNL += product.prijsNL * qty;
        totaalDE += product.prijsDE * qty;
        totaalBE += product.prijsBE * qty;
        aantalProducten += qty;
        const label =
          product.merk && product.merk !== product.naam
            ? `${product.merk} ${product.naam.toLowerCase()}`
            : product.naam;
        bestelling.push({ aantal: qty, naam: label });
      }

      const totaalBuitenland = Math.min(totaalDE, totaalBE);
      const aandeel = aantalProducten > 0 ? reiskostenAandeel : 0;

      return {
        ...pers,
        totaalBoodschappenNL: totaalNL,
        totaalBoodschappenBuitenland: totaalBuitenland,
        reiskostenAandeel: aandeel,
        totaalTeBetalen: totaalBuitenland + aandeel,
        aantalProducten,
        bestelling,
      };
    });
  }, [
    personen,
    mijnNaam,
    toewijzingen,
    producten,
    deelReiskosten,
    reiskostenTotaal,
    heeftReiskosten,
  ]);

  const totalen = useMemo(() => {
    return verdeling.reduce(
      (acc, v) => ({
        nl: acc.nl + v.totaalBoodschappenNL,
        buitenland: acc.buitenland + v.totaalBoodschappenBuitenland,
        aantal: acc.aantal + v.aantalProducten,
      }),
      { nl: 0, buitenland: 0, aantal: 0 },
    );
  }, [verdeling]);

  function handleToggle(aan: boolean) {
    setDeelReiskosten(aan);
    slaaDeelReiskostenOp(aan);
  }

  async function kopieerBericht(v: VerdelingPerPersoon) {
    const totaal = v.totaalTeBetalen.toFixed(2).replace(".", ",");
    const items = v.bestelling.map((b) => `${b.aantal}x ${b.naam}`);
    let bestellingTekst: string;
    if (items.length === 0) {
      bestellingTekst = "";
    } else if (items.length <= 4) {
      const alleBehalveLaatste = items.slice(0, -1).join(", ");
      const laatste = items[items.length - 1];
      bestellingTekst =
        items.length === 1
          ? items[0]
          : `${alleBehalveLaatste} en ${laatste}`;
    } else {
      bestellingTekst = items.join("\n");
    }

    const reiskostenRegel =
      deelReiskosten && v.reiskostenAandeel > 0
        ? `\n\nWaarvan boodschappen €${v.totaalBoodschappenBuitenland
            .toFixed(2)
            .replace(".", ",")} en gedeelde reiskosten €${v.reiskostenAandeel
            .toFixed(2)
            .replace(".", ",")}`
        : "";

    const bericht =
      `Hoi ${v.naam} 👋\n\n` +
      `Vandaag voor jou meegenomen over de grens:\n${bestellingTekst}\n\n` +
      `Jouw deel komt op €${totaal}.${reiskostenRegel}\n\n` +
      `Je kunt het overmaken wanneer het je uitkomt.\n\n` +
      `Berekend met Grenspret, grenspret.nl`;

    try {
      await navigator.clipboard.writeText(bericht);
      setGekopieerd(v.id);
      setTimeout(() => setGekopieerd(null), 2500);
    } catch {
      alert(bericht);
    }
  }

  const actievePersonen = verdeling.filter((v) => v.aantalProducten > 0);
  const hebbenAndersen = actievePersonen.some((v) => !v.isMij);

  if (actievePersonen.length === 0) return null;

  return (
    <div className="card-bold overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border-b border-gray-100 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-navy dark:text-white">
              Afrekenen
            </h3>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              {hebbenAndersen
                ? "Stuur een Tikkie naar de anderen voor hun deel"
                : "Alles is voor jezelf — nog niemand toegevoegd"}
            </p>
          </div>
        </div>
      </div>

      {/* Verdeling rijen */}
      <div className="divide-y divide-gray-100 dark:divide-white/10">
        {actievePersonen.map((v) => {
          const isGekopieerd = gekopieerd === v.id;
          return (
            <div key={v.id} className="flex items-center gap-3 p-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-md"
                style={{ backgroundColor: v.kleur }}
              >
                {v.naam[0]?.toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-extrabold text-navy dark:text-white">
                    {v.isMij ? `${v.naam} (ik)` : v.naam}
                  </span>
                  <span
                    className="shrink-0 text-lg font-extrabold tabular-nums"
                    style={{ color: v.kleur }}
                  >
                    {euro(v.totaalTeBetalen)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="text-gray-500 dark:text-gray-400">
                    {v.aantalProducten} product{v.aantalProducten !== 1 ? "en" : ""}
                    {deelReiskosten && v.reiskostenAandeel > 0 && (
                      <> · +{euro(v.reiskostenAandeel)} reis</>
                    )}
                  </span>
                  <span className="text-gray-400 line-through tabular-nums">
                    {euro(v.totaalBoodschappenNL)}
                  </span>
                </div>
              </div>

              {!v.isMij && (
                <button
                  onClick={() => kopieerBericht(v)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold transition-all active:scale-95 ${
                    isGekopieerd
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-navy text-white hover:bg-navy/90 shadow-md dark:bg-white dark:text-navy"
                  }`}
                  title="Betaalverzoek kopiëren voor WhatsApp of Tikkie"
                >
                  {isGekopieerd ? (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Gekopieerd!
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                      </svg>
                      Tikkie
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Reiskosten verdelen toggle (alleen als er reiskosten zijn én anderen meedoen) */}
      {heeftReiskosten && hebbenAndersen && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-navy dark:text-white">
              <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-3.75M16.5 12.75h3.75m0 0V8.25m0 0H17.25" />
              </svg>
              <span>Reiskosten meeverdelen</span>
            </div>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              Verdeel {euro(reiskostenTotaal)} eerlijk over alle {actievePersonen.length} personen
            </p>
          </div>
          <button
            role="switch"
            aria-checked={deelReiskosten}
            onClick={() => handleToggle(!deelReiskosten)}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full px-0.5 transition-colors ${
              deelReiskosten ? "bg-accent" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                deelReiskosten ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      )}

      {/* Totaal groepsbesparing */}
      {totalen.aantal > 0 && (
        <div className="flex items-center justify-between bg-gradient-to-br from-accent/10 to-accent/5 px-4 py-3.5 border-t border-accent/20">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-accent/80">
              Groep bespaart samen
            </p>
            <p className="text-xl font-extrabold tabular-nums text-accent">
              {euro(totalen.nl - totalen.buitenland)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Zou kosten: <span className="line-through">{euro(totalen.nl)}</span>
            </p>
            <p className="text-lg font-extrabold tabular-nums text-navy dark:text-white">
              Wordt: {euro(totalen.buitenland)}
            </p>
          </div>
        </div>
      )}

      {/* Subtiele hint onderaan */}
      {hebbenAndersen && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 text-[10px] text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
          💡 Tip: plak het bericht in WhatsApp of maak er een Tikkie van via je bank-app
        </div>
      )}
    </div>
  );
}
