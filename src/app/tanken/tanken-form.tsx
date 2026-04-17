"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { zoekVoertuig, type VoertuigData } from "./actions";
import {
  FALLBACK_PRIJZEN,
  berekenBesparingen,
  mapBrandstofSoort,
  detecteerEuro98,
  schattingTankgrootte,
  hybrideVerbruiksFactor,
  hybrideLabel,
  type BrandstofSoort,
  type LandPrijzen,
  type Besparing,
} from "./brandstofprijzen";
import { schattingVerbruikHybride } from "./afstand";
import { slaaTankenOp, leesVoorkeuren, slaaVoorkeurenOp, leesFlow, slaaGekozenTankstationOp } from "@/lib/opslag";
import { LocatieKaartjes } from "@/components/LocatieKaartjes";
import { postcodeNaarCoordinaat, zoekDichtstbijzijnde, type LocatieMetAfstand } from "@/lib/grenslocaties";
import type { FuelPricesResponse } from "@/app/api/fuel-prices/route";
import { ShareCard } from "@/app/resultaat/share-card";

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
  const [isLeaseAuto, setIsLeaseAuto] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoTip, setGeoTip] = useState<string | null>(null);
  const [geoAdres, setGeoAdres] = useState<string | null>(null);
  const [brandstofOverride, setBrandstofOverride] = useState<BrandstofSoort | null>(null);
  const [elektrischPercentage, setElektrischPercentage] = useState(50);
  const [geselecteerdStation, setGeselecteerdStation] = useState<LocatieMetAfstand | null>(null);
  const besparingRef = useRef<HTMLDivElement>(null);
  const flow = leesFlow();

  // Live prijzen
  const [prijzen, setPrijzen] = useState<LandPrijzen[]>(FALLBACK_PRIJZEN);
  const [prijzenBron, setPrijzenBron] = useState<string>("fallback");
  const [prijzenBijgewerkt, setPrijzenBijgewerkt] = useState<string | null>(null);
  const [prijzenLaden, setPrijzenLaden] = useState(true);

  // Laad opgeslagen voorkeuren bij mount
  useEffect(() => {
    const voorkeuren = leesVoorkeuren();
    if (voorkeuren.kenteken) {
      setKenteken(voorkeuren.kenteken);
      // Auto-zoek voertuig als kenteken opgeslagen was
      zoekVoertuig(voorkeuren.kenteken).then((result) => {
        if (result.success) setVoertuig(result.data);
      });
    }
    if (voorkeuren.postcode) setPostcode(voorkeuren.postcode);
    if (voorkeuren.isLeaseAuto) setIsLeaseAuto(true);
  }, []);

  // Sla voorkeuren op bij wijziging
  useEffect(() => {
    if (kenteken || postcode) {
      slaaVoorkeurenOp({ kenteken, postcode, isLeaseAuto });
    }
  }, [kenteken, postcode, isLeaseAuto]);

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

  // Euro 98 detectie op basis van RDW-gegevens
  const euro98Advies = useMemo(() => {
    if (!voertuig) return null;
    const basisSoort = mapBrandstofSoort(voertuig.brandstof);
    if (!basisSoort || basisSoort !== "euro95") return null;
    const { aanbevolen, reden } = detecteerEuro98(
      basisSoort,
      voertuig.eersteToelating,
      voertuig.cilinderinhoud,
      voertuig.merk,
      voertuig.handelsbenaming,
    );
    if (aanbevolen === "euro98" && reden) return reden;
    return null;
  }, [voertuig]);

  const berekening = useMemo(() => {
    if (!voertuig) return null;
    const basisSoort = mapBrandstofSoort(voertuig.brandstof);
    if (!basisSoort) return null;
    // Gebruik override als de gebruiker Euro 98 kiest
    const soort = brandstofOverride ?? basisSoort;
    const ccMatch = voertuig.cilinderinhoud.match(/(\d+)/);
    const cc = ccMatch ? parseInt(ccMatch[1], 10) : 1600;
    const tankGrootte = schattingTankgrootte(cc);
    // Hybride-correctie op verbruik
    const hFactor = hybrideVerbruiksFactor(
      voertuig.hybrideKlasse,
      voertuig.hybrideKlasse === "OVC-HEV" ? elektrischPercentage : 0,
    );
    const verbruik = schattingVerbruikHybride(cc, soort === "euro98" ? "euro95" : soort, hFactor);
    const soortLabels: Record<BrandstofSoort, string> = {
      euro95: "Euro 95",
      euro98: "Euro 98",
      diesel: "Diesel",
    };
    return {
      soort,
      basisSoort,
      soortLabel: soortLabels[soort],
      tankGrootte,
      verbruik,
      cc,
      hybrideKlasse: voertuig.hybrideKlasse,
      besparingen: berekenBesparingen(soort, tankGrootte, prijzen),
    };
  }, [voertuig, prijzen, brandstofOverride, elektrischPercentage]);

  // Bereken welk station de beste netto besparing oplevert
  const besteKeuzeId = useMemo(() => {
    if (!berekening || !postcode) return null;
    const cleaned = postcode.replace(/\s/g, "");
    if (cleaned.length < 4) return null;
    const origin = postcodeNaarCoordinaat(postcode);
    if (!origin) return null;
    const locaties = zoekDichtstbijzijnde(origin, "tankstation", 5);
    if (!locaties || locaties.length === 0) return null;

    const nlPrijs = prijzen[0][berekening.soort];
    let besteId: string | null = null;
    let besteNetto = -Infinity;

    for (const loc of locaties) {
      const besparing = berekening.besparingen.find((b) => b.land === loc.land);
      if (!besparing) continue;
      const buitenlandPrijs = besparing.prijsPerLiter;
      const brandstofEnkel = (loc.afstandKm / 100) * berekening.verbruik;
      const reiskosten = brandstofEnkel * nlPrijs + brandstofEnkel * buitenlandPrijs;
      const netto = besparing.besparing - reiskosten;
      if (netto > besteNetto) {
        besteNetto = netto;
        besteId = loc.id;
      }
    }

    return besteId;
  }, [berekening, postcode, prijzen]);

  useEffect(() => {
    if (!voertuig || !berekening || !geselecteerdStation) return;
    const nlPrijs = prijzen[0][berekening.soort];
    const besparing = berekening.besparingen.find((b) => b.land === geselecteerdStation.land);
    const buitenlandPrijs = besparing?.prijsPerLiter ?? nlPrijs;
    const brandstofEnkel = (geselecteerdStation.afstandKm / 100) * berekening.verbruik;
    const reiskostenHeen = brandstofEnkel * nlPrijs;
    const reiskostenTerug = brandstofEnkel * buitenlandPrijs;
    const reiskosten = reiskostenHeen + reiskostenTerug;
    const netto = (besparing?.besparing ?? 0) - reiskosten;
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
      route: [{
        land: geselecteerdStation.land,
        bestemming: geselecteerdStation.naam,
        afstandEnkel: geselecteerdStation.afstandKm,
        afstandRetour: geselecteerdStation.afstandKm * 2,
        rijtijdMinuten: geselecteerdStation.rijtijdMin * 2,
        reiskosten,
        netto,
      }],
    });
  }, [voertuig, berekening, geselecteerdStation, prijzen]);

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

  async function vraagLocatieOp() {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();

          if (data.address && data.address.postcode) {
            const pc = data.address.postcode.toUpperCase();
            const formatted = pc.replace(/\s/g, "").slice(0, 7);
            setPostcode(formatted);
            setGeoTip(null);

            // Bouw volledig adres op
            const a = data.address;
            const straat = a.road || a.pedestrian || a.footway || "";
            const huisnr = a.house_number || "";
            const plaats = a.city || a.town || a.village || a.municipality || a.hamlet || "";
            const adresDelen = [
              straat && huisnr ? `${straat} ${huisnr}` : straat,
              [formatted, plaats].filter(Boolean).join(" "),
            ].filter(Boolean);
            setGeoAdres(adresDelen.join(", "));
          } else {
            setGeoTip("Postcode niet gevonden. Vul je postcode handmatig in.");
            setGeoAdres(null);
          }
        } catch {
          setGeoTip("Kon je locatie niet omzetten naar een postcode. Vul je postcode handmatig in.");
          setGeoAdres(null);
        } finally {
          setGeoLoading(false);
        }
      },
      (geoError) => {
        setGeoLoading(false);
        if (geoError.code === 1) {
          setGeoTip("locatie_geweigerd");
        } else if (geoError.code === 2) {
          setGeoTip("Locatie kon niet bepaald worden. Vul je postcode handmatig in.");
        } else {
          setGeoTip("Locatiebepaling duurde te lang. Vul je postcode handmatig in.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  async function handleGeolocate() {
    if (!navigator.geolocation) {
      setGeoTip("Je browser ondersteunt geen locatiebepaling. Vul je postcode handmatig in.");
      return;
    }

    setGeoLoading(true);
    setError(null);
    setGeoTip(null);

    // Check eerst de permissie-status als de Permissions API beschikbaar is
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" });

        if (status.state === "denied") {
          // Gebruiker heeft eerder geweigerd — popup komt niet meer
          setGeoLoading(false);
          setGeoTip("locatie_geweigerd");
          return;
        }

        if (status.state === "prompt") {
          // Eerste keer: browser toont automatisch de popup
          // We luisteren ook op verandering, zodat als de gebruiker alsnog toestaat, het werkt
          status.addEventListener("change", () => {
            if (status.state === "granted") {
              setGeoLoading(true);
              setGeoTip(null);
              vraagLocatieOp();
            }
          }, { once: true });
        }

        // "granted" of "prompt" → gewoon doorgaan
        vraagLocatieOp();
      } catch {
        // Permissions API niet ondersteund voor geolocation, gewoon proberen
        vraagLocatieOp();
      }
    } else {
      // Geen Permissions API (oudere browser), gewoon proberen
      vraagLocatieOp();
    }
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
            {/* Dutch license plate styling */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center rounded-l-xl bg-[#003399] px-1.5">
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-extrabold leading-none text-yellow-300 select-none">★★★</div>
                <div className="text-xs font-extrabold text-yellow-300">NL</div>
              </div>
            </div>
            <input
              id="kenteken"
              type="text"
              placeholder="AB123C"
              value={kenteken}
              onChange={(e) => setKenteken(formatKenteken(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && handleKentekenZoek()}
              className="w-full rounded-xl border-2 border-gray-300 bg-[#F5C518] py-3.5 pl-16 pr-4 text-center text-lg font-extrabold tracking-widest text-black placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-500 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-600 dark:bg-[#F5C518] dark:text-black"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              style={{ fontFamily: "monospace" }}
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

      {/* Lease-auto toggle */}
      <div className="card-bold p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 text-xl shadow-md">
            🚙
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-extrabold text-navy dark:text-white">
              Lease-auto met tankpas?
            </h3>
            <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              Brandstof wordt door werkgever betaald
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isLeaseAuto}
              onChange={(e) => {
                setIsLeaseAuto(e.target.checked);
                if (e.target.checked) {
                  localStorage.setItem("grenspret_lease_auto", "true");
                } else {
                  localStorage.removeItem("grenspret_lease_auto");
                }
              }}
              className="peer sr-only"
            />
            <div className="peer h-8 w-16 rounded-full border-2 border-gray-300 bg-white transition-all after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:after:translate-x-8 peer-checked:after:border-accent peer-checked:after:bg-accent dark:border-gray-600 dark:bg-gray-800 dark:after:border-gray-600 dark:after:bg-gray-700 dark:peer-checked:border-accent dark:peer-checked:bg-accent/20 dark:peer-checked:after:bg-accent" />
          </label>
        </div>
      </div>

      {/* Lease-auto banner */}
      {isLeaseAuto && (
        <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30 animate-slide-in-bottom">
          <div className="flex gap-3">
            <span className="shrink-0 text-lg">💰</span>
            <div>
              <h3 className="text-sm font-extrabold text-blue-900 dark:text-blue-100">
                Brandstofkosten: €0.00
              </h3>
              <p className="mt-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                Met een lease-auto en tankpas betaalt je werkgever de brandstof. De besparing is daarom vooral op boodschappen!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Error */}
      {error && (
        <div className="card-bold border-red-200 bg-red-50 p-4 animate-slide-in-bottom dark:border-red-800/50 dark:bg-red-950/30">
          <div className="flex items-start gap-2.5">
            <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="flex-1 text-sm font-medium text-red-700 dark:text-red-300">
              <p className="font-extrabold">Er ging iets mis</p>
              <p className="mt-0.5">{error}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {kenteken.trim() && (
                  <button
                    type="button"
                    onClick={handleKentekenZoek}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white transition-all hover:bg-red-700 active:scale-95"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                    </svg>
                    Opnieuw proberen
                  </button>
                )}
                <a
                  href="/veelgestelde-vragen"
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                >
                  Hulp nodig?
                </a>
              </div>
            </div>
          </div>
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
              {voertuig.hybrideKlasse !== "geen" && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="font-bold text-navy dark:text-white">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      ⚡ {hybrideLabel(voertuig.hybrideKlasse)}
                    </span>
                  </dd>
                </>
              )}
              {voertuig.eersteToelating && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Bouwjaar</dt>
                  <dd className="font-bold text-navy dark:text-white">
                    {voertuig.eersteToelating.length >= 4
                      ? voertuig.eersteToelating.slice(0, 4)
                      : voertuig.eersteToelating}
                  </dd>
                </>
              )}
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

      {/* Euro 98 advies */}
      {voertuig && euro98Advies && berekening && (
        <div className="card-bold overflow-hidden border-amber-300 bg-amber-50 dark:border-amber-700/30 dark:bg-amber-950/30 animate-slide-in-bottom">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg dark:bg-amber-900/30">
                ⛽
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-200">
                  Euro 98 aanbevolen
                </h3>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/80">
                  {euro98Advies}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setBrandstofOverride("euro98")}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      berekening.soort === "euro98"
                        ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
                        : "border border-amber-300 bg-white text-amber-700 hover:border-amber-400 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                    }`}
                  >
                    Euro 98
                  </button>
                  <button
                    onClick={() => setBrandstofOverride(null)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      berekening.soort === "euro95"
                        ? "bg-accent text-white shadow-md shadow-accent/25"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    Euro 95
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hybride melding voor NOVC-HEV */}
      {voertuig && voertuig.hybrideKlasse === "NOVC-HEV" && berekening && (
        <div className="card-bold overflow-hidden border-emerald-300 bg-emerald-50 dark:border-emerald-700/30 dark:bg-emerald-950/30 animate-slide-in-bottom">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-emerald-900/30">
                ⚡
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
                  Hybride gedetecteerd
                </h3>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300/80">
                  Je {voertuig.merk} {voertuig.handelsbenaming} is een hybride. Het verbruik is automatisch ~35% lager berekend ({berekening.verbruik} l/100km).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHEV slider voor elektrisch percentage */}
      {voertuig && voertuig.hybrideKlasse === "OVC-HEV" && berekening && (
        <div className="card-bold overflow-hidden border-emerald-300 bg-emerald-50 dark:border-emerald-700/30 dark:bg-emerald-950/30 animate-slide-in-bottom">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-emerald-900/30">
                🔌
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
                  Plug-in Hybride gedetecteerd
                </h3>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300/80">
                  Je {voertuig.merk} {voertuig.handelsbenaming} is een plug-in hybride. Geef aan hoeveel procent van je ritten je elektrisch rijdt.
                </p>
              </div>
            </div>

            {/* Percentage slider */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  🛢️ Altijd benzine
                </span>
                <span className="rounded-full bg-emerald-200 px-3 py-1 text-sm font-extrabold text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-200">
                  {elektrischPercentage}% elektrisch
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ⚡ Altijd elektrisch
                </span>
              </div>
              <div className="relative mt-2">
                <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all"
                    style={{ width: `${elektrischPercentage}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={elektrischPercentage}
                  onChange={(e) => setElektrischPercentage(parseInt(e.target.value, 10))}
                  className="absolute inset-0 h-3 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/40">
                <span className="text-sm">⛽</span>
                <div className="flex-1 text-xs">
                  <span className="font-medium text-gray-500 dark:text-gray-400">Geschat verbruik:</span>{" "}
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{berekening.verbruik} l/100km</span>
                </div>
              </div>
            </div>
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
        <div className="mt-2.5 flex gap-2">
          <input
            id="postcode"
            type="text"
            placeholder="1234 AB"
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 7));
              if (geoAdres) setGeoAdres(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && postcode.replace(/\s/g, "").length >= 4) {
                // Blur om keyboard te sluiten op mobiel
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="min-w-0 flex-1 rounded-2xl border-2 border-gray-200 px-4 py-3.5 font-bold text-navy placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
            autoComplete="postal-code"
          />
          <button
            onClick={() => {
              // Blur input om keyboard te sluiten op mobiel
              const el = document.getElementById("postcode");
              if (el) (el as HTMLInputElement).blur();
            }}
            disabled={postcode.replace(/\s/g, "").length < 4}
            className="btn-pill btn-pill-accent px-6 py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Zoek
          </button>
        </div>

        {/* Subtiele huidige locatie optie */}
        <button
          onClick={handleGeolocate}
          disabled={geoLoading}
          className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-all hover:text-accent disabled:opacity-50 dark:text-gray-500 dark:hover:text-accent"
        >
          {geoLoading ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Locatie bepalen...</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>Of gebruik je huidige locatie</span>
            </>
          )}
        </button>

        {/* Gevonden adres tonen */}
        {geoAdres && (
          <div className="mt-2 flex items-start gap-2 rounded-xl bg-accent/5 px-3 py-2.5 animate-slide-in-bottom">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <div>
              <p className="text-xs font-extrabold text-navy dark:text-white">
                {geoAdres}
              </p>
              <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                Locatie bepaald via GPS
              </p>
            </div>
          </div>
        )}

        {/* Locatie geweigerd — vriendelijke uitleg */}
        {geoTip === "locatie_geweigerd" && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 animate-slide-in-bottom dark:border-amber-800/30 dark:bg-amber-950/30">
            <div className="flex items-start gap-2.5">
              <span className="text-base">📍</span>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-amber-800 dark:text-amber-200">
                  Locatie staat uit
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-300/80">
                  Geen probleem! Vul gewoon je postcode hierboven in (bv. 3221AB) en we berekenen alles voor je.
                </p>
                <details className="mt-2 group">
                  <summary className="cursor-pointer text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400">
                    Toch locatie gebruiken? Zo zet je het aan
                  </summary>
                  <div className="mt-2 space-y-1.5 text-[11px] text-amber-700/80 dark:text-amber-300/80">
                    <p><strong>iPhone:</strong> Instellingen → Privacy en beveiliging → Locatievoorzieningen → Safari (of je browser) → Zet aan</p>
                    <p><strong>Android:</strong> Instellingen → Locatie → Zet aan. Open daarna de browser opnieuw.</p>
                    <p><strong>Chrome:</strong> Tik op het slotje naast de URL → Sitemachtigingen → Locatie → Toestaan</p>
                  </div>
                </details>
              </div>
              <button
                onClick={() => setGeoTip(null)}
                className="shrink-0 rounded-full p-1 text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                aria-label="Sluiten"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Andere geo-tips (niet-geweigerd) */}
        {geoTip && geoTip !== "locatie_geweigerd" && (
          <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 dark:bg-blue-950/30">
            <span className="text-xs">💡</span>
            <p className="flex-1 text-[11px] text-blue-700 dark:text-blue-300">{geoTip}</p>
            <button onClick={() => setGeoTip(null)} className="shrink-0 text-blue-400 hover:text-blue-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Extra liters meenemen — boven tankstations */}
      {berekening && (
        <ExtraLitersSlider
          extraLiters={extraLiters}
          onChange={setExtraLiters}
          brandstofSoort={berekening.soort}
          prijzen={prijzen}
        />
      )}

      {/* Kies je tanklocatie */}
      {postcode && (
        <LocatieKaartjes
          postcode={postcode}
          type="tankstation"
          titel="Kies je tanklocatie"
          geselecteerdId={geselecteerdStation?.id}
          onSelect={(station) => {
            setGeselecteerdStation(station);
            // Sla tankstation op voor de combi-flow (boodschappen-pagina)
            if (station) {
              slaaGekozenTankstationOp({
                id: station.id,
                naam: station.naam,
                land: station.land,
                adres: station.adres,
                coordinaat: station.coordinaat,
                afstandKm: station.afstandKm,
                rijtijdMin: station.rijtijdMin,
              });
            }
          }}
          besteKeuzeId={besteKeuzeId}
        />
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
                prijzenBron === "live" ? "bg-accent animate-glow" : prijzenBron === "cache" ? "bg-accent" : "bg-gray-400"
              }`} />
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                {prijzenBron === "live" ? "Actueel" : prijzenBron === "cache" ? "Recent" : "Laatst bekend"}
              </span>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-gray-800">
                  <th className="pb-2.5 text-left text-xs font-bold text-gray-400 dark:text-gray-500">Land</th>
                  <th className="pb-2.5 text-right text-xs font-bold text-gray-400 dark:text-gray-500">Euro 95</th>
                  <th className="pb-2.5 text-right text-xs font-bold text-gray-400/60 dark:text-gray-500/60">E98</th>
                  <th className="pb-2.5 text-right text-xs font-bold text-gray-400 dark:text-gray-500">Diesel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {prijzen.map((land) => (
                  <tr key={land.land}>
                    <td className="py-3.5 font-bold text-navy dark:text-white">{land.vlag} {land.land}</td>
                    <td className="py-3.5 text-right tabular-nums font-semibold text-gray-600 dark:text-gray-400">{euro(land.euro95)}</td>
                    <td className="py-3.5 text-right tabular-nums text-xs font-medium text-gray-400 dark:text-gray-500">{euro(land.euro98)}</td>
                    <td className="py-3.5 text-right tabular-nums font-semibold text-gray-600 dark:text-gray-400">{euro(land.diesel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {prijzenBijgewerkt && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
              <span>
                Bijgewerkt{" "}
                {new Date(prijzenBijgewerkt).toLocaleString("nl-NL", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {(() => {
                const bronnen = Array.from(
                  new Set(
                    prijzen
                      .map((p) => p.bron)
                      .filter((b): b is string => !!b && b !== "handmatig"),
                  ),
                );
                if (bronnen.length === 0) return null;
                return <span>· Bronnen: {bronnen.join(", ")}</span>;
              })()}
            </div>
          )}
        </div>
      )}

      {/* Sticky besparingsbalk — verschijnt bij stationselectie */}
      {berekening && geselecteerdStation && (
        <StickyBesparingsBalk
          berekening={berekening}
          station={geselecteerdStation}
          prijzen={prijzen}
          extraLiters={extraLiters}
          isLeaseAuto={isLeaseAuto}
          onTap={() => besparingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
      )}

      {/* Besparingsoverzicht — gecombineerd met geselecteerd station */}
      {berekening && geselecteerdStation && (
        <div ref={besparingRef}>
          <BesparingsBlok
            berekening={berekening}
            station={geselecteerdStation}
            prijzen={prijzen}
            extraLiters={extraLiters}
            isLeaseAuto={isLeaseAuto}
          />
        </div>
      )}

      {/* Bruto besparing als er nog geen station geselecteerd is */}
      {berekening && !geselecteerdStation && (
        <BrutoBesparingOverzicht berekening={berekening} extraLiters={extraLiters} prijzen={prijzen} isLeaseAuto={isLeaseAuto} />
      )}

      {/* Tanken-only: deel je besparing direct op deze pagina */}
      {flow === "tanken" && berekening && geselecteerdStation && (
        <TankenDeelBlok
          berekening={berekening}
          station={geselecteerdStation}
          prijzen={prijzen}
          extraLiters={extraLiters}
          isLeaseAuto={isLeaseAuto}
        />
      )}

      {/* Volgende stap knop — alleen bij combi-flow (tanken-only heeft alles op deze pagina) */}
      {flow === "beide" && berekening && <VolgendeStapKnop stationGeselecteerd={!!geselecteerdStation} />}
    </div>
  );
}

function StickyBesparingsBalk({
  berekening,
  station,
  prijzen,
  extraLiters,
  isLeaseAuto,
  onTap,
}: {
  berekening: {
    soort: BrandstofSoort;
    tankGrootte: number;
    verbruik: number;
    besparingen: Besparing[];
  };
  station: LocatieMetAfstand;
  prijzen: LandPrijzen[];
  extraLiters: number;
  isLeaseAuto: boolean;
  onTap: () => void;
}) {
  const nlPrijs = prijzen[0][berekening.soort];
  const besparing = berekening.besparingen.find((b) => b.land === station.land);
  if (!besparing) return null;

  const buitenlandPrijs = besparing.prijsPerLiter;
  const brandstofEnkel = (station.afstandKm / 100) * berekening.verbruik;
  const reiskostenHeen = brandstofEnkel * nlPrijs;
  const reiskostenTerug = brandstofEnkel * buitenlandPrijs;
  const reiskosten = isLeaseAuto ? 0 : reiskostenHeen + reiskostenTerug;
  const extraBesparing = extraLiters * (nlPrijs - buitenlandPrijs);
  const netto = besparing.besparing + extraBesparing - reiskosten;
  const loont = netto > 0;
  const vlag = station.land === "Duitsland" ? "\u{1F1E9}\u{1F1EA}" : "\u{1F1E7}\u{1F1EA}";

  return (
    <button
      onClick={onTap}
      className={`sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-10 -mx-4 w-[calc(100%+2rem)] px-4 py-3.5 shadow-[0_-4px_20px_rgba(0,210,106,0.2)] transition-all active:scale-[0.99] sm:static sm:mx-0 sm:w-full sm:rounded-2xl sm:shadow-lg animate-slide-up ${
        loont
          ? "bg-gradient-to-r from-accent to-emerald-500 sm:shadow-accent/15"
          : "bg-gradient-to-r from-red-500 to-rose-500 sm:shadow-red-500/15"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-left">
          <span className="text-lg">{vlag}</span>
          <div>
            <div className="text-[11px] font-bold text-white/80">
              {station.naam} · {station.afstandKm * 2} km retour
            </div>
            <div className="text-lg font-extrabold tabular-nums text-white">
              {loont ? "Bespaar " : ""}
              {loont ? "+" : ""}{euro(netto)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-white/80">
          <span className="text-[11px] font-bold">Details</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function TankenDeelBlok({
  berekening,
  station,
  prijzen,
  extraLiters,
  isLeaseAuto,
}: {
  berekening: {
    soort: BrandstofSoort;
    tankGrootte: number;
    verbruik: number;
    besparingen: Besparing[];
  };
  station: LocatieMetAfstand;
  prijzen: LandPrijzen[];
  extraLiters: number;
  isLeaseAuto: boolean;
}) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [bezig, setBezig] = useState<"tekst" | "afbeelding" | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const nlPrijs = prijzen[0][berekening.soort];
  const besparing = berekening.besparingen.find((b) => b.land === station.land);
  if (!besparing) return null;

  const buitenlandPrijs = besparing.prijsPerLiter;
  const brandstofEnkel = (station.afstandKm / 100) * berekening.verbruik;
  const reiskostenHeen = brandstofEnkel * nlPrijs;
  const reiskostenTerug = brandstofEnkel * buitenlandPrijs;
  const reiskosten = isLeaseAuto ? 0 : reiskostenHeen + reiskostenTerug;
  const extraBesparing = extraLiters * (nlPrijs - buitenlandPrijs);
  const netto = besparing.besparing + extraBesparing - reiskosten;
  const loont = netto > 0;

  const vlag = station.land === "Duitsland" ? "🇩🇪" : "🇧🇪";
  const url = typeof window !== "undefined" ? window.location.origin : "grenspret.nl";

  function bouwTekst(): string {
    const regels: string[] = [
      `🎉 Ik bespaar ${euro(netto)} door in ${station.land} te tanken!`,
      "",
      `${vlag} ${station.naam} · ${station.afstandKm * 2} km retour`,
      `⛽ Volle tank (${berekening.tankGrootte}L): +${euro(besparing!.besparing)}`,
    ];
    if (extraLiters > 0) {
      regels.push(`🪣 Jerrycan (${extraLiters}L): +${euro(extraBesparing)}`);
    }
    if (!isLeaseAuto) {
      regels.push(`🚗 Reiskosten: −${euro(reiskosten)}`);
    }
    regels.push(`💰 Netto besparing: ${euro(netto)}`);
    regels.push("");
    regels.push(`Wil jij ook besparen? Download de gratis Grenspret app! 🚀`);
    regels.push(`👉 ${url}`);
    return regels.join("\n");
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(bouwTekst())}`, "_blank");
  }

  async function handleKopieer() {
    setBezig("tekst");
    setStatus(null);
    try {
      await navigator.clipboard.writeText(bouwTekst());
      setStatus("Gekopieerd!");
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus("Kon niet kopiëren");
      setTimeout(() => setStatus(null), 2500);
    } finally {
      setBezig(null);
    }
  }

  async function handleAfbeelding() {
    if (!shareRef.current) return;
    setBezig("afbeelding");
    setStatus(null);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0A1628",
      });

      const blob = await (await fetch(dataUrl)).blob();
      const bestandsnaam = `grenspret-besparing-${new Date().toISOString().slice(0, 10)}.png`;
      const file = new File([blob], bestandsnaam, { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        "canShare" in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Grenspret besparing",
          text: bouwTekst(),
        });
        setStatus("Gedeeld");
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = bestandsnaam;
        link.click();
        setStatus("Afbeelding opgeslagen");
      }
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      console.error("Afbeelding delen mislukt:", err);
      setStatus("Kon afbeelding niet maken");
      setTimeout(() => setStatus(null), 2500);
    } finally {
      setBezig(null);
    }
  }

  if (!loont) return null;

  return (
    <div className="animate-slide-in-bottom space-y-4">
      {/* Deel je besparing */}
      <div className="card-bold p-5 space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-navy dark:text-white">
            Deel je besparing
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Laat vrienden en familie zien hoeveel je bespaart
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#25D366] px-3 py-3 text-white shadow-md transition-all hover:bg-[#20bd5a] hover:shadow-lg active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-[10px] font-extrabold">WhatsApp</span>
          </button>

          {/* Afbeelding */}
          <button
            onClick={handleAfbeelding}
            disabled={bezig === "afbeelding"}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-accent px-3 py-3 text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {bezig === "afbeelding" ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            )}
            <span className="text-[10px] font-extrabold">Afbeelding</span>
          </button>

          {/* Kopieer */}
          <button
            onClick={handleKopieer}
            disabled={bezig === "tekst"}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-gray-200 bg-white px-3 py-3 text-navy shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-navy/50 dark:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
            </svg>
            <span className="text-[10px] font-extrabold">Kopieer</span>
          </button>
        </div>

        {status && (
          <div className="rounded-xl bg-accent/10 px-3 py-2 text-center text-xs font-extrabold text-accent animate-fade-in">
            ✓ {status}
          </div>
        )}

        {/* Off-screen ShareCard voor afbeelding export */}
        <div
          style={{ position: "fixed", left: "-200vw", top: "0", pointerEvents: "none", zIndex: -1 }}
          aria-hidden="true"
        >
          <ShareCard
            ref={shareRef}
            besparing={netto}
            land={station.land}
            vlag={vlag}
            besparingTanken={besparing.besparing + extraBesparing}
            besparingBoodschappen={0}
            reiskosten={reiskosten}
            rijtijdMin={station.rijtijdMin * 2}
            afstandKm={station.afstandKm * 2}
            aantalHuishoudens={1}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
        Gekoppeld met RDW, OpenStreetMap, CBS, Tankerkoenig en FOD Economie
      </div>
    </div>
  );
}

function VolgendeStapKnop({ stationGeselecteerd }: { stationGeselecteerd: boolean }) {
  const flow = leesFlow();

  // Flow "tanken" → direct naar resultaat (skip boodschappen)
  // Flow "beide" → naar boodschappen (alleen als station geselecteerd)
  const naarResultaat = flow === "tanken";
  const isUitgeschakeld = flow === "beide" && !stationGeselecteerd;

  if (isUitgeschakeld) {
    return (
      <div className="space-y-2">
        <div
          className="flex items-center justify-between rounded-3xl bg-gray-200 p-5 opacity-50 dark:bg-gray-800"
          aria-disabled="true"
        >
          <div className="text-left">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Stap 2 van 2
            </p>
            <p className="mt-0.5 text-base font-extrabold text-gray-400 dark:text-gray-500">
              Boodschappen toevoegen
            </p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              Selecteer eerst een tankstation hierboven
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-300/50 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
        <p className="text-center text-[11px] font-medium text-amber-600 dark:text-amber-400">
          ☝️ Selecteer een tankstation om verder te gaan
        </p>
      </div>
    );
  }

  return (
    <Link
      href={naarResultaat ? "/resultaat" : "/boodschappen"}
      className={`group flex items-center justify-between rounded-3xl p-5 shadow-lg transition-all hover:shadow-xl active:scale-[0.98] ${
        naarResultaat
          ? "bg-gradient-to-br from-navy to-slate-800 shadow-navy/25 dark:from-white dark:to-gray-100 dark:shadow-white/10"
          : "bg-gradient-to-br from-accent to-emerald-500 shadow-accent/25 hover:shadow-accent/30"
      }`}
    >
      <div className="text-left">
        <p className={`text-[11px] font-extrabold uppercase tracking-widest ${
          naarResultaat ? "text-white/70 dark:text-navy/70" : "text-white/70"
        }`}>
          {naarResultaat ? "Bekijk resultaat" : "Stap 2 van 2"}
        </p>
        <p className={`mt-0.5 text-base font-extrabold ${
          naarResultaat ? "text-white dark:text-navy" : "text-white"
        }`}>
          {naarResultaat ? "Bekijk je besparing" : "Boodschappen toevoegen"}
        </p>
        <p className={`mt-0.5 text-xs ${
          naarResultaat ? "text-white/80 dark:text-navy/80" : "text-white/80"
        }`}>
          {naarResultaat
            ? "Bekijk je netto besparing op tanken"
            : "Bereken ook je besparing op boodschappen"}
        </p>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1 ${
        naarResultaat
          ? "bg-white/20 text-white dark:bg-navy/10 dark:text-navy"
          : "bg-white/20 text-white"
      }`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </Link>
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

      {/* Wettelijke info */}
      <div className="mt-3">
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200/50 p-3.5 dark:bg-amber-950/30 dark:border-amber-800/30">
          <span className="shrink-0 text-sm">⚠️</span>
          <p className="text-[11px] font-medium leading-relaxed text-amber-800 dark:text-amber-300">
            Wettelijk toegestaan: <strong>10 liter per persoon</strong> in een
            goedgekeurde (UN/metalen) jerrycan. Plastic jerrycans zijn niet
            toegestaan voor benzine.
          </p>
        </div>
      </div>
    </div>
  );
}

function BesparingsBlok({
  berekening,
  station,
  prijzen,
  extraLiters,
  isLeaseAuto,
}: {
  berekening: {
    soort: BrandstofSoort;
    soortLabel: string;
    tankGrootte: number;
    verbruik: number;
    besparingen: Besparing[];
  };
  station: LocatieMetAfstand;
  prijzen: LandPrijzen[];
  extraLiters: number;
  isLeaseAuto: boolean;
}) {
  const nlPrijs = prijzen[0][berekening.soort];
  const besparing = berekening.besparingen.find((b) => b.land === station.land);
  if (!besparing) return null;

  const buitenlandPrijs = besparing.prijsPerLiter;
  const afstandRetourKm = station.afstandKm * 2;
  const rijtijdRetourMin = station.rijtijdMin * 2;

  // Brandstofkosten: heen op dure NL prijs (tank nog NL), terug op goedkope buitenland prijs
  const brandstofEnkel = (station.afstandKm / 100) * berekening.verbruik;
  const reiskostenHeen = brandstofEnkel * nlPrijs;
  const reiskostenTerug = brandstofEnkel * buitenlandPrijs;
  const reiskosten = isLeaseAuto ? 0 : reiskostenHeen + reiskostenTerug;

  const extraBesparing = extraLiters * (nlPrijs - buitenlandPrijs);
  const netto = besparing.besparing + extraBesparing - reiskosten;
  const loont = netto > 0;

  const vlag = station.land === "Duitsland" ? "\u{1F1E9}\u{1F1EA}" : "\u{1F1E7}\u{1F1EA}";
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${station.adres}, ${station.land}`)}&travelmode=driving`;

  return (
    <div className="animate-slide-in-bottom space-y-3">
      <h2 className="text-sm font-extrabold text-navy dark:text-white">
        Jouw besparing
      </h2>

      <div className={`card-bold relative overflow-hidden transition-all ${
        loont
          ? "border-accent bg-gradient-to-br from-accent/5 to-emerald-50 dark:from-accent/10 dark:to-emerald-950/30"
          : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30"
      }`}>
        <div className="p-5">
          {/* Station header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{vlag}</span>
                <span className="text-sm font-extrabold text-navy dark:text-white">
                  {station.naam}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {station.adres}
              </p>
            </div>
            {/* Compact retour info */}
            <div className="shrink-0 rounded-xl bg-white/60 px-3 py-2 text-center dark:bg-gray-800/40">
              <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Retour</div>
              <div className="mt-0.5 text-xs font-extrabold text-navy dark:text-white">
                {afstandRetourKm} km
              </div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                {formatRijtijd(rijtijdRetourMin)}
              </div>
            </div>
          </div>

          {/* Besparing headline */}
          <div className="mt-4">
            <div className={`text-3xl font-extrabold ${
              loont ? "text-accent" : "text-red-500 dark:text-red-400"
            }`}>
              {loont ? "+" : ""}{euro(netto)}
            </div>
            <div className={`text-xs font-bold ${
              loont ? "text-accent/70" : "text-red-400"
            }`}>
              {loont ? "netto besparing" : "het loont (nog) niet"}
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-4 space-y-1.5 border-t-2 border-gray-200/50 pt-3 text-xs dark:border-gray-700/50">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span className="font-medium">Volle tank ({berekening.tankGrootte}L)</span>
              <span className="tabular-nums font-bold text-accent">+{euro(besparing.besparing)}</span>
            </div>
            {extraLiters > 0 && (
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span className="font-medium">Jerrycan ({extraLiters}L)</span>
                <span className="tabular-nums font-bold text-accent">+{euro(extraBesparing)}</span>
              </div>
            )}
            {!isLeaseAuto && (
              <>
                <div className="flex justify-between text-gray-400 dark:text-gray-500">
                  <span className="font-medium">Heen ({station.afstandKm} km, NL-prijs)</span>
                  <span className="tabular-nums font-medium text-red-400">-{euro(reiskostenHeen)}</span>
                </div>
                <div className="flex justify-between text-gray-400 dark:text-gray-500">
                  <span className="font-medium">Terug ({station.afstandKm} km, {station.land.slice(0, 2)}-prijs)</span>
                  <span className="tabular-nums font-medium text-red-400">-{euro(reiskostenTerug)}</span>
                </div>
              </>
            )}
            <div className={`flex justify-between border-t-2 pt-2 font-extrabold ${
              loont ? "border-accent/20 text-accent" : "border-red-200 text-red-500"
            }`}>
              <span>Netto totaal</span>
              <span className="tabular-nums">{loont ? "+" : ""}{euro(netto)}</span>
            </div>
          </div>

          {isLeaseAuto && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
              <span className="text-xs">🚙</span>
              <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                Lease-auto: reiskosten €0 (werkgever betaalt brandstof)
              </span>
            </div>
          )}

          {/* Navigeer knop */}
          <a
            href={routeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-extrabold text-white shadow-md shadow-accent/25 transition-all hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            Navigeer naar {station.naam}
          </a>
        </div>
      </div>

      {/* Info line */}
      <p className="text-center text-[11px] font-medium text-gray-400 dark:text-gray-500">
        {berekening.soortLabel} · {berekening.verbruik} l/100km · Geschatte afstanden
      </p>
    </div>
  );
}

function BrutoBesparingOverzicht({
  berekening,
  extraLiters,
  prijzen,
  isLeaseAuto,
}: {
  berekening: {
    soort: BrandstofSoort;
    soortLabel: string;
    tankGrootte: number;
    besparingen: Besparing[];
  };
  extraLiters: number;
  prijzen: LandPrijzen[];
  isLeaseAuto: boolean;
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
        {berekening.soortLabel} &middot; {berekening.tankGrootte}L tank {isLeaseAuto && "🚙 (lease-auto)"} &middot; Vul je postcode in voor netto besparing
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
              {isLeaseAuto && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 dark:bg-blue-950/30">
                  <span className="text-xs">🚙</span>
                  <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    Lease-auto: brandstof gratis
                  </span>
                </div>
              )}
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
