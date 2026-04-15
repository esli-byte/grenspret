/**
 * Scrapers en API-calls voor brandstofprijzen per land.
 * Elke functie retourneert ofwel een { euro95, diesel, bron } object
 * ofwel null bij falen. De API-route combineert de resultaten met
 * fallbacks.
 */

export type PrijsBron = {
  euro95: number | null;
  diesel: number | null;
  bron: string;
  bronUrl?: string;
};

const FETCH_TIMEOUT = 8000;
const COMMON_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; GrensprtBot/1.0; +https://grenspret.nl)",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
};

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: COMMON_HEADERS,
      // Next cache voor 1 uur — verlaagt externe calls flink
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`[fuel] ${url} → ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error(`[fuel] fetch faalde voor ${url}:`, err);
    return null;
  }
}

/**
 * Haal een prijs uit HTML op basis van een label-pattern.
 * Zoekt naar bijv. "Euro 95" gevolgd door een bedrag zoals €1,234 of 1.234
 * binnen een redelijk aantal karakters.
 */
function zoekPrijsInHtml(
  html: string,
  labels: RegExp[],
  maxChars = 300,
): number | null {
  for (const label of labels) {
    const match = html.match(label);
    if (!match || match.index === undefined) continue;

    // Zoek binnen de volgende maxChars naar een prijs-pattern
    const searchRange = html.slice(match.index, match.index + maxChars);
    // Accepteer: €1,234 / €1.234 / 1,234 / 1.234 (drie decimalen standaard voor fuel)
    // Maar ook 2.15 (twee decimalen)
    const prijsMatch = searchRange.match(/(\d[,.]\d{2,3}\d?)/);
    if (!prijsMatch) continue;

    const ruw = prijsMatch[1].replace(",", ".");
    const n = parseFloat(ruw);
    if (!isNaN(n) && n > 0.5 && n < 5) return n;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════
//  NEDERLAND — UnitedConsumers.com
//  Publiceert dagelijks gemiddelde Euro95 en diesel prijzen.
// ═══════════════════════════════════════════════════════════

export async function haalNederlandsePrijzen(): Promise<PrijsBron | null> {
  const url =
    "https://www.unitedconsumers.com/tankstations/actuele-benzineprijzen.aspx";
  const html = await fetchHtml(url);
  if (!html) return null;

  // UnitedConsumers toont "Euro 95" en "Diesel" labels
  const euro95 = zoekPrijsInHtml(html, [
    /Euro\s*95[^0-9]{0,200}?€?\s*/i,
    /Euro95[^0-9]{0,200}?€?\s*/i,
    /\bE5\b[^0-9]{0,200}?€?\s*/i,
  ]);
  const diesel = zoekPrijsInHtml(html, [
    /Diesel[^0-9]{0,200}?€?\s*/i,
  ]);

  if (euro95 === null && diesel === null) return null;

  return {
    euro95,
    diesel,
    bron: "UnitedConsumers",
    bronUrl: "https://www.unitedconsumers.com",
  };
}

// ═══════════════════════════════════════════════════════════
//  BELGIË — FOD Economie (officiële maximumprijzen)
// ═══════════════════════════════════════════════════════════

export async function haalBelgischePrijzen(): Promise<PrijsBron | null> {
  // FOD Economie publiceert max prijzen. We nemen die en trekken
  // een kleine marge af om realistisch markt-gemiddelde te schatten.
  const url =
    "https://economie.fgov.be/nl/themas/energie/energieprijzen/maximumprijzen-op-basis-van";
  const html = await fetchHtml(url);
  if (!html) return null;

  const euro95Max = zoekPrijsInHtml(html, [
    /Euro\s*95[^0-9]{0,300}?€?\s*/i,
    /Benzine\s*95[^0-9]{0,300}?€?\s*/i,
  ]);
  const dieselMax = zoekPrijsInHtml(html, [
    /Diesel[^0-9]{0,300}?€?\s*/i,
    /Gasolie[^0-9]{0,300}?€?\s*/i,
  ]);

  // Werkelijke pomp-prijzen liggen meestal 2-4 cent onder de max
  const afslag = 0.03;

  return {
    euro95: euro95Max !== null ? Math.round((euro95Max - afslag) * 1000) / 1000 : null,
    diesel: dieselMax !== null ? Math.round((dieselMax - afslag) * 1000) / 1000 : null,
    bron: "FOD Economie",
    bronUrl: "https://economie.fgov.be",
  };
}

// ═══════════════════════════════════════════════════════════
//  DUITSLAND — Tankerkoenig API
//  Wettelijk verplicht voor alle Duitse tankstations.
//  API key nodig (gratis, aanvragen op creativecommons.tankerkoenig.de).
// ═══════════════════════════════════════════════════════════

export async function haalDuitsePrijzen(
  apiKey: string,
): Promise<PrijsBron | null> {
  try {
    // Venlo grensovergang, centraal gelegen
    const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=51.37&lng=6.17&rad=10&sort=dist&type=all&apikey=${apiKey}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.ok || !Array.isArray(data.stations) || data.stations.length === 0) {
      return null;
    }

    let e5Total = 0, e5Count = 0;
    let dieselTotal = 0, dieselCount = 0;

    for (const station of data.stations) {
      if (!station.isOpen) continue;
      if (typeof station.e5 === "number" && station.e5 > 0) {
        e5Total += station.e5;
        e5Count++;
      }
      if (typeof station.diesel === "number" && station.diesel > 0) {
        dieselTotal += station.diesel;
        dieselCount++;
      }
    }

    return {
      euro95: e5Count > 0 ? Math.round((e5Total / e5Count) * 1000) / 1000 : null,
      diesel:
        dieselCount > 0
          ? Math.round((dieselTotal / dieselCount) * 1000) / 1000
          : null,
      bron: "Tankerkoenig",
      bronUrl: "https://creativecommons.tankerkoenig.de",
    };
  } catch (err) {
    console.error("[fuel] Tankerkoenig faalde:", err);
    return null;
  }
}
