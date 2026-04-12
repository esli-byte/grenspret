"use client";

import { useEffect, useMemo, useState } from "react";
import { zoekVoertuig, type VoertuigData } from "./actions";
import {
  FALLBACK_PRIJZEN,
  berekenBesparingen,
  mapBrandstofSoort,
  schattingTankgrootte,
  type BrandstofSoort,
  type LandPrijzen,
  type Besparing,
} from "./brandstofprijzen";
import {
  schatAfstand,
  schattingVerbruik,
  type RouteSchatting,
} from "./afstand";
import { slaaTankenOp } from "@/lib/opslag";
import { LocatieKaartjes } from "@/components/LocatieKaartjes";
import type { FuelPricesResponse } from "@/app/api/fuel-prices/route";

function euro(bedrag: number) {
  return `€${bedrag.toFixed(2)}`;
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 animate-slide-in-bottom">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
        <div className="animate-spin-slow absolute inset-0 rounded-full border-4 border-transparent border-t-accent" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🚗
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-sm font-bold text-navy dark:text-gray-200">
          Voertuig opzoeken...
        </p>
        <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="animate-shimmer h-full w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

function PrijzenSkeleton() {
  return (
    <div className="card-bold p-5">
      <div className="h-4 w-40 animate-shimmer rounded" />
      <div className="mt-2 h-3 w-56 animate-shimmer rounded" />
      <div className="mt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 animate-shimmer rounded" />
            <div className="flex gap-4">
              <div className="h-4 w-12 animate-shimmer rounded" />
              <div className="h-4 w-12 animate-shimmer rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TankenForm() {
  const [kenteken, setKenteken] = useState("");
  const [postcode, setPostcode] = useState("");
  const [voertuig, setVoertuig] = useState<VoertuigData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extraLiters, setExtraLiters] = useState(0);

  // Live prijzen
  const [prijzen, setPrijzen] = useState<LandPrijzen[]>(FALLBACK_PRIJZEN);
  const [prijzenBron, setPrijzenBron] = useState<string>("fallback");
  const [prijzenBijgewerkt, setPrijzenBijgewerkt] = useState<string | null>(null);
  const [prijzenLaden, setPrijzenLaden] = useState(true);

  // Fetch live prijzen bij mount
  useEffect(() => {
    let cancelled = false;
    async function fetchPrijzen() {
      try {
        const res = await fetch("/api/fuel-prices");
        if (!res.ok) throw new Error("API error");
        const data: FuelPricesResponse = await res.json();
        if (cancelled) return;
        setPrijzen(data.prijzen);
        setPrijzenBron(data.bron);
        setPrijzenBijgewerkt(data.bijgewerkt);
      } catch {
        // Fallback prijzen blijven staan
      } finally {
        if (!cancelled) setPrijzenLaden(false);
      }
    }
    fetchPrijzen();
    return () => { cancelled = true; };
  }, []);

  const berekening = useMemo(() => {
    if (!voertuig) return null;
    const soort = mapBrandstofSoort(voertuig.brandstof);
    if (!soort) return null;
    const ccMatch = voertuig.cilinderinhoud.match(/(\d+)/);
    const cc = ccMatch ? parseInt(ccMatch[1], 10) : 1600;
    const tankGrootte = schattingTankgrootte(cc);
    const verbruik = schattingVerbruik(cc, soort);
    return {
      soort,
      soortLabel: soort === "diesel" ? "Diesel" : "Euro 95",
      tankGrootte,
      verbruik,
      cc,
      besparingen: berekenBesparingen(soort, tankGrootte, prijzen),
    };
  }, [voertuig, prijzen]);

  const routes = useMemo(() => {
    if (!postcode || postcode.replace(/\s/g, "").length < 4) return null;
    return schatAfstand(postcode);
  }, [postcode]);

  useEffect(() => {
    if (!voertuig || !berekening || !routes) return;
    const nlPrijs = prijzen[0][berekening.soort];
    slaaTankenOp({
      voertuig: {
        merk: voertuig.merk,
        handelsbenaming: voertuig.handelsbenaming,
        brandstof: voertuig.brandstof,
        kenteken: voertuig.kenteken,
      },
      brandstofSoort: berekening.soortLabel,
      tankGrootte: berekening.tankGrootte,
      verbruik: berekening.verbruik,
      besparingDE: berekening.besparingen.find((b) => b.land === "Duitsland")?.besparing ?? 0,
      besparingBE: berekening.besparingen.find((b) => b.land === "België")?.besparing ?? 0,
      route: routes.map((route) => {
        const besparing = berekening.besparingen.find((b) => b.land === route.land);
        const brandstofRetour = (route.afstandRetour / 100) * berekening.verbruik;
        const reiskosten = brandstofRetour * nlPrijs;
        const netto = (besparing?.besparing ?? 0) - reiskosten;
        return {
          land: route.land,
          bestemming: route.bestemming,
          afstandEnkel: route.afstandEnkel,
          afstandRetour: route.afstandRetour,
          rijtijdMinuten: route.rijtijdMinuten,
          reiskosten,
          netto,
        };
      }),
    });
  }, [voertuig, berekening, routes, prijzen]);

  async function handleKentekenZoek() {
    if (!kenteken.trim()) return;
    setLoading(true);
    setError(null);
    setVoertuig(null);
    const result = await zoekVoertuig(kenteken);
    if (result.success) {
      setVoertuig(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  function formatKenteken(value: string) {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  }

  return (
    <div className="space-y-5">
      {/* Kenteken invoer */}
      <div className="card-bold p-5">
        <label htmlFor="kenteken" className="block text-sm font-extrabold text-navy dark:text-white">
          Kenteken
        </label>
        <div className="mt-2.5 flex gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center rounded-l-2xl bg-navy dark:bg-accent">
              <span className="text-xs font-extrabold text-white">NL</span>
            </div>
            <input
              id="kenteken"
              type="text"
              placeholder="AB123C"
              value={kenteken}
              onChange={(e) => setKenteken(formatKenteken(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && handleKentekenZoek()}
              className="w-full rounded-2xl border-2 border-gray-200 bg-amber-50 py-3.5 pl-12 pr-4 text-center text-lg font-extrabold tracking-widest text-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-amber-950 dark:text-white"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <button
            onClick={handleKentekenZoek}
            disabled={loading || !kenteken.trim()}
            className="btn-pill btn-pill-accent px-6 py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Zoeken
              </span>
            ) : (
              "Zoek op"
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Error */}
      {error && (
        <div className="card-bold border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 animate-slide-in-bottom">
          {error}
        </div>
      )}

      {/* Voertuiggegevens */}
      {voertuig && (
        <div className="card-bold overflow-hidden border-accent/30 animate-slide-in-bottom">
          <div className="bg-gradient-to-r from-accent to-emerald-500 px-5 py-3.5">
            <h2 className="text-sm font-extrabold text-white">
              Voertuiggegevens
            </h2>
          </div>
          <div className="p-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Merk</dt>
              <dd className="font-bold text-navy dark:text-white">{voertuig.merk}</dd>
              <dt className="text-gray-500 dark:text-gray-400">Model</dt>
              <dd className="font-bold text-navy dark:text-white">{voertuig.handelsbenaming}</dd>
              <dt className="text-gray-500 dark:text-gray-400">Brandstof</dt>
              <dd className="font-bold text-navy dark:text-white">{voertuig.brandstof}</dd>
              <dt className="text-gray-500 dark:text-gray-400">Kleur</dt>
              <dd className="font-bold text-navy dark:text-white">{voertuig.eersteKleur}</dd>
              <dt className="text-gray-500 dark:text-gray-400">Cilinders</dt>
              <dd className="font-bold text-navy dark:text-white">{voertuig.aantalCilinders}</dd>
              <dt className="text-gray-500 dark:text-gray-400">Inhoud</dt>
              <dd className="font-bold text-navy dark:text-white">{voertuig.cilinderinhoud}</dd>
            </dl>
            {berekening && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-extrabold text-accent">
                  {berekening.tankGrootte}L tank
                </span>
                <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-extrabold text-accent">
                  {berekening.soortLabel}
                </span>
                <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-extrabold text-accent">
                  {berekening.verbruik} l/100km
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Postcode invoer */}
      <div className="card-bold p-5">
        <label htmlFor="postcode" className="block text-sm font-extrabold text-navy dark:text-white">
          Jouw postcode
        </label>
        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          Om de afstand tot de grens te berekenen
        </p>
        <input
          id="postcode"
          type="text"
          placeholder="1234 AB"
          value={postcode}
          onChange={(e) =>
            setPostcode(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 7))
          }
          className="mt-2.5 w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 font-bold text-navy placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-navy/50 dark:text-white sm:w-48"
          autoComplete="postal-code"
        />
      </div>

      {/* Dichtstbijzijnde tankstations */}
      {postcode && (
        <LocatieKaartjes postcode={postcode} type="tankstation" titel="Dichtstbijzijnde tankstations" />
      )}

      {/* Brandstofprijzen overzicht */}
      {prijzenLaden ? (
        <PrijzenSkeleton />
      ) : (
        <div className="card-bold p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-navy dark:text-white">Brandstofprijzen</h2>
              <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">Gemiddelde literprijzen per land</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/5">
              <div className={`h-2 w-2 rounded-full ${
                prijzenBron === "live" ? "bg-accent animate-glow" : prijzenBron === "cache" ? "bg-amber-500" : "bg-gray-400"
              }`} />
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                {prijzenBron === "live" ? "Live" : prijzenBron === "cache" ? "Cached" : "Indicatief"}
              </span>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-gray-800">
                  <th className="pb-2.5 text-left text-xs font-bold text-gray-400 dark:text-gray-500">Land</th>
                  <th className="pb-2.5 text-right text-xs font-bold text-gray-400 dark:text-gray-500">Euro 95</th>
                  <th className="pb-2.5 text-right text-xs font-bold text-gray-400 dark:text-gray-500">Diesel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {prijzen.map((land) => (
                  <tr key={land.land}>
                    <td className="py-3.5 font-bold text-navy dark:text-white">{land.vlag} {land.land}</td>
                    <td className="py-3.5 text-right tabular-nums font-semibold text-gray-600 dark:text-gray-400">{euro(land.euro95)}</td>
                    <td className="py-3.5 text-right tabular-nums font-semibold text-gray-600 dark:text-gray-400">{euro(land.diesel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {prijzenBijgewerkt && (
            <p className="mt-3 text-[11px] font-medium text-gray-400 dark:text-gray-500">
              Laatst bijgewerkt:{" "}
              {new Date(prijzenBijgewerkt).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      )}

      {/* Extra liters meenemen */}
      {berekening && (
        <ExtraLitersSlider
          extraLiters={extraLiters}
          onChange={setExtraLiters}
          brandstofSoort={berekening.soort}
          prijzen={prijzen}
        />
      )}

      {/* Netto besparingsoverzicht */}
      {berekening && routes && (
        <NettoBesparingOverzicht berekening={berekening} routes={routes} prijzen={prijzen} extraLiters={extraLiters} />
      )}

      {/* Alleen bruto besparing als er geen postcode is */}
      {berekening && !routes && (
        <BrutoBesparingOverzicht berekening={berekening} extraLiters={extraLiters} prijzen={prijzen} />
      )}
    </div>
  );
}

function ExtraLitersSlider({
  extraLiters,
  onChange,
  brandstofSoort,
  prijzen,
}: {
  extraLiters: number;
  onChange: (v: number) => void;
  brandstofSoort: BrandstofSoort;
  prijzen: LandPrijzen[];
}) {
  const nlPrijs = prijzen[0][brandstofSoort];
  const dePrijs =
    prijzen.find((p) => p.land === "Duitsland")?.[brandstofSoort] ?? nlPrijs;
  const bePrijs =
    prijzen.find((p) => p.land === "België")?.[brandstofSoort] ?? nlPrijs;
  const extraBesparingDE = extraLiters * (nlPrijs - dePrijs);
  const extraBesparingBE = extraLiters * (nlPrijs - bePrijs);
  const pct = (extraLiters / 80) * 100;
  const aantalPersonen = Math.ceil(extraLiters / 10);
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80];

  return (
    <div className="card-bold p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl shadow-md">
          🛢️
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-extrabold text-navy dark:text-white">
            Extra brandstof meenemen
          </h2>
          <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            Neem extra liters mee in jerrycans
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
            0 L
          </span>
          <span className="rounded-full bg-accent/10 px-3.5 py-1.5 text-sm font-extrabold text-accent">
            {extraLiters} liter
          </span>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
            80 L
          </span>
        </div>
        <div className="relative mt-2.5">
          {/* Track background */}
          <div className="h-3.5 rounded-full bg-gray-200 dark:bg-gray-700">
            {/* Filled track - green up to 10L, orange after */}
            {extraLiters <= 10 ? (
              <div
                className="h-3.5 rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            ) : (
              <div className="flex h-3.5 overflow-hidden rounded-full">
                <div
                  className="h-3.5 bg-gradient-to-r from-accent to-emerald-400"
                  style={{ width: `${(10 / 80) * 100}%` }}
                />
                <div
                  className="h-3.5 bg-gradient-to-r from-amber-400 to-cta"
                  style={{ width: `${((extraLiters - 10) / 80) * 100}%` }}
                />
              </div>
            )}
          </div>
          {/* Legal limit marker at 10L */}
          <div
            className="absolute top-0 h-3.5 w-0.5 bg-cta dark:bg-amber-400"
            style={{ left: `${(10 / 80) * 100}%` }}
            title="Wettelijk maximum per persoon"
          />
          {/* Input */}
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={extraLiters}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="absolute inset-0 h-3.5 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-lg"
          />
        </div>
        {/* Tick marks with labels */}
        <div className="mt-2 flex justify-between px-0.5">
          {ticks.map((tick) => (
            <div key={tick} className="flex flex-col items-center" style={{ width: '1px' }}>
              <div
                className={`rounded-full ${
                  tick === 10
                    ? "h-2.5 w-2 bg-cta"
                    : tick <= extraLiters
                    ? "h-2 w-1 bg-accent"
                    : "h-2 w-1 bg-gray-300 dark:bg-gray-600"
                }`}
              />
              <span
                className={`mt-0.5 text-[8px] tabular-nums ${
                  tick === 10
                    ? "font-extrabold text-cta"
                    : "font-bold text-gray-400 dark:text-gray-500"
                }`}
              >
                {tick}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Extra besparing preview */}
      {extraLiters > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2.5 animate-slide-in-bottom">
          <div className="rounded-2xl bg-accent/5 p-3.5 border border-accent/10">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              🇩🇪 Extra besparing
            </div>
            <div className="mt-0.5 text-lg font-extrabold tabular-nums text-accent">
              +{euro(extraBesparingDE)}
            </div>
          </div>
          <div className="rounded-2xl bg-accent/5 p-3.5 border border-accent/10">
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              🇧🇪 Extra besparing
            </div>
            <div className="mt-0.5 text-lg font-extrabold tabular-nums text-accent">
              +{euro(extraBesparingBE)}
            </div>
          </div>
        </div>
      )}

      {/* Personen indicator bij > 10L */}
      {extraLiters > 10 && (
        <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-cta/5 border border-cta/15 px-4 py-3 animate-slide-in-bottom">
          <span className="text-lg">👥</span>
          <p className="text-xs font-bold text-cta dark:text-amber-300">
            Voor {extraLiters}L heb je minimaal <strong>{aantalPersonen} personen</strong> nodig
            ({aantalPersonen} x 10L jerrycan)
          </p>
        </div>
      )}

      {/* Wettelijke info */}
      <div className="mt-3 space-y-2">
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200/50 p-3.5 dark:bg-amber-950/30 dark:border-amber-800/30">
          <span className="shrink-0 text-sm">⚠️</span>
          <p className="text-[11px] font-medium leading-relaxed text-amber-800 dark:text-amber-300">
            Wettelijk toegestaan: <strong>10 liter per persoon</strong> in een
            goedgekeurde (UN/metalen) jerrycan. Plastic jerrycans zijn niet
            toegestaan voor benzine.
          </p>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl bg-blue-50 border border-blue-200/50 p-3.5 dark:bg-blue-950/30 dark:border-blue-800/30">
          <span className="shrink-0 text-sm">💡</span>
          <p className="text-[11px] font-medium leading-relaxed text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> Met meerdere personen in de auto mag ieder 10
            liter meenemen. Zo kun je tot 80 liter extra meenemen!
          </p>
        </div>
      </div>
    </div>
  );
}

function NettoBesparingOverzicht({
  berekening,
  routes,
  prijzen,
  extraLiters,
}: {
  berekening: {
    soort: BrandstofSoort;
    soortLabel: string;
    tankGrootte: number;
    verbruik: number;
    besparingen: Besparing[];
  };
  routes: RouteSchatting[];
  prijzen: LandPrijzen[];
  extraLiters: number;
}) {
  const nlPrijs = prijzen[0][berekening.soort];
  const kaarten = routes
    .map((route) => {
      const besparing = berekening.besparingen.find((b) => b.land === route.land);
      if (!besparing) return null;
      const brandstofRetour = (route.afstandRetour / 100) * berekening.verbruik;
      const reiskosten = brandstofRetour * nlPrijs;
      const extraBesparing = extraLiters * (nlPrijs - besparing.prijsPerLiter);
      const netto = besparing.besparing + extraBesparing - reiskosten;
      return { ...route, besparing, brandstofRetour, reiskosten, extraBesparing, netto };
    })
    .filter(Boolean) as Array<{
    land: string;
    bestemming: string;
    afstandEnkel: number;
    afstandRetour: number;
    rijtijdMinuten: number;
    besparing: Besparing;
    brandstofRetour: number;
    reiskosten: number;
    extraBesparing: number;
    netto: number;
  }>;

  const bestNetto = Math.max(...kaarten.map((k) => k.netto));

  return (
    <div className="space-y-4 animate-slide-in-bottom">
      <h2 className="text-sm font-extrabold text-navy dark:text-white">Totale netto besparing</h2>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {berekening.soortLabel} &middot; {berekening.tankGrootte}L tank
        {extraLiters > 0 && <> + {extraLiters}L jerrycan</>}
        {" "}&middot; {berekening.verbruik} l/100km
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {kaarten.map((k) => {
          const loont = k.netto > 0;
          const isBest = k.netto === bestNetto && loont;
          return (
            <div
              key={k.land}
              className={`card-bold relative overflow-hidden transition-all ${
                loont
                  ? isBest
                    ? "border-accent bg-gradient-to-br from-accent/5 to-emerald-50 dark:from-accent/10 dark:to-emerald-950/30"
                    : "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30"
                  : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30"
              }`}
            >
              {isBest && (
                <span className="absolute -top-px right-4 rounded-b-xl bg-accent px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md animate-badge-pop">
                  Beste keuze
                </span>
              )}
              <div className="p-5">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {k.besparing.vlag} {k.land}
                </div>
                <div className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{k.bestemming}</div>
                <div className={`mt-3 text-3xl font-extrabold ${
                  loont ? "text-accent" : "text-red-500 dark:text-red-400"
                }`}>
                  {loont ? "+" : ""}{euro(k.netto)}
                </div>
                <div className={`text-xs font-bold ${
                  loont ? "text-accent/70" : "text-red-400"
                }`}>
                  {loont ? "netto besparing" : "het loont niet"}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t-2 border-gray-200/50 pt-4 text-xs dark:border-gray-700/50">
                  <div className="rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/40">
                    <div className="text-gray-400 font-medium">Enkele reis</div>
                    <div className="mt-0.5 font-extrabold text-navy dark:text-white">{k.afstandEnkel} km</div>
                  </div>
                  <div className="rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/40">
                    <div className="text-gray-400 font-medium">Rijtijd retour</div>
                    <div className="mt-0.5 font-extrabold text-navy dark:text-white">{formatRijtijd(k.rijtijdMinuten)}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 border-t-2 border-gray-200/50 pt-3 text-xs dark:border-gray-700/50">
                  <div className="flex justify-between text-gray-500">
                    <span className="font-medium">Besparing volle tank</span>
                    <span className="tabular-nums font-bold text-accent">+{euro(k.besparing.besparing)}</span>
                  </div>
                  {extraLiters > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span className="font-medium">Extra {extraLiters}L jerrycan</span>
                      <span className="tabular-nums font-bold text-accent">+{euro(k.extraBesparing)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span className="font-medium">Reiskosten ({k.afstandRetour} km)</span>
                    <span className="tabular-nums font-bold text-red-500">-{euro(k.reiskosten)}</span>
                  </div>
                  <div className={`flex justify-between border-t-2 pt-1.5 font-extrabold ${
                    loont ? "border-accent/20 text-accent" : "border-red-200 text-red-500"
                  }`}>
                    <span>Netto totaal</span>
                    <span className="tabular-nums">{loont ? "+" : ""}{euro(k.netto)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
        Afstanden en verbruik zijn schattingen. Werkelijke besparing kan afwijken.
      </p>
    </div>
  );
}

function BrutoBesparingOverzicht({
  berekening,
  extraLiters,
  prijzen,
}: {
  berekening: {
    soort: BrandstofSoort;
    soortLabel: string;
    tankGrootte: number;
    besparingen: Besparing[];
  };
  extraLiters: number;
  prijzen: LandPrijzen[];
}) {
  const nlPrijs = prijzen[0][berekening.soort];
  const buitenland = berekening.besparingen.filter((b) => b.besparing > 0);
  if (buitenland.length === 0) return null;

  return (
    <div className="card-bold p-5 animate-slide-in-bottom">
      <h2 className="text-sm font-extrabold text-navy dark:text-white">
        Besparing per volle tank {extraLiters > 0 && ` + ${extraLiters}L jerrycan`}
      </h2>
      <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        {berekening.soortLabel} &middot; {berekening.tankGrootte}L tank &middot; Vul je postcode in voor netto besparing
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {buitenland.map((b) => {
          const extra = extraLiters * (nlPrijs - b.prijsPerLiter);
          const totaal = b.besparing + extra;
          return (
            <div key={b.land} className="rounded-2xl border-2 border-accent/20 bg-accent/5 p-4">
              <div className="text-sm font-bold text-gray-600 dark:text-gray-400">{b.vlag} {b.land}</div>
              <div className="mt-2 text-2xl font-extrabold text-accent">+{euro(totaal)}</div>
              {extraLiters > 0 && (
                <div className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  tank {euro(b.besparing)} + jerrycan {euro(extra)}
                </div>
              )}
              <div className="mt-0.5 text-xs font-bold text-accent/60">bruto besparing (excl. reiskosten)</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatRijtijd(minuten: number): string {
  if (minuten < 60) return `${minuten} min`;
  const uren = Math.floor(minuten / 60);
  const rest = minuten % 60;
  return rest > 0 ? `${uren}u ${rest}min` : `${uren}u`;
}
