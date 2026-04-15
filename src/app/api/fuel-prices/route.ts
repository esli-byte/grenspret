import { NextRequest, NextResponse } from "next/server";
import { haalDuitsePrijzen } from "./sources";

/**
 * Brandstofprijzen API.
 *
 * - Duitsland: live via Tankerkoenig API (gratis, wettelijk verplichte
 *   prijsverstrekking door alle Duitse tankstations).
 * - Nederland en België: handmatig bijgehouden fallback-prijzen.
 *
 * Cache: 1 uur (Next.js fetch-cache), zodat we Tankerkoenig niet meer
 * dan 1× per uur bevragen.
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

// Handmatig bijgehouden fallback-prijzen (april 2026).
// Update deze 1× per kwartaal of als je grote afwijkingen ziet.
const NL_FALLBACK = { euro95: 2.15, diesel: 1.79 };
const DE_FALLBACK = { euro95: 1.73, diesel: 1.6 };
const BE_FALLBACK = { euro95: 1.81, diesel: 1.68 };

export async function GET(request: NextRequest) {
  const timestamp = Date.now();
  const debugMode = request.nextUrl.searchParams.get("debug") === "1";

  // Duitsland: live via Tankerkoenig
  const apiKey = process.env.TANKERKOENIG_API_KEY;
  const de = apiKey ? await haalDuitsePrijzen(apiKey) : null;

  const dePrijs: LandPrijs = {
    land: "Duitsland",
    vlag: "🇩🇪",
    euro95: de?.euro95 ?? DE_FALLBACK.euro95,
    diesel: de?.diesel ?? DE_FALLBACK.diesel,
    bron: de && (de.euro95 !== null || de.diesel !== null) ? de.bron : "handmatig",
    bronUrl: de?.bronUrl,
  };

  const prijzen: LandPrijs[] = [
    {
      land: "Nederland",
      vlag: "🇳🇱",
      euro95: NL_FALLBACK.euro95,
      diesel: NL_FALLBACK.diesel,
      bron: "handmatig",
    },
    dePrijs,
    {
      land: "België",
      vlag: "🇧🇪",
      euro95: BE_FALLBACK.euro95,
      diesel: BE_FALLBACK.diesel,
      bron: "handmatig",
    },
  ];

  // Status: 'live' als DE live is en we DE hebben, anders 'fallback'
  const combi: FuelPricesResponse["bron"] =
    dePrijs.bron === "Tankerkoenig" ? "live" : "fallback";

  const response: FuelPricesResponse = {
    prijzen,
    bijgewerkt: new Date(timestamp).toISOString(),
    bron: combi,
  };

  if (debugMode) {
    response.debug = {
      tankerkoenigKeyAanwezig: !!apiKey,
      de: de?.debug ?? (apiKey ? "haalDuitsePrijzen returned null" : "geen API key"),
      nl: "geen live bron, handmatige prijzen",
      be: "geen live bron, handmatige prijzen",
    };
  }

  return NextResponse.json(response);
}
