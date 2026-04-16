import { NextRequest, NextResponse } from "next/server";

/**
 * Route API — berekent echte wegafstand en rijtijd via OSRM.
 *
 * OSRM (Open Source Routing Machine) gebruikt OpenStreetMap-data
 * en geeft dezelfde soort resultaten als Google Maps.
 *
 * Query params:
 *   postcode — Nederlandse postcode (bijv. "1234AB")
 *
 * Retourneert dichtstbijzijnde grensbestemming per land (DE + BE)
 * met echte wegafstand en rijtijd.
 *
 * Fallback naar haversine × 1.3 als OSRM niet bereikbaar is.
 */

export const revalidate = 86400; // Cache 24 uur — routes veranderen zelden

// ─── Coördinaten per postcode-prefix (eerste 2 cijfers) ───

type Coordinaat = { lat: number; lng: number };

const POSTCODE_COORDINATEN: Record<string, Coordinaat> = {
  "10": { lat: 52.37, lng: 4.89 },
  "11": { lat: 52.36, lng: 4.87 },
  "12": { lat: 52.33, lng: 4.86 },
  "13": { lat: 52.4, lng: 4.84 },
  "14": { lat: 52.42, lng: 4.83 },
  "15": { lat: 52.53, lng: 4.8 },
  "16": { lat: 52.45, lng: 4.65 },
  "17": { lat: 52.63, lng: 4.75 },
  "18": { lat: 52.7, lng: 5.05 },
  "19": { lat: 52.52, lng: 4.95 },
  "20": { lat: 51.92, lng: 4.48 },
  "21": { lat: 51.87, lng: 4.5 },
  "22": { lat: 51.89, lng: 4.47 },
  "23": { lat: 51.93, lng: 4.45 },
  "24": { lat: 51.95, lng: 4.55 },
  "25": { lat: 51.92, lng: 4.42 },
  "26": { lat: 51.97, lng: 4.36 },
  "27": { lat: 51.85, lng: 4.65 },
  "28": { lat: 51.82, lng: 4.64 },
  "29": { lat: 51.82, lng: 4.55 },
  "30": { lat: 52.08, lng: 4.28 },
  "31": { lat: 52.05, lng: 4.32 },
  "32": { lat: 52.12, lng: 4.28 },
  "33": { lat: 52.04, lng: 4.35 },
  "34": { lat: 52.16, lng: 4.49 },
  "35": { lat: 52.17, lng: 4.47 },
  "36": { lat: 52.06, lng: 4.5 },
  "37": { lat: 52.0, lng: 4.37 },
  "38": { lat: 52.08, lng: 4.32 },
  "39": { lat: 52.16, lng: 4.45 },
  "40": { lat: 51.59, lng: 4.78 },
  "41": { lat: 51.55, lng: 4.47 },
  "42": { lat: 51.48, lng: 3.61 },
  "43": { lat: 51.5, lng: 3.6 },
  "44": { lat: 51.44, lng: 3.57 },
  "45": { lat: 51.58, lng: 3.77 },
  "46": { lat: 51.65, lng: 3.83 },
  "47": { lat: 51.6, lng: 4.73 },
  "48": { lat: 51.59, lng: 4.78 },
  "49": { lat: 51.57, lng: 4.97 },
  "50": { lat: 51.44, lng: 5.47 },
  "51": { lat: 51.5, lng: 5.07 },
  "52": { lat: 51.69, lng: 5.3 },
  "53": { lat: 51.43, lng: 5.48 },
  "54": { lat: 51.46, lng: 5.51 },
  "55": { lat: 51.44, lng: 5.63 },
  "56": { lat: 51.42, lng: 5.46 },
  "57": { lat: 51.45, lng: 5.7 },
  "58": { lat: 51.45, lng: 5.48 },
  "59": { lat: 51.48, lng: 5.4 },
  "60": { lat: 51.98, lng: 5.91 },
  "61": { lat: 51.97, lng: 5.95 },
  "62": { lat: 51.85, lng: 5.87 },
  "63": { lat: 51.84, lng: 5.86 },
  "64": { lat: 51.96, lng: 5.83 },
  "65": { lat: 51.82, lng: 5.86 },
  "66": { lat: 52.0, lng: 6.03 },
  "67": { lat: 52.22, lng: 6.15 },
  "68": { lat: 52.01, lng: 6.24 },
  "69": { lat: 52.06, lng: 5.98 },
  "70": { lat: 52.52, lng: 6.08 },
  "71": { lat: 52.48, lng: 6.25 },
  "72": { lat: 52.53, lng: 6.09 },
  "73": { lat: 52.24, lng: 6.17 },
  "74": { lat: 52.43, lng: 6.45 },
  "75": { lat: 52.35, lng: 6.67 },
  "76": { lat: 52.75, lng: 6.5 },
  "77": { lat: 52.73, lng: 6.6 },
  "78": { lat: 52.51, lng: 6.08 },
  "79": { lat: 52.42, lng: 6.11 },
  "80": { lat: 52.22, lng: 5.17 },
  "81": { lat: 52.16, lng: 5.38 },
  "82": { lat: 52.39, lng: 5.27 },
  "83": { lat: 52.35, lng: 5.22 },
  "84": { lat: 52.3, lng: 5.17 },
  "85": { lat: 52.51, lng: 5.47 },
  "86": { lat: 52.53, lng: 5.72 },
  "87": { lat: 52.63, lng: 5.92 },
  "88": { lat: 52.78, lng: 5.7 },
  "89": { lat: 52.52, lng: 5.42 },
  "90": { lat: 53.22, lng: 6.57 },
  "91": { lat: 53.15, lng: 6.75 },
  "92": { lat: 53.0, lng: 6.55 },
  "93": { lat: 52.95, lng: 6.65 },
  "94": { lat: 53.25, lng: 6.52 },
  "95": { lat: 53.33, lng: 6.25 },
  "96": { lat: 53.2, lng: 5.8 },
  "97": { lat: 52.85, lng: 6.4 },
  "98": { lat: 53.1, lng: 6.56 },
  "99": { lat: 52.77, lng: 6.9 },
};

// ─── Grensbestemmingen ───

type GrensBestemming = {
  land: "Duitsland" | "België";
  naam: string;
  coordinaat: Coordinaat;
};

const GRENSBESTEMMINGEN: GrensBestemming[] = [
  { land: "Duitsland", naam: "Aachen (A4/A76)", coordinaat: { lat: 50.78, lng: 6.08 } },
  { land: "Duitsland", naam: "Venlo (A67)", coordinaat: { lat: 51.37, lng: 6.17 } },
  { land: "Duitsland", naam: "Oldenzaal (A1/A30)", coordinaat: { lat: 52.32, lng: 6.93 } },
  { land: "Duitsland", naam: "Emmen/Meppen (A37)", coordinaat: { lat: 52.72, lng: 7.3 } },
  { land: "Duitsland", naam: "Bunde (A7)", coordinaat: { lat: 53.18, lng: 7.27 } },
  { land: "Duitsland", naam: "Elten (A12)", coordinaat: { lat: 51.87, lng: 6.17 } },
  { land: "België", naam: "Hazeldonk (A16)", coordinaat: { lat: 51.48, lng: 4.63 } },
  { land: "België", naam: "Eijsden (A2)", coordinaat: { lat: 50.78, lng: 5.7 } },
  { land: "België", naam: "Zelzate (A11/N62)", coordinaat: { lat: 51.2, lng: 3.82 } },
  { land: "België", naam: "Lommel (A67/E34)", coordinaat: { lat: 51.23, lng: 5.31 } },
];

// ─── Response type ───

export type RouteResponse = {
  routes: RouteResultaat[];
  bron: "osrm" | "schatting";
};

type RouteResultaat = {
  land: "Duitsland" | "België";
  bestemming: string;
  afstandEnkel: number;
  afstandRetour: number;
  rijtijdMinuten: number;
};

// ─── Haversine fallback ───

function haversineKm(a: Coordinaat, b: Coordinaat): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function fallbackRoutes(origin: Coordinaat): RouteResultaat[] {
  const result: RouteResultaat[] = [];

  for (const land of ["Duitsland", "België"] as const) {
    const bestemmingen = GRENSBESTEMMINGEN.filter((g) => g.land === land);
    let dichtstbij = bestemmingen[0];
    let minAfstand = Infinity;

    for (const b of bestemmingen) {
      const afstand = haversineKm(origin, b.coordinaat);
      if (afstand < minAfstand) {
        minAfstand = afstand;
        dichtstbij = b;
      }
    }

    const wegAfstand = Math.round(minAfstand * 1.3);
    const retour = wegAfstand * 2;
    const rijtijd = Math.round((retour / 80) * 60);

    result.push({
      land,
      bestemming: dichtstbij.naam,
      afstandEnkel: wegAfstand,
      afstandRetour: retour,
      rijtijdMinuten: rijtijd,
    });
  }

  return result.sort((a, b) => a.afstandEnkel - b.afstandEnkel);
}

// ─── OSRM Table API ───

async function osrmRoutes(origin: Coordinaat): Promise<RouteResultaat[] | null> {
  // OSRM table API: bron op index 0, bestemmingen op index 1..N
  // coordinates = lng,lat;lng,lat;...
  const coords = [
    `${origin.lng},${origin.lat}`,
    ...GRENSBESTEMMINGEN.map((b) => `${b.coordinaat.lng},${b.coordinaat.lat}`),
  ].join(";");

  const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=distance,duration`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Grenspret/1.0 (grenspret.nl)" },
      next: { revalidate: 86400 },
    });

    clearTimeout(timer);

    if (!res.ok) return null;

    const data = await res.json();
    if (data.code !== "Ok") return null;

    // data.distances[0] = afstanden van bron naar elke bestemming (in meters)
    // data.durations[0] = rijtijden van bron naar elke bestemming (in seconden)
    const distances: number[] = data.distances[0]; // [0] = bron→bron, [1..N] = bron→bestemmingen
    const durations: number[] = data.durations[0];

    const result: RouteResultaat[] = [];

    for (const land of ["Duitsland", "België"] as const) {
      let bestIndex = -1;
      let bestDistance = Infinity;

      for (let i = 0; i < GRENSBESTEMMINGEN.length; i++) {
        if (GRENSBESTEMMINGEN[i].land !== land) continue;
        const dist = distances[i + 1]; // +1 omdat index 0 = bron zelf
        if (dist !== null && dist < bestDistance) {
          bestDistance = dist;
          bestIndex = i;
        }
      }

      if (bestIndex === -1) continue;

      const afstandEnkel = Math.round(bestDistance / 1000); // meters → km
      const rijtijdEnkel = durations[bestIndex + 1]; // seconden

      result.push({
        land,
        bestemming: GRENSBESTEMMINGEN[bestIndex].naam,
        afstandEnkel,
        afstandRetour: afstandEnkel * 2,
        rijtijdMinuten: Math.round((rijtijdEnkel * 2) / 60), // retour in minuten
      });
    }

    return result.sort((a, b) => a.afstandEnkel - b.afstandEnkel);
  } catch {
    return null;
  }
}

// ─── GET handler ───

export async function GET(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get("postcode") ?? "";
  const prefix = postcode.replace(/\s/g, "").slice(0, 2);
  const origin = POSTCODE_COORDINATEN[prefix];

  if (!origin) {
    return NextResponse.json(
      { error: "Onbekende postcode" },
      { status: 400 },
    );
  }

  // Probeer OSRM, val terug op haversine-schatting
  const osrmResult = await osrmRoutes(origin);

  if (osrmResult && osrmResult.length > 0) {
    return NextResponse.json({
      routes: osrmResult,
      bron: "osrm",
    } satisfies RouteResponse);
  }

  return NextResponse.json({
    routes: fallbackRoutes(origin),
    bron: "schatting",
  } satisfies RouteResponse);
}
