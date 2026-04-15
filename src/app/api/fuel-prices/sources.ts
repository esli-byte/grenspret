/**
 * Brandstofprijzen-bronnen per land.
 *
 * Duitsland: live via Tankerkoenig API (gratis, wettelijk verplichte
 * prijsverstrekking door alle Duitse stations).
 *
 * Nederland en België: op dit moment geen werkbare publieke real-time
 * bron gevonden. We gebruiken handmatig bijgehouden fallback-prijzen
 * in de API-route. Kandidaten voor toekomstige scraping:
 * - UnitedConsumers, CBS Open Data, MAS tankstations voor NL
 * - Statbel, Carbu.com voor BE
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
    matched?: { euro95?: string; diesel?: string };
  };
};

const FETCH_TIMEOUT = 8000;

// ═══════════════════════════════════════════════════════════
//  DUITSLAND — Tankerkoenig API
//  https://creativecommons.tankerkoenig.de/
// ═══════════════════════════════════════════════════════════

export async function haalDuitsePrijzen(
  apiKey: string,
): Promise<PrijsBron | null> {
  // Zoek stations rond Venlo-grens (centraal gelegen voor NL reizigers)
  // rad=10km, alle brandstoffen, gesorteerd op afstand
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
        debug: {
          url: "(key verborgen)",
          httpStatus: res.status,
          error: `HTTP ${res.status}`,
        },
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
