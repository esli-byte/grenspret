import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * Brandstofprijzen API
 *
 * Haalt prijzen op uit:
 * - Tankerkoenig API (Duitsland) — vereist TANKERKOENIG_API_KEY env var
 * - Hardcoded NL/BE gemiddelden (handmatig bijgewerkt)
 *
 * Cached in .cache/fuel-prices.json, max 1× per uur vernieuwd.
 */

export type FuelPricesResponse = {
  prijzen: LandPrijs[];
  bijgewerkt: string;
  bron: "live" | "cache" | "fallback";
};

type LandPrijs = {
  land: string;
  vlag: string;
  euro95: number;
  diesel: number;
};

// Fallback / handmatige NL & BE prijzen (realistisch per april 2025)
const NL_PRIJZEN: LandPrijs = {
  land: "Nederland",
  vlag: "🇳🇱",
  euro95: 2.15,
  diesel: 1.75,
};

const BE_PRIJZEN: LandPrijs = {
  land: "België",
  vlag: "🇧🇪",
  euro95: 1.78,
  diesel: 1.65,
};

const DE_FALLBACK: LandPrijs = {
  land: "Duitsland",
  vlag: "🇩🇪",
  euro95: 1.72,
  diesel: 1.58,
};

const CACHE_DIR = join(process.cwd(), ".cache");
const CACHE_FILE = join(CACHE_DIR, "fuel-prices.json");
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 uur

type CacheData = {
  prijzen: LandPrijs[];
  timestamp: number;
};

async function readCache(): Promise<CacheData | null> {
  try {
    const raw = await readFile(CACHE_FILE, "utf-8");
    const data: CacheData = JSON.parse(raw);
    if (Date.now() - data.timestamp < CACHE_MAX_AGE_MS) {
      return data;
    }
    return null; // verlopen
  } catch {
    return null;
  }
}

async function writeCache(data: CacheData) {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(data));
  } catch {
    // Cache schrijven gefaald — niet kritiek
  }
}

/**
 * Haal gemiddelde Duitse brandstofprijzen op via Tankerkoenig.
 * Gebruikt het "list" endpoint voor stations rond een grenslocatie.
 */
async function fetchDuitsePrijzen(
  apiKey: string
): Promise<LandPrijs | null> {
  try {
    // Zoek stations bij Venlo (grensovergang, centraal gelegen)
    // lat=51.37, lng=6.17, rad=5km
    const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=51.37&lng=6.17&rad=10&sort=dist&type=all&apikey=${apiKey}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data.ok || !data.stations || data.stations.length === 0) {
      return null;
    }

    // Bereken gemiddelden van open stations met prijzen
    let e5Total = 0,
      e5Count = 0;
    let dieselTotal = 0,
      dieselCount = 0;

    for (const station of data.stations) {
      if (!station.isOpen) continue;
      if (station.e5 && station.e5 > 0) {
        e5Total += station.e5;
        e5Count++;
      }
      if (station.diesel && station.diesel > 0) {
        dieselTotal += station.diesel;
        dieselCount++;
      }
    }

    if (e5Count === 0 && dieselCount === 0) return null;

    return {
      land: "Duitsland",
      vlag: "🇩🇪",
      euro95: e5Count > 0 ? Math.round((e5Total / e5Count) * 1000) / 1000 : DE_FALLBACK.euro95,
      diesel:
        dieselCount > 0
          ? Math.round((dieselTotal / dieselCount) * 1000) / 1000
          : DE_FALLBACK.diesel,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  // 1. Check cache
  const cached = await readCache();
  if (cached) {
    return NextResponse.json({
      prijzen: cached.prijzen,
      bijgewerkt: new Date(cached.timestamp).toISOString(),
      bron: "cache",
    } satisfies FuelPricesResponse);
  }

  // 2. Probeer live Duitse prijzen
  const apiKey = process.env.TANKERKOENIG_API_KEY;
  let dePrijzen = DE_FALLBACK;
  let bron: FuelPricesResponse["bron"] = "fallback";

  if (apiKey) {
    const live = await fetchDuitsePrijzen(apiKey);
    if (live) {
      dePrijzen = live;
      bron = "live";
    }
  }

  const prijzen: LandPrijs[] = [NL_PRIJZEN, dePrijzen, BE_PRIJZEN];
  const timestamp = Date.now();

  // 3. Cache opslaan
  await writeCache({ prijzen, timestamp });

  return NextResponse.json({
    prijzen,
    bijgewerkt: new Date(timestamp).toISOString(),
    bron,
  } satisfies FuelPricesResponse);
}
