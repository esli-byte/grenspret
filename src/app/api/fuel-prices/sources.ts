/**
 * Scrapers en API-calls voor brandstofprijzen per land.
 */

export type PrijsBron = {
  euro95: number | null;
  diesel: number | null;
  bron: string;
  bronUrl?: string;
  // Debug velden (alleen gebruikt bij ?debug=1)
  debug?: {
    url: string;
    httpStatus?: number;
    error?: string;
    htmlPreview?: string;
    matched?: { euro95?: string; diesel?: string };
  };
};

const FETCH_TIMEOUT = 8000;
const COMMON_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
};

async function fetchHtml(
  url: string,
): Promise<{ html: string; status: number } | { error: string; status: number }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: COMMON_HEADERS,
    });
    if (!res.ok) {
      return { error: `HTTP ${res.status}`, status: res.status };
    }
    const html = await res.text();
    return { html, status: res.status };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : String(err),
      status: 0,
    };
  }
}

function zoekPrijsInHtml(
  html: string,
  labels: RegExp[],
  maxChars = 500,
): { prijs: number | null; matched: string | null } {
  for (const label of labels) {
    const match = html.match(label);
    if (!match || match.index === undefined) continue;

    const searchRange = html.slice(match.index, match.index + maxChars);
    const prijsMatch = searchRange.match(/(\d[,.]\d{2,3}\d?)/);
    if (!prijsMatch) continue;

    const ruw = prijsMatch[1].replace(",", ".");
    const n = parseFloat(ruw);
    if (!isNaN(n) && n > 0.5 && n < 5) {
      return { prijs: n, matched: match[0].slice(0, 60) };
    }
  }
  return { prijs: null, matched: null };
}

// ═══════════════════════════════════════════════════════════
//  NEDERLAND — UnitedConsumers.com
// ═══════════════════════════════════════════════════════════

export async function haalNederlandsePrijzen(): Promise<PrijsBron | null> {
  const url =
    "https://www.unitedconsumers.com/tankstations/actuele-benzineprijzen.aspx";
  const result = await fetchHtml(url);

  if ("error" in result) {
    return {
      euro95: null,
      diesel: null,
      bron: "UnitedConsumers",
      debug: { url, httpStatus: result.status, error: result.error },
    };
  }

  const euro95Result = zoekPrijsInHtml(result.html, [
    /Euro\s*95[^0-9]{0,200}?€?\s*/i,
    /Euro95[^0-9]{0,200}?€?\s*/i,
    /\bE5\b[^0-9]{0,200}?€?\s*/i,
  ]);
  const dieselResult = zoekPrijsInHtml(result.html, [
    /Diesel[^0-9]{0,200}?€?\s*/i,
  ]);

  if (euro95Result.prijs === null && dieselResult.prijs === null) {
    return {
      euro95: null,
      diesel: null,
      bron: "UnitedConsumers",
      debug: {
        url,
        httpStatus: result.status,
        error: "geen prijs gevonden in HTML",
        htmlPreview: result.html.slice(0, 500),
      },
    };
  }

  return {
    euro95: euro95Result.prijs,
    diesel: dieselResult.prijs,
    bron: "UnitedConsumers",
    bronUrl: "https://www.unitedconsumers.com",
    debug: {
      url,
      httpStatus: result.status,
      matched: {
        euro95: euro95Result.matched ?? undefined,
        diesel: dieselResult.matched ?? undefined,
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════
//  BELGIË — FOD Economie
// ═══════════════════════════════════════════════════════════

export async function haalBelgischePrijzen(): Promise<PrijsBron | null> {
  const url =
    "https://economie.fgov.be/nl/themas/energie/energieprijzen/maximumprijzen-op-basis-van";
  const result = await fetchHtml(url);

  if ("error" in result) {
    return {
      euro95: null,
      diesel: null,
      bron: "FOD Economie",
      debug: { url, httpStatus: result.status, error: result.error },
    };
  }

  const euro95Result = zoekPrijsInHtml(result.html, [
    /Euro\s*95[^0-9]{0,300}?€?\s*/i,
    /Benzine\s*95[^0-9]{0,300}?€?\s*/i,
  ]);
  const dieselResult = zoekPrijsInHtml(result.html, [
    /Diesel[^0-9]{0,300}?€?\s*/i,
    /Gasolie[^0-9]{0,300}?€?\s*/i,
  ]);

  const afslag = 0.03;
  const euro95 =
    euro95Result.prijs !== null
      ? Math.round((euro95Result.prijs - afslag) * 1000) / 1000
      : null;
  const diesel =
    dieselResult.prijs !== null
      ? Math.round((dieselResult.prijs - afslag) * 1000) / 1000
      : null;

  if (euro95 === null && diesel === null) {
    return {
      euro95: null,
      diesel: null,
      bron: "FOD Economie",
      debug: {
        url,
        httpStatus: result.status,
        error: "geen prijs gevonden in HTML",
        htmlPreview: result.html.slice(0, 500),
      },
    };
  }

  return {
    euro95,
    diesel,
    bron: "FOD Economie",
    bronUrl: "https://economie.fgov.be",
    debug: {
      url,
      httpStatus: result.status,
      matched: {
        euro95: euro95Result.matched ?? undefined,
        diesel: dieselResult.matched ?? undefined,
      },
    },
  };
}

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
        debug: {
          url: "(key verborgen)",
          httpStatus: res.status,
          error: `API ok=false, message=${data.message || "onbekend"}`,
        },
      };
    }
    if (!Array.isArray(data.stations) || data.stations.length === 0) {
      return {
        euro95: null,
        diesel: null,
        bron: "Tankerkoenig",
        debug: {
          url: "(key verborgen)",
          httpStatus: res.status,
          error: "geen stations teruggekregen",
        },
      };
    }

    let e5Total = 0,
      e5Count = 0;
    let dieselTotal = 0,
      dieselCount = 0;
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
      euro95:
        e5Count > 0 ? Math.round((e5Total / e5Count) * 1000) / 1000 : null,
      diesel:
        dieselCount > 0
          ? Math.round((dieselTotal / dieselCount) * 1000) / 1000
          : null,
      bron: "Tankerkoenig",
      bronUrl: "https://creativecommons.tankerkoenig.de",
      debug: {
        url: "(key verborgen)",
        httpStatus: res.status,
        matched: {
          euro95: `${e5Count} van ${openStations} open stations`,
          diesel: `${dieselCount} van ${openStations} open stations`,
        },
      },
    };
  } catch (err) {
    return {
      euro95: null,
      diesel: null,
      bron: "Tankerkoenig",
      debug: {
        url: "(key verborgen)",
        error: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
