import { NextRequest, NextResponse } from "next/server";
import {
  haalNederlandsePrijzen,
  haalBelgischePrijzen,
  haalDuitsePrijzen,
} from "./sources";

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
  bron: "live" | "cache" | "fallback";
  debug?: unknown;
};

const NL_FALLBACK = { euro95: 2.15, diesel: 1.79 };
const DE_FALLBACK = { euro95: 1.73, diesel: 1.60 };
const BE_FALLBACK = { euro95: 1.81, diesel: 1.68 };

export async function GET(request: NextRequest) {
  const timestamp = Date.now();
  const debugMode = request.nextUrl.searchParams.get("debug") === "1";

  const apiKey = process.env.TANKERKOENIG_API_KEY;
  const [nl, be, de] = await Promise.all([
    haalNederlandsePrijzen(),
    haalBelgischePrijzen(),
    apiKey ? haalDuitsePrijzen(apiKey) : Promise.resolve(null),
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

  const alleLive =
    nl && nl.euro95 !== null &&
    be && be.euro95 !== null &&
    (de ? de.euro95 !== null : !apiKey);
  const geenLive = prijzen.every((p) => p.bron === "handmatig");
  const combi: FuelPricesResponse["bron"] = alleLive
    ? "live"
    : geenLive
      ? "fallback"
      : "cache";

  const response: FuelPricesResponse = {
    prijzen,
    bijgewerkt: new Date(timestamp).toISOString(),
    bron: combi,
  };

  if (debugMode) {
    response.debug = {
      tankerkoenigKeyAanwezig: !!apiKey,
      nl: nl?.debug ?? "haalNederlandsePrijzen returned null",
      be: be?.debug ?? "haalBelgischePrijzen returned null",
      de: de?.debug ?? (apiKey ? "haalDuitsePrijzen returned null" : "geen API key"),
    };
  }

  return NextResponse.json(response);
}
