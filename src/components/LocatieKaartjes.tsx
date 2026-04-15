"use client";

import { useMemo } from "react";
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
}: {
  postcode: string;
  type: "tankstation" | "supermarkt";
  titel: string;
}) {
  const locaties = useMemo(() => {
    const cleaned = postcode.replace(/\s/g, "");
    if (cleaned.length < 4) return null;
    const origin = postcodeNaarCoordinaat(postcode);
    if (!origin) return null;
    // Gesorteerd op afstand (oplopend): dichtstbijzijnde bovenaan,
    // ongeacht welk land
    return zoekDichtstbijzijnde(origin, type, 3);
  }, [postcode, type]);

  if (!locaties || locaties.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">
        {titel}
      </h2>
      <div className="grid gap-2.5">
        {locaties.map((loc, i) => (
          <LocatieKaart key={loc.id} locatie={loc} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function bouwRouteUrl(locatie: LocatieMetAfstand): string {
  // Google Maps open-in-app deeplink. Werkt in Google Maps, Apple Maps
  // (via iOS redirect), en in desktop browser. Gebruiker's huidige locatie
  // wordt automatisch als startpunt gebruikt als er geen origin is opgegeven.
  const bestemming = encodeURIComponent(`${locatie.adres}, ${locatie.land}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${bestemming}&travelmode=driving`;
}

function LocatieKaart({
  locatie,
  rank,
}: {
  locatie: LocatieMetAfstand;
  rank: number;
}) {
  const ketenKleur =
    KETEN_KLEUREN[locatie.keten] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <div className="group flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-surface p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800">
      {/* Rank + icoon */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-lg">
        <svg
          className="h-6 w-6 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
          {rank}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {locatie.naam}
          </span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${ketenKleur}`}
          >
            {locatie.keten}
          </span>
          <span className="text-xs" aria-label={locatie.land}>
            {locatie.land === "Duitsland" ? "🇩🇪" : "🇧🇪"}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
          {locatie.adres}
        </p>

        {/* Afstand + rijtijd */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <svg
                className="h-3.5 w-3.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {locatie.afstandKm} km
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <svg
                className="h-3.5 w-3.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
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
