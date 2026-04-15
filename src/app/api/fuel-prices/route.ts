import { NextRequest, NextResponse } from "next/server";
import {
  haalDuitsePrijzen,
  haalNederlandsePrijzen,
  haalBelgischePrijzen,
} from "./sources";

/**
 * Brandstofprijzen API.
 *
 * Bronnen:
 * - 🇳🇱 Nederland: CBS Open Data (wekelijks officieel gemiddelde)
 * - 🇩🇪 Duitsland: Tankerkoenig API (live per station, grens-gebied)
 * - 🇧🇪 België: FOD Economie (dagelijks officieel max - 3ct)
 *
 * Cache 1 uur om externe API-rate-limits te respecteren.
 */

export const revalidate = 3600;

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
  bron: "live" | "cache" | "fallback";
  debug?: unknown;
};

// Handmatige fallbacks (april 2026) als een bron niet bereikbaar is
const NL_FALLBACK = { euro95: 2.15, diesel: 1.79 };
const DE_FALLBACK = { euro95: 1.73, diesel: 1.6 };
const BE_FALLBACK = { euro95: 1.81, diesel: 1.68 };

export async function GET(request: NextRequest) {
  const timestamp = Date.now();
  const debugMode = request.nextUrl.searchParams.get("debug") === "1";

  const apiKey = process.env.TANKERKOENIG_API_KEY;

  // Alle drie bronnen parallel
  const [nl, de, be] = await Promise.all([
    haalNederlandsePrijzen(),
    apiKey ? haalDuitsePrijzen(apiKey) : Promise.resolve(null),
    haalBelgischePrijzen(),
  ]);

  const prijzen: LandPrijs[] = [
    {
      land: "Nederland",
      vlag: "🇳🇱",
      euro95: nl?.euro95 ?? NL_FALLBACK.euro95,
      diesel: nl?.diesel ?? NL_FALLBACK.diesel,
      bron: nl && (nl.euro95 !== null || nl.diesel !== null) ? nl.bron : "handmatig",
      bronUrl: nl?.bronUrl,
    },
    {
      land: "Duitsland",
      vlag: "🇩🇪",
      euro95: de?.euro95 ?? DE_FALLBACK.euro95,
      diesel: de?.diesel ?? DE_FALLBACK.diesel,
      bron: de && (de.euro95 !== null || de.diesel !== null) ? de.bron : "handmatig",
      bronUrl: de?.bronUrl,
    },
    {
      land: "België",
      vlag: "🇧🇪",
      euro95: be?.euro95 ?? BE_FALLBACK.euro95,
      diesel: be?.diesel ?? BE_FALLBACK.diesel,
      bron: be && (be.euro95 !== null || be.diesel !== null) ? be.bron : "handmatig",
      bronUrl: be?.bronUrl,
    },
  ];

  const aantalLive = prijzen.filter((p) => p.bron !== "handmatig").length;
  const combi: FuelPricesResponse["bron"] =
    aantalLive === 3 ? "live" : aantalLive > 0 ? "cache" : "fallback";

  const response: FuelPricesResponse = {
    prijzen,
    bijgewerkt: new Date(timestamp).toISOString(),
    bron: combi,
  };

  if (debugMode) {
    response.debug = {
      tankerkoenigKeyAanwezig: !!apiKey,
      nl: nl?.debug ?? "haalNederlandsePrijzen returned null",
      de: de?.debug ?? (apiKey ? "haalDuitsePrijzen returned null" : "geen API key"),
      be: be?.debug ?? "haalBelgischePrijzen returned null",
    };
  }

  return NextResponse.json(response);
}
