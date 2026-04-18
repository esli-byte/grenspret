"use client";

import { useEffect, useMemo, useState } from "react";
import {
  postcodeNaarCoordinaat,
  zoekDichtstbijzijnde,
  type LocatieMetAfstand,
} from "@/lib/grenslocaties";

function formatRijtijd(min: number): string {
  if (min < 60) return `${min} min`;
  const u = Math.floor(min / 60);
  const r = min % 60;
  return r > 0 ? `${u}u ${r}min` : `${u}u`;
}

const KETEN_KLEUREN: Record<string, string> = {
  Aral: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Shell: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  JET: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Esso: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Star: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  ALDI: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  Lidl: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Kaufland: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  EDEKA: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Colruyt: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Delhaize: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Lukoil: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  TotalEnergies: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Gulf: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Texaco: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function LocatieKaartjes({
  postcode,
  type,
  titel,
  subtitel,
  geselecteerdId,
  onSelect,
  besteKeuzeId,
}: {
  postcode: string;
  type: "tankstation" | "supermarkt";
  titel: string;
  subtitel?: string;
  geselecteerdId?: string | null;
  onSelect?: (locatie: LocatieMetAfstand) => void;
  besteKeuzeId?: string | null;
}) {
  // Inklapstatus: zodra een locatie is geselecteerd, klap in
  const [ingeklapt, setIngeklapt] = useState(false);

  // Stap 1: snelle hemelsbreed-schatting voor initieel tonen
  const initLocaties = useMemo(() => {
    const cleaned = postcode.replace(/\s/g, "");
    if (cleaned.length < 4) return null;
    const origin = postcodeNaarCoordinaat(postcode);
    if (!origin) return null;
    return zoekDichtstbijzijnde(origin, type, 5);
  }, [postcode, type]);

  // Stap 2: echte rijafstanden ophalen via OSRM
  const [locaties, setLocaties] = useState<LocatieMetAfstand[] | null>(null);

  useEffect(() => {
    if (!initLocaties || initLocaties.length === 0) {
      setLocaties(null);
      return;
    }

    // Toon meteen de schattingen
    setLocaties(initLocaties);

    const origin = postcodeNaarCoordinaat(postcode);
    if (!origin) return;

    let cancelled = false;

    async function fetchRoutes() {
      try {
        const destinations = initLocaties!.map((l) => `${l.coordinaat.lat},${l.coordinaat.lng}`).join(";");
        const res = await fetch(`/api/route?origins=${origin!.lat},${origin!.lng}&destinations=${destinations}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.routes && !cancelled) {
          const bijgewerkt = initLocaties!.map((loc, i) => ({
            ...loc,
            afstandKm: data.routes[i].afstandKm,
            rijtijdMin: data.routes[i].rijtijdMin,
          }));
          // Sorteer opnieuw op echte afstand
          bijgewerkt.sort((a, b) => a.afstandKm - b.afstandKm);
          setLocaties(bijgewerkt);
        }
      } catch {
        // Fout bij ophalen, behoudt schattingen
      }
    }

    fetchRoutes();
    return () => { cancelled = true; };
  }, [initLocaties, postcode]);

  // Auto-inklappen als een locatie geselecteerd wordt
  useEffect(() => {
    if (geselecteerdId) {
      setIngeklapt(true);
    }
  }, [geselecteerdId]);

  if (!locaties || locaties.length === 0) return null;

  // Vind de geselecteerde locatie voor ingeklapte weergave
  const geselecteerdeLocatie = geselecteerdId
    ? locaties.find((l) => l.id === geselecteerdId) ?? null
    : null;

  // === Ingeklapte weergave: alleen geselecteerde locatie + Wijzigen knop ===
  if (ingeklapt && geselecteerdeLocatie) {
    const ketenKleur = KETEN_KLEUREN[geselecteerdeLocatie.keten] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 shadow-sm transition-all dark:bg-accent/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icoon */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {geselecteerdeLocatie.naam}
                </span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${ketenKleur}`}>
                  {geselecteerdeLocatie.keten}
                </span>
                <span className="text-xs">
                  {geselecteerdeLocatie.land === "Duitsland" ? "\u{1F1E9}\u{1F1EA}" : "\u{1F1E7}\u{1F1EA}"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {geselecteerdeLocatie.afstandKm} km &middot; {formatRijtijd(geselecteerdeLocatie.rijtijdMin)}
              </p>
            </div>
          </div>
          {/* Wijzigen knop */}
          <button
            onClick={() => setIngeklapt(false)}
            className="flex items-center gap-1.5 shrink-0 rounded-full bg-accent/10 px-4 py-2 text-xs font-extrabold text-accent transition-all hover:bg-accent/20 active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Wijzigen
          </button>
        </div>
      </div>
    );
  }

  // === Uitgeklapte weergave: alle locaties ===
  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">
        {titel}
      </h2>
      {onSelect && (
        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
          {subtitel || "Tik op een locatie om deze te selecteren"}
        </p>
      )}

      <div className="grid gap-2.5">
        {locaties.map((loc, i) => (
          <LocatieKaart
            key={loc.id}
            locatie={loc}
            rank={i + 1}
            isGeselecteerd={geselecteerdId === loc.id}
            isBeste={besteKeuzeId === loc.id}
            onSelect={onSelect ? () => {
              onSelect(loc);
              setIngeklapt(true);
            } : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function bouwRouteUrl(locatie: LocatieMetAfstand): string {
  const bestemming = encodeURIComponent(`${locatie.adres}, ${locatie.land}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${bestemming}&travelmode=driving`;
}

function LocatieKaart({
  locatie,
  rank,
  isGeselecteerd,
  isBeste,
  onSelect,
}: {
  locatie: LocatieMetAfstand;
  rank: number;
  isGeselecteerd?: boolean;
  isBeste?: boolean;
  onSelect?: () => void;
}) {
  const ketenKleur = KETEN_KLEUREN[locatie.keten] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={onSelect ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      } : undefined}
      className={`group flex items-start gap-3.5 rounded-2xl border p-4 shadow-sm transition-all ${
        onSelect ? "cursor-pointer active:scale-[0.98]" : ""
      } ${
        isGeselecteerd
          ? "border-accent bg-accent/5 shadow-accent/10 ring-2 ring-accent/30 dark:bg-accent/10"
          : "border-gray-100 bg-surface hover:shadow-md dark:border-gray-800"
      }`}
    >
      {/* Rank + icoon */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-lg">
        {isGeselecteerd ? (
          <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        )}
        <span className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
          isGeselecteerd ? "bg-accent" : "bg-primary"
        }`}>
          {rank}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {locatie.naam}
          </span>
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${ketenKleur}`}>
            {locatie.keten}
          </span>
          <span className="text-xs" aria-label={locatie.land}>
            {locatie.land === "Duitsland" ? "\u{1F1E9}\u{1F1EA}" : "\u{1F1E7}\u{1F1EA}"}
          </span>
          {isBeste && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              Beste keuze
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
          {locatie.adres}
        </p>

        {/* Afstand + rijtijd */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {locatie.afstandKm} km
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {formatRijtijd(locatie.rijtijdMin)}
              </span>
            </div>
          </div>

          {/* Route knop — opent Google Maps */}
          <a
            href={bouwRouteUrl(locatie)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-extrabold text-accent transition-all hover:bg-accent hover:text-white active:scale-95"
            title={`Route naar ${locatie.naam} in Google Maps`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            Route
          </a>
        </div>
      </div>
    </div>
  );
}
