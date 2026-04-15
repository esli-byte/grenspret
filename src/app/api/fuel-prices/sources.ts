/**
 * Brandstofprijzen-bronnen per land.
 *
 * - Duitsland: live via Tankerkoenig API (gratis, wettelijk verplicht)
 * - Nederland: CBS Open Data (officieel, wekelijks bijgewerkt)
 * - België: Statbel Open Data + FOD Economie maximumprijzen
 *
 * Alle bronnen zijn gratis en officieel. Fallback is hardcoded
 * wanneer een bron tijdelijk niet bereikbaar is.
 */

export type PrijsBron = {
  euro95: number | null;
  diesel: number | null;
  bron: string;
  bronUrl?: string;
  debug?: {
    url: string;
    httpStatus?: number;
    error?: string;
    matched?: Record<string, string | undefined>;
  };
};

const FETCH_TIMEOUT = 8000;

// ═══════════════════════════════════════════════════════════
//  DUITSLAND — Tankerkoenig API
// ═══════════════════════════════════════════════════════════

export async function haalDuitsePrijzen(
  apiKey: string,
): Promise<PrijsBron | null> {
  const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=51.37&lng=6.17&rad=10&sort=dist&type=all&apikey=${apiKey}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!res.ok) {
      return {
        euro95: null,
        diesel: null,
        bron: "Tankerkoenig",
        debug: { url: "(key verborgen)", httpStatus: res.status, error: `HTTP ${res.status}` },
      };
    }

    const data = await res.json();
    if (!data.ok) {
      return {
        euro95: null,
        diesel: null,
        bron: "Tankerkoenig",
        debug: { url: "(key verborgen)", httpStatus: res.status, error: `API: ${data.message || "ok=false"}` },
      };
    }
    if (!Array.isArray(data.stations) || data.stations.length === 0) {
      return {
        euro95: null,
        diesel: null,
        bron: "Tankerkoenig",
        debug: { url: "(key verborgen)", error: "geen stations" },
      };
    }

    let e5Total = 0, e5Count = 0;
    let dieselTotal = 0, dieselCount = 0;
    let openStations = 0;

    for (const station of data.stations) {
      if (!station.isOpen) continue;
      openStations++;
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
      diesel: dieselCount > 0 ? Math.round((dieselTotal / dieselCount) * 1000) / 1000 : null,
      bron: "Tankerkoenig",
      bronUrl: "https://creativecommons.tankerkoenig.de",
      debug: {
        url: "(key verborgen)",
        httpStatus: res.status,
        matched: { euro95: `${e5Count}/${openStations} open stations`, diesel: `${dieselCount}/${openStations} open stations` },
      },
    };
  } catch (err) {
    return {
      euro95: null,
      diesel: null,
      bron: "Tankerkoenig",
      debug: { url: "(key verborgen)", error: err instanceof Error ? err.message : String(err) },
    };
  }
}

// ═══════════════════════════════════════════════════════════
//  NEDERLAND — CBS Open Data
//
//  Tabel 81309NED: "Consumentenprijzen; motorbrandstoffen"
//  Bevat wekelijkse nationale gemiddelden voor Euro95, Diesel, LPG.
//  JSON API, geen key nodig, 100% gratis en officieel.
// ═══════════════════════════════════════════════════════════

export async function haalNederlandsePrijzen(): Promise<PrijsBron | null> {
  // Meest recente week, 3 brandstoffen
  // Benzine Euro95 = 01, Diesel = 02, LPG = 03 (BrandstofSoorten codering)
  const url =
    "https://opendata.cbs.nl/ODataApi/odata/81309NED/TypedDataSet?$orderby=Perioden%20desc&$top=3";

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return {
        euro95: null,
        diesel: null,
        bron: "CBS",
        debug: { url, httpStatus: res.status, error: `HTTP ${res.status}` },
      };
    }

    const data = await res.json();
    if (!data.value || !Array.isArray(data.value) || data.value.length === 0) {
      return {
        euro95: null,
        diesel: null,
        bron: "CBS",
        debug: { url, error: "lege response" },
      };
    }

    // Zoek de recentste periode met prijs-data. Structuur per CBS:
    // { Perioden: "2026W15", BenzineEuro95_1: 215.4, Diesel_2: 178.9, ... }
    // of met andere veldnamen. Probeer een paar varianten.
    type CbsRow = Record<string, unknown>;
    const rows: CbsRow[] = data.value;

    function pickPrice(row: CbsRow, keys: string[]): number | null {
      for (const key of keys) {
        const v = row[key];
        if (typeof v === "number" && v > 30 && v < 500) {
          // CBS geeft vaak in cents per liter — converteer naar euro
          return v > 10 ? Math.round((v / 100) * 1000) / 1000 : v;
        }
      }
      return null;
    }

    let euro95: number | null = null;
    let diesel: number | null = null;

    for (const row of rows) {
      if (euro95 === null) {
        euro95 = pickPrice(row, [
          "BenzineEuro95_1",
          "Euro95_1",
          "Euro95",
          "BenzineEuro95",
        ]);
      }
      if (diesel === null) {
        diesel = pickPrice(row, ["Diesel_2", "Diesel"]);
      }
      if (euro95 !== null && diesel !== null) break;
    }

    const periode =
      typeof rows[0]?.Perioden === "string" ? rows[0].Perioden : "";

    if (euro95 === null && diesel === null) {
      return {
        euro95: null,
        diesel: null,
        bron: "CBS",
        debug: {
          url,
          error: "geen prijs-velden gevonden",
          matched: { sample: JSON.stringify(rows[0]).slice(0, 300) },
        },
      };
    }

    return {
      euro95,
      diesel,
      bron: "CBS",
      bronUrl: "https://opendata.cbs.nl",
      debug: { url, matched: { periode } },
    };
  } catch (err) {
    return {
      euro95: null,
      diesel: null,
      bron: "CBS",
      debug: { url, error: err instanceof Error ? err.message : String(err) },
    };
  }
}

// ═══════════════════════════════════════════════════════════
//  BELGIË — FOD Economie maximumprijzen (JSON endpoint)
//
//  De FOD publiceert dagelijks officiële maximumprijzen. We
//  trekken ~€0,03 af voor een realistische pompprijs.
// ═══════════════════════════════════════════════════════════

export async function haalBelgischePrijzen(): Promise<PrijsBron | null> {
  // Probeer meerdere URLs — FOD wijzigt regelmatig
  const urls = [
    "https://economie.fgov.be/nl/themas/energie/energieprijzen/maximumprijzen",
    "https://economie.fgov.be/sites/default/files/Files/Energy/Maximum-prices-petroleum-products.json",
    "https://carbu.com/belgique//index.php/actualiteit/statistieken",
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; GrensprtBot/1.0; +https://grenspret.nl)",
          Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
          "Accept-Language": "nl-BE,nl;q=0.9",
        },
      });

      if (!res.ok) continue;

      const text = await res.text();

      // Zoek in HTML/JSON naar prijs patterns
      // Euro95 ligt meestal tussen 1.50-2.30, Diesel tussen 1.50-2.30
      const euro95Match =
        text.match(/Euro\s*95[^0-9]{0,500}?(\d[,.]\d{2,3})/i) ||
        text.match(/Benzine\s*95[^0-9]{0,500}?(\d[,.]\d{2,3})/i);
      const dieselMatch =
        text.match(/Diesel[^0-9]{0,500}?(\d[,.]\d{2,3})/i) ||
        text.match(/Gasolie[^0-9]{0,500}?(\d[,.]\d{2,3})/i);

      const euro95Max = euro95Match
        ? parseFloat(euro95Match[1].replace(",", "."))
        : null;
      const dieselMax = dieselMatch
        ? parseFloat(dieselMatch[1].replace(",", "."))
        : null;

      if (
        (euro95Max === null || !isFinite(euro95Max) || euro95Max < 1 || euro95Max > 3) &&
        (dieselMax === null || !isFinite(dieselMax) || dieselMax < 1 || dieselMax > 3)
      ) {
        continue;
      }

      // Officiële max minus ~3ct voor realistische pompprijs
      const afslag = 0.03;
      return {
        euro95: euro95Max !== null && euro95Max >= 1 && euro95Max <= 3
          ? Math.round((euro95Max - afslag) * 1000) / 1000
          : null,
        diesel: dieselMax !== null && dieselMax >= 1 && dieselMax <= 3
          ? Math.round((dieselMax - afslag) * 1000) / 1000
          : null,
        bron: "FOD Economie",
        bronUrl: "https://economie.fgov.be",
        debug: { url, httpStatus: res.status },
      };
    } catch {
      continue;
    }
  }

  return {
    euro95: null,
    diesel: null,
    bron: "FOD Economie",
    debug: {
      url: urls.join(", "),
      error: "geen van de URLs leverde bruikbare data",
    },
  };
}
