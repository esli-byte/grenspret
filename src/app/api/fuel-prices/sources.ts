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
  // Haal de laatste 30 dagen aan rijen op (3 brandstoffen × ~10 dagen)
  // Daaruit destilleren we euro95 en diesel
  const dataUrl = "/TypedDataSet?$orderby=Perioden desc&$top=30";
  const data = await cbsFetch<{ value: CbsRow[] }>(dataUrl);

  if (!data?.value || data.value.length === 0) {
    return {
      euro95: null,
      diesel: null,
      bron: "CBS",
      debug: { url: CBS_BASE + dataUrl, error: "TypedDataSet leeg of niet bereikbaar" },
    };
  }

  // Eerst proberen we de BrandstofSoorten metadata, maar dat is niet kritiek
  const categorieen = await cbsFetch<{ value: CbsCategoryEntry[] }>("/BrandstofSoorten");
  const codeNaarLabel = new Map<string, string>();
  if (categorieen?.value) {
    for (const c of categorieen.value) {
      codeNaarLabel.set(c.Key, c.Title);
    }
  }

  // Loop door de rijen, gegroepeerd op BrandstofSoorten code
  // Pak de eerste euro95 en diesel match die we tegenkomen (= meest recent)
  let euro95Prijs: number | null = null;
  let dieselPrijs: number | null = null;
  let euro95Periode = "";
  let dieselPeriode = "";
  const ontdekteCodes = new Set<string>();

  function rowToPrice(row: CbsRow): number | null {
    for (const [key, val] of Object.entries(row)) {
      if (
        /pompprijs|prijs/i.test(key) &&
        typeof val === "number" &&
        val > 30 &&
        val < 500
      ) {
        return Math.round((val / 100) * 1000) / 1000;
      }
    }
    return null;
  }

  for (const row of data.value) {
    const code = typeof row.BrandstofSoorten === "string" ? row.BrandstofSoorten.trim() : "";
    if (!code) continue;
    ontdekteCodes.add(code);

    const label = codeNaarLabel.get(code) ?? "";
    const isEuro95 = /euro\s*95|benzine.*95|^001$/i.test(label) || /^A0?11694$/i.test(code);
    const isDiesel = /diesel/i.test(label) || /^002$/i.test(code) || /^A0?11695$/i.test(code);

    if (isEuro95 && euro95Prijs === null) {
      const prijs = rowToPrice(row);
      if (prijs !== null) {
        euro95Prijs = prijs;
        euro95Periode = typeof row.Perioden === "string" ? row.Perioden : "";
      }
    }
    if (isDiesel && dieselPrijs === null) {
      const prijs = rowToPrice(row);
      if (prijs !== null) {
        dieselPrijs = prijs;
        dieselPeriode = typeof row.Perioden === "string" ? row.Perioden : "";
      }
    }
    if (euro95Prijs !== null && dieselPrijs !== null) break;
  }

  if (euro95Prijs === null && dieselPrijs === null) {
    return {
      euro95: null,
      diesel: null,
      bron: "CBS",
      debug: {
        url: CBS_BASE + dataUrl,
        error: "geen Euro95 of Diesel rij gevonden",
        matched: {
          ontdekteCodes: Array.from(ontdekteCodes).slice(0, 5).join(","),
          metadataGevonden: codeNaarLabel.size > 0 ? "ja" : "nee",
          eersteRij: JSON.stringify(data.value[0]).slice(0, 200),
        },
      },
    };
  }

  return {
    euro95: euro95Prijs,
    diesel: dieselPrijs,
    bron: "CBS",
    bronUrl: "https://opendata.cbs.nl",
    debug: {
      url: CBS_BASE,
      matched: {
        euro95: euro95Periode || undefined,
        diesel: dieselPeriode || undefined,
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
