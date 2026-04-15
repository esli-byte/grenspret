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
//  Tabel 80416NED: "Pompprijzen motorbrandstoffen; brandstofsoort, per dag"
//  Dagelijkse landelijke pompprijzen voor Euro95, Diesel en LPG,
//  inclusief BTW en accijns. Gepubliceerd 1× per week door het CBS.
//
//  Structuur: rijen met (BrandstofSoorten, Perioden, Pompprijs_1).
//  We halen recente rijen op en zoeken Euro95 + Diesel via metadata.
// ═══════════════════════════════════════════════════════════

const CBS_TABLE = "80416NED";
const CBS_BASE = `https://opendata.cbs.nl/ODataApi/odata/${CBS_TABLE}`;

type CbsRow = Record<string, unknown>;
type CbsCategoryEntry = { Key: string; Title: string };

async function cbsFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${CBS_BASE}${path}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as T;
  } catch {
    return null;
  }
}

export async function haalNederlandsePrijzen(): Promise<PrijsBron | null> {
  // Stap 1: ontdek welke BrandstofSoorten codes we nodig hebben
  const categorieenUrl = "/BrandstofSoorten";
  const categorieen = await cbsFetch<{ value: CbsCategoryEntry[] }>(
    categorieenUrl,
  );
  if (!categorieen?.value) {
    return {
      euro95: null,
      diesel: null,
      bron: "CBS",
      debug: { url: CBS_BASE + categorieenUrl, error: "kon BrandstofSoorten niet ophalen" },
    };
  }

  function findKey(zoek: RegExp): string | null {
    const match = categorieen.value.find((c) => zoek.test(c.Title));
    return match?.Key ?? null;
  }

  const euro95Key = findKey(/Euro\s*95|Benzine.*95/i);
  const dieselKey = findKey(/Diesel/i);

  if (!euro95Key && !dieselKey) {
    return {
      euro95: null,
      diesel: null,
      bron: "CBS",
      debug: {
        url: CBS_BASE + categorieenUrl,
        error: "geen Euro95 of Diesel categorie",
        matched: {
          eersteCategorieen: categorieen.value
            .slice(0, 5)
            .map((c) => `${c.Key}=${c.Title}`)
            .join("; "),
        },
      },
    };
  }

  // Stap 2: haal de meest recente rij op voor elke gewenste brandstof
  async function laatstePrijs(brandstofKey: string): Promise<{ prijs: number; periode: string } | null> {
    const url = `/TypedDataSet?$filter=BrandstofSoorten eq '${brandstofKey}'&$orderby=Perioden desc&$top=1`;
    const data = await cbsFetch<{ value: CbsRow[] }>(url);
    if (!data?.value?.[0]) return null;
    const row = data.value[0];

    // Zoek het prijsveld — meestal "Pompprijs_1" maar kan variëren
    let prijsCenten: number | null = null;
    for (const [key, val] of Object.entries(row)) {
      if (
        /pompprijs/i.test(key) &&
        typeof val === "number" &&
        val > 30 &&
        val < 500
      ) {
        prijsCenten = val;
        break;
      }
    }
    if (prijsCenten === null) return null;

    return {
      prijs: Math.round((prijsCenten / 100) * 1000) / 1000,
      periode: typeof row.Perioden === "string" ? row.Perioden : "",
    };
  }

  const [euro95Result, dieselResult] = await Promise.all([
    euro95Key ? laatstePrijs(euro95Key) : Promise.resolve(null),
    dieselKey ? laatstePrijs(dieselKey) : Promise.resolve(null),
  ]);

  if (!euro95Result && !dieselResult) {
    return {
      euro95: null,
      diesel: null,
      bron: "CBS",
      debug: {
        url: CBS_BASE + "/TypedDataSet",
        error: "geen prijs gevonden in TypedDataSet",
        matched: {
          gebruikteKeys: `Euro95=${euro95Key ?? "geen"}, Diesel=${dieselKey ?? "geen"}`,
        },
      },
    };
  }

  return {
    euro95: euro95Result?.prijs ?? null,
    diesel: dieselResult?.prijs ?? null,
    bron: "CBS",
    bronUrl: "https://opendata.cbs.nl",
    debug: {
      url: CBS_BASE,
      matched: {
        euro95: euro95Result ? `${euro95Result.periode}` : undefined,
        diesel: dieselResult ? `${dieselResult.periode}` : undefined,
      },
    },
  };
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
