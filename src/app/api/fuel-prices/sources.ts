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
  // Tabel 80416NED structuur (ontdekt via debug):
  // - Eén rij per dag met alle brandstoffen als kolommen
  // - Velden: BenzineEuro95_1, Diesel_2, Lpg_3 (al in euro, niet cents)
  // - Perioden in formaat "YYYYMMDD"
  // - $orderby werkt niet betrouwbaar, dus we filteren op recente datum

  // Bereken een afkapdatum 60 dagen terug
  const nu = new Date();
  const grens = new Date(nu.getTime() - 60 * 24 * 60 * 60 * 1000);
  const grensStr = `${grens.getFullYear()}${String(grens.getMonth() + 1).padStart(2, "0")}${String(grens.getDate()).padStart(2, "0")}`;

  const dataUrl = `/TypedDataSet?$filter=Perioden gt '${grensStr}'&$top=200`;
  const data = await cbsFetch<{ value: CbsRow[] }>(dataUrl);

  if (!data?.value || data.value.length === 0) {
    return {
      euro95: null,
      diesel: null,
      bron: "CBS",
      debug: { url: CBS_BASE + dataUrl, error: "TypedDataSet leeg of niet bereikbaar" },
    };
  }

  // Sorteer op Perioden DESC client-side (CBS $orderby werkt niet altijd)
  const gesorteerd = [...data.value]
    .filter((r) => typeof r.Perioden === "string")
    .sort((a, b) => String(b.Perioden).localeCompare(String(a.Perioden)));

  // Vind de eerste rij waar Euro95 of Diesel een geldige waarde heeft
  let euro95: number | null = null;
  let diesel: number | null = null;
  let periode = "";

  for (const row of gesorteerd) {
    const e95 = row.BenzineEuro95_1;
    const die = row.Diesel_2;
    if (
      typeof e95 === "number" &&
      e95 > 0.5 &&
      e95 < 5 &&
      euro95 === null
    ) {
      euro95 = Math.round(e95 * 1000) / 1000;
      if (!periode) periode = String(row.Perioden);
    }
    if (
      typeof die === "number" &&
      die > 0.5 &&
      die < 5 &&
      diesel === null
    ) {
      diesel = Math.round(die * 1000) / 1000;
      if (!periode) periode = String(row.Perioden);
    }
    if (euro95 !== null && diesel !== null) break;
  }

  if (euro95 === null && diesel === null) {
    return {
      euro95: null,
      diesel: null,
      bron: "CBS",
      debug: {
        url: CBS_BASE + dataUrl,
        error: "geen geldige prijs in recente rijen",
        matched: {
          aantalRijen: String(gesorteerd.length),
          eersteRij: JSON.stringify(gesorteerd[0]).slice(0, 300),
        },
      },
    };
  }

  return {
    euro95,
    diesel,
    bron: "CBS",
    bronUrl: "https://opendata.cbs.nl",
    debug: {
      url: CBS_BASE,
      matched: {
        periode: periode
          ? `${periode.slice(0, 4)}-${periode.slice(4, 6)}-${periode.slice(6, 8)}`
          : undefined,
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════
//  BELGIË — Meerdere bronnen voor maximumprijzen
//
//  Bronnen (in volgorde van betrouwbaarheid):
//  1. Energiafed.be — branchevereniging, publiceeert dagelijks maximumprijzen
//  2. FOD Economie — officiële overheids-pagina (HTML scraping)
//  3. Carbu.com — vergelijkingssite (backup)
//
//  Let op: België heeft twee soorten Euro 95:
//  - E10 (10% ethanol): ~€1.30/L — standaard aan pompen, lage accijns
//  - E5 (5% ethanol):   ~€1.84/L — duurdere oudere variant
//  Wij gebruiken E10 omdat dat de standaard is in België.
//
//  Diesel B7: ~€2.22/L — veel duurder dan in NL verwacht
//
//  We trekken ~€0,03 af van maximumprijs voor realistische pompprijs.
// ═══════════════════════════════════════════════════════════

/**
 * Zoek een prijs in tekst via meerdere regex-patronen.
 * Retourneert de eerste match die binnen [min, max] valt, of null.
 */
function zoekPrijsInTekst(
  tekst: string,
  patronen: RegExp[],
  min: number,
  max: number,
): number | null {
  for (const patroon of patronen) {
    const match = tekst.match(patroon);
    if (match) {
      const prijs = parseFloat(match[1].replace(",", "."));
      if (isFinite(prijs) && prijs >= min && prijs <= max) {
        return prijs;
      }
    }
  }
  return null;
}

export async function haalBelgischePrijzen(): Promise<PrijsBron | null> {
  const debugErrors: string[] = [];

  // ── Bron 1: Energiafed.be maximumprijzen ──
  // Branchevereniging die dagelijks de officiële maximumprijzen publiceert
  try {
    const url = "https://www.energiafed.be/nl/maximumprijzen";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Grenspret/1.0)",
        Accept: "text/html",
        "Accept-Language": "nl-BE,nl;q=0.9",
      },
    });

    if (res.ok) {
      const tekst = await res.text();

      // E10 prijs (de goedkope variant, standaard aan Belgische pompen)
      const euro95 = zoekPrijsInTekst(tekst, [
        /E10[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
        /Super\s*95\s*(?:E10)?[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
        /Benzine[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
        /Euro\s*95[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
      ], 0.80, 2.50);

      // Diesel B7
      const diesel = zoekPrijsInTekst(tekst, [
        /Diesel\s*(?:B7)?[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
        /Gasolie[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
      ], 1.00, 3.50);

      if (euro95 !== null || diesel !== null) {
        const afslag = 0.03;
        return {
          euro95: euro95 !== null ? Math.round((euro95 - afslag) * 1000) / 1000 : null,
          diesel: diesel !== null ? Math.round((diesel - afslag) * 1000) / 1000 : null,
          bron: "Energiafed",
          bronUrl: "https://www.energiafed.be/nl/maximumprijzen",
          debug: { url, httpStatus: res.status, matched: { euro95: euro95?.toString(), diesel: diesel?.toString() } },
        };
      }
      debugErrors.push(`energiafed: HTML geladen maar geen prijzen gevonden`);
    } else {
      debugErrors.push(`energiafed: HTTP ${res.status}`);
    }
  } catch (err) {
    debugErrors.push(`energiafed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Bron 2: FOD Economie officiële pagina ──
  try {
    const url = "https://economie.fgov.be/nl/themas/energie/energieprijzen/maximumprijzen";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Grenspret/1.0)",
        Accept: "text/html,application/json;q=0.9",
        "Accept-Language": "nl-BE,nl;q=0.9",
      },
    });

    if (res.ok) {
      const tekst = await res.text();

      // E10 prijs — specifiek zoeken naar E10 eerst (de goedkope variant)
      const euro95 = zoekPrijsInTekst(tekst, [
        /E10[^0-9]{0,500}?(\d[,.]\d{2,4})/i,
        /Super\s*95[^0-9]{0,500}?(\d[,.]\d{2,4})/i,
        /Euro\s*95[^0-9]{0,500}?(\d[,.]\d{2,4})/i,
        /Benzine\s*95[^0-9]{0,500}?(\d[,.]\d{2,4})/i,
      ], 0.80, 2.50);

      const diesel = zoekPrijsInTekst(tekst, [
        /Diesel[^0-9]{0,500}?(\d[,.]\d{2,4})/i,
        /Gasolie[^0-9]{0,500}?(\d[,.]\d{2,4})/i,
      ], 1.00, 3.50);

      if (euro95 !== null || diesel !== null) {
        const afslag = 0.03;
        return {
          euro95: euro95 !== null ? Math.round((euro95 - afslag) * 1000) / 1000 : null,
          diesel: diesel !== null ? Math.round((diesel - afslag) * 1000) / 1000 : null,
          bron: "FOD Economie",
          bronUrl: "https://economie.fgov.be",
          debug: { url, httpStatus: res.status, matched: { euro95: euro95?.toString(), diesel: diesel?.toString() } },
        };
      }
      debugErrors.push(`FOD: HTML geladen maar geen prijzen gevonden`);
    } else {
      debugErrors.push(`FOD: HTTP ${res.status}`);
    }
  } catch (err) {
    debugErrors.push(`FOD: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Bron 3: Carbu.com E10 pagina ──
  try {
    const url = "https://carbu.com/belgie/index.php/super95E10";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Grenspret/1.0)",
        Accept: "text/html",
        "Accept-Language": "nl-BE,nl;q=0.9",
      },
    });

    if (res.ok) {
      const tekst = await res.text();

      const euro95 = zoekPrijsInTekst(tekst, [
        /maximumprijs[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
        /E10[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
        /Super\s*95[^0-9]{0,200}?(\d[,.]\d{3,4})/i,
        /(\d[,.]\d{3,4})\s*€?\s*\/?\s*(?:liter|L)/i,
      ], 0.80, 2.50);

      if (euro95 !== null) {
        const afslag = 0.03;
        return {
          euro95: Math.round((euro95 - afslag) * 1000) / 1000,
          diesel: null, // Diesel apart ophalen zou een extra request kosten
          bron: "Carbu.com",
          bronUrl: "https://carbu.com/belgie",
          debug: { url, httpStatus: res.status, matched: { euro95: euro95?.toString() } },
        };
      }
      debugErrors.push(`carbu: HTML geladen maar geen prijzen gevonden`);
    } else {
      debugErrors.push(`carbu: HTTP ${res.status}`);
    }
  } catch (err) {
    debugErrors.push(`carbu: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Geen enkele bron leverde data → fallback wordt in route.ts gebruikt
  return {
    euro95: null,
    diesel: null,
    bron: "FOD Economie",
    debug: {
      url: "energiafed + FOD + carbu",
      error: `Alle bronnen gefaald: ${debugErrors.join("; ")}`,
    },
  };
}
