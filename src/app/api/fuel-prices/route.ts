import { NextRequest, NextResponse } from "next/server";
import {
  haalDuitsePrijzen,
  haalNederlandsePrijzen,
  haalBelgischePrijzen,
  haalLuxemburgschePrijzen,
} from "./sources";

/**
 * Brandstofprijzen API.
 *
 * Bronnen:
 * - 🇳🇱 Nederland: CBS Open Data (wekelijks officieel gemiddelde)
 * - 🇩🇪 Duitsland: Tankerkoenig API (live per station, grens-gebied)
 * - 🇧🇪 België: FOD Economie (dagelijks officieel max - 3ct)
 * - 🇱🇺 Luxemburg: Petrol.lu (officiële maximumprijzen) / Carbu.com
 *
 * Euro 98 (Super Plus):
 * - CBS publiceert geen aparte Euro 98 prijs
 * - Tankerkoenig heeft geen apart Super Plus veld
 * - We berekenen Euro 98 als Euro 95 + landspecifieke opslag
 *   (gebaseerd op gemiddeld marktprijsverschil)
 *
 * Cache 1 uur om externe API-rate-limits te respecteren.
 */

export const revalidate = 3600;

// Euro 98 opslag per land (gemiddeld prijsverschil t.o.v. Euro 95)
const EURO98_OPSLAG = {
  NL: 0.14, // ~14 cent duurder in Nederland
  DE: 0.14, // ~14 cent duurder in Duitsland
  BE: 0.12, // ~12 cent duurder in België
  LU: 0.10, // ~10 cent duurder in Luxemburg (lage accijns)
};

type LandPrijs = {
  land: string;
  vlag: string;
  euro95: number;
  euro98: number;
  diesel: number;
  bron: string;
  bronUrl?: string;
};

export type FuelPricesResponse = {
  prijzen: LandPrijs[];
  bijgewerkt: string;
  bron: "live" | "cache" | "fallback";
  debug?: unknown;
};

// Handmatige fallbacks als een bron niet bereikbaar is
// Bijgewerkt 17 april 2026 op basis van officiële bronnen
const NL_FALLBACK = { euro95: 2.57, diesel: 2.73 }; // CBS
const DE_FALLBACK = { euro95: 2.10, diesel: 2.28 }; // Tankerkoenig
// België: Euro 95 = E10 (standaard aan Belgische pompen, lage accijns)
// Diesel = B7 (maximumprijs FOD Economie minus ~3ct)
const BE_FALLBACK = { euro95: 1.76, diesel: 2.08 }; // Handmatig 17 april 2026
const LU_FALLBACK = { euro95: 1.50, diesel: 1.45 }; // Handmatig 18 april 2026 (Petrol.lu)

export async function GET(request: NextRequest) {
  const timestamp = Date.now();
  const debugMode = request.nextUrl.searchParams.get("debug") === "1";

  const apiKey = process.env.TANKERKOENIG_API_KEY;

  // Alle vier bronnen parallel
  const [nl, de, be, lu] = await Promise.all([
    haalNederlandsePrijzen(),
    apiKey ? haalDuitsePrijzen(apiKey) : Promise.resolve(null),
    haalBelgischePrijzen(),
    haalLuxemburgschePrijzen(),
  ]);

  const nlE95 = nl?.euro95 ?? NL_FALLBACK.euro95;
  const deE95 = de?.euro95 ?? DE_FALLBACK.euro95;
  const beE95 = be?.euro95 ?? BE_FALLBACK.euro95;
  const luE95 = lu?.euro95 ?? LU_FALLBACK.euro95;

  const prijzen: LandPrijs[] = [
    {
      land: "Nederland",
      vlag: "🇳🇱",
      euro95: nlE95,
      euro98: Math.round((nlE95 + EURO98_OPSLAG.NL) * 1000) / 1000,
      diesel: nl?.diesel ?? NL_FALLBACK.diesel,
      bron: nl && (nl.euro95 !== null || nl.diesel !== null) ? nl.bron : "handmatig",
      bronUrl: nl?.bronUrl,
    },
    {
      land: "Duitsland",
      vlag: "🇩🇪",
      euro95: deE95,
      euro98: Math.round((deE95 + EURO98_OPSLAG.DE) * 1000) / 1000,
      diesel: de?.diesel ?? DE_FALLBACK.diesel,
      bron: de && (de.euro95 !== null || de.diesel !== null) ? de.bron : "handmatig",
      bronUrl: de?.bronUrl,
    },
    {
      land: "België",
      vlag: "🇧🇪",
      euro95: beE95,
      euro98: Math.round((beE95 + EURO98_OPSLAG.BE) * 1000) / 1000,
      diesel: be?.diesel ?? BE_FALLBACK.diesel,
      bron: be && (be.euro95 !== null || be.diesel !== null) ? be.bron : "handmatig",
      bronUrl: be?.bronUrl,
    },
    {
      land: "Luxemburg",
      vlag: "🇱🇺",
      euro95: luE95,
      euro98: Math.round((luE95 + EURO98_OPSLAG.LU) * 1000) / 1000,
      diesel: lu?.diesel ?? LU_FALLBACK.diesel,
      bron: lu && (lu.euro95 !== null || lu.diesel !== null) ? lu.bron : "handmatig",
      bronUrl: lu?.bronUrl,
    },
  ];

  const aantalLive = prijzen.filter((p) => p.bron !== "handmatig").length;
  const combi: FuelPricesResponse["bron"] =
    aantalLive === 4 ? "live" : aantalLive > 0 ? "cache" : "fallback";

  const response: FuelPricesResponse = {
    prijzen,
    bijgewerkt: new Date(timestamp).toISOString(),
    bron: combi,
  };

  if (debugMode) {
    response.debug = {
      tankerkoenigKeyAanwezig: !!apiKey,
      euro98Opslag: EURO98_OPSLAG,
      nl: nl?.debug ?? "haalNederlandsePrijzen returned null",
      de: de?.debug ?? (apiKey ? "haalDuitsePrijzen returned null" : "geen API key"),
      be: be?.debug ?? "haalBelgischePrijzen returned null",
      lu: lu?.debug ?? "haalLuxemburgschePrijzen returned null",
    };
  }

  return NextResponse.json(response);
}
