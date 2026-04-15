import { NextResponse } from "next/server";
import {
  haalNederlandsePrijzen,
  haalBelgischePrijzen,
  haalDuitsePrijzen,
} from "./sources";

/**
 * Brandstofprijzen API.
 *
 * Combineert live data uit meerdere bronnen en valt gracieus terug
 * op handmatig bijgehouden fallback-prijzen als een bron niet
 * bereikbaar is.
 */

// Tijdelijk force-dynamic voor debuggen van de scrapers.
// Later terug naar `export const revalidate = 3600;`
export const dynamic = "force-dynamic";

type LandPrijs = {
  land: string;
  vlag: string;
  euro95: number;
  diesel: number;
  bron: string;
  bronUrl?: string;
};

export type FuelPricesResponse = {
  prijzen: LandPrijs[];
  bijgewerkt: string;
  // Deprecated veld, voor backwards compatibility met bestaande UI
  bron: "live" | "cache" | "fallback";
};

// Fallback-prijzen als laatste redmiddel.
// Laatste handmatige update: april 2026.
const NL_FALLBACK = { euro95: 2.15, diesel: 1.79 };
const DE_FALLBACK = { euro95: 1.73, diesel: 1.60 };
const BE_FALLBACK = { euro95: 1.81, diesel: 1.68 };

export async function GET() {
  const timestamp = Date.now();
  const nietNull = <T>(x: T | null | undefined, fallback: T): T => (x != null ? x : fallback);

  // Alle drie bronnen parallel ophalen
  const apiKey = process.env.TANKERKOENIG_API_KEY;
  console.log(`[fuel] Scrape gestart. TANKERKOENIG_API_KEY aanwezig: ${!!apiKey}`);
  const [nl, be, de] = await Promise.all([
    haalNederlandsePrijzen(),
    haalBelgischePrijzen(),
    apiKey ? haalDuitsePrijzen(apiKey) : Promise.resolve(null),
  ]);
  console.log(`[fuel] Resultaten: NL=${nl ? JSON.stringify(nl) : "null"}, BE=${be ? JSON.stringify(be) : "null"}, DE=${de ? JSON.stringify(de) : "null"}`);

  // Per land: combineer live data met fallback waar nodig
  const prijzen: LandPrijs[] = [
    {
      land: "Nederland",
      vlag: "🇳🇱",
      euro95: nietNull(nl?.euro95, NL_FALLBACK.euro95),
      diesel: nietNull(nl?.diesel, NL_FALLBACK.diesel),
      bron: nl?.bron ?? "handmatig",
      bronUrl: nl?.bronUrl,
    },
    {
      land: "Duitsland",
      vlag: "🇩🇪",
      euro95: nietNull(de?.euro95, DE_FALLBACK.euro95),
      diesel: nietNull(de?.diesel, DE_FALLBACK.diesel),
      bron: de?.bron ?? "handmatig",
      bronUrl: de?.bronUrl,
    },
    {
      land: "België",
      vlag: "🇧🇪",
      euro95: nietNull(be?.euro95, BE_FALLBACK.euro95),
      diesel: nietNull(be?.diesel, BE_FALLBACK.diesel),
      bron: be?.bron ?? "handmatig",
      bronUrl: be?.bronUrl,
    },
  ];

  // Deprecated 'bron' veld voor de bestaande UI
  const alleLive = nl && be && (de || !apiKey);
  const geenLive = !nl && !be && !de;
  const combi: FuelPricesResponse["bron"] = alleLive
    ? "live"
    : geenLive
      ? "fallback"
      : "cache";

  return NextResponse.json({
    prijzen,
    bijgewerkt: new Date(timestamp).toISOString(),
    bron: combi,
  } satisfies FuelPricesResponse);
}
