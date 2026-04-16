/**
 * Geschatte afstand van Nederlandse postcode naar dichtstbijzijnde
 * grenstankstation in Duitsland en België, op basis van postcode-prefix.
 */

type Coordinaat = { lat: number; lng: number };

/** Benadering centrum per postcode-prefix (eerste 2 cijfers) */
const POSTCODE_COORDINATEN: Record<string, Coordinaat> = {
  "10": { lat: 52.37, lng: 4.89 }, // Amsterdam centrum
  "11": { lat: 52.36, lng: 4.87 },
  "12": { lat: 52.33, lng: 4.86 },
  "13": { lat: 52.4, lng: 4.84 },
  "14": { lat: 52.42, lng: 4.83 },
  "15": { lat: 52.53, lng: 4.8 },
  "16": { lat: 52.45, lng: 4.65 },
  "17": { lat: 52.63, lng: 4.75 },
  "18": { lat: 52.7, lng: 5.05 },
  "19": { lat: 52.52, lng: 4.95 },
  "20": { lat: 51.92, lng: 4.48 }, // Rotterdam
  "21": { lat: 51.87, lng: 4.5 },
  "22": { lat: 51.89, lng: 4.47 },
  "23": { lat: 51.93, lng: 4.45 },
  "24": { lat: 51.95, lng: 4.55 },
  "25": { lat: 51.92, lng: 4.42 },
  "26": { lat: 51.97, lng: 4.36 },
  "27": { lat: 51.85, lng: 4.65 },
  "28": { lat: 51.82, lng: 4.64 },
  "29": { lat: 51.82, lng: 4.55 },
  "30": { lat: 52.08, lng: 4.28 }, // Den Haag
  "31": { lat: 52.05, lng: 4.32 },
  "32": { lat: 52.12, lng: 4.28 },
  "33": { lat: 52.04, lng: 4.35 },
  "34": { lat: 52.16, lng: 4.49 },
  "35": { lat: 52.17, lng: 4.47 },
  "36": { lat: 52.06, lng: 4.5 },
  "37": { lat: 52.0, lng: 4.37 },
  "38": { lat: 52.08, lng: 4.32 },
  "39": { lat: 52.16, lng: 4.45 },
  "40": { lat: 51.59, lng: 4.78 }, // Breda / West-Brabant
  "41": { lat: 51.55, lng: 4.47 },
  "42": { lat: 51.48, lng: 3.61 }, // Zeeland
  "43": { lat: 51.5, lng: 3.6 },
  "44": { lat: 51.44, lng: 3.57 },
  "45": { lat: 51.58, lng: 3.77 },
  "46": { lat: 51.65, lng: 3.83 },
  "47": { lat: 51.6, lng: 4.73 },
  "48": { lat: 51.59, lng: 4.78 },
  "49": { lat: 51.57, lng: 4.97 },
  "50": { lat: 51.44, lng: 5.47 }, // Eindhoven
  "51": { lat: 51.5, lng: 5.07 }, // Tilburg
  "52": { lat: 51.69, lng: 5.3 }, // Den Bosch
  "53": { lat: 51.43, lng: 5.48 },
  "54": { lat: 51.46, lng: 5.51 },
  "55": { lat: 51.44, lng: 5.63 },
  "56": { lat: 51.42, lng: 5.46 },
  "57": { lat: 51.45, lng: 5.7 },
  "58": { lat: 51.45, lng: 5.48 },
  "59": { lat: 51.48, lng: 5.4 },
  "60": { lat: 51.98, lng: 5.91 }, // Arnhem / Nijmegen
  "61": { lat: 51.97, lng: 5.95 },
  "62": { lat: 51.85, lng: 5.87 },
  "63": { lat: 51.84, lng: 5.86 },
  "64": { lat: 51.96, lng: 5.83 },
  "65": { lat: 51.82, lng: 5.86 },
  "66": { lat: 52.0, lng: 6.03 },
  "67": { lat: 52.22, lng: 6.15 },
  "68": { lat: 52.01, lng: 6.24 },
  "69": { lat: 52.06, lng: 5.98 },
  "70": { lat: 52.52, lng: 6.08 }, // Overijssel
  "71": { lat: 52.48, lng: 6.25 },
  "72": { lat: 52.53, lng: 6.09 },
  "73": { lat: 52.24, lng: 6.17 },
  "74": { lat: 52.43, lng: 6.45 },
  "75": { lat: 52.35, lng: 6.67 },
  "76": { lat: 52.75, lng: 6.5 },
  "77": { lat: 52.73, lng: 6.6 },
  "78": { lat: 52.51, lng: 6.08 },
  "79": { lat: 52.42, lng: 6.11 },
  "80": { lat: 52.22, lng: 5.17 }, // Amersfoort
  "81": { lat: 52.16, lng: 5.38 },
  "82": { lat: 52.39, lng: 5.27 },
  "83": { lat: 52.35, lng: 5.22 },
  "84": { lat: 52.3, lng: 5.17 },
  "85": { lat: 52.51, lng: 5.47 },
  "86": { lat: 52.53, lng: 5.72 },
  "87": { lat: 52.63, lng: 5.92 },
  "88": { lat: 52.78, lng: 5.7 },
  "89": { lat: 52.52, lng: 5.42 },
  "90": { lat: 53.22, lng: 6.57 }, // Groningen
  "91": { lat: 53.15, lng: 6.75 },
  "92": { lat: 53.0, lng: 6.55 },
  "93": { lat: 52.95, lng: 6.65 },
  "94": { lat: 53.25, lng: 6.52 },
  "95": { lat: 53.33, lng: 6.25 },
  "96": { lat: 53.2, lng: 5.8 }, // Friesland
  "97": { lat: 52.85, lng: 6.4 }, // Drenthe
  "98": { lat: 53.1, lng: 6.56 },
  "99": { lat: 52.77, lng: 6.9 },
};

type GrensBestemming = {
  land: "Duitsland" | "België";
  naam: string;
  coordinaat: Coordinaat;
};

/** Populaire grenstankstations */
const GRENSBESTEMMINGEN: GrensBestemming[] = [
  // Duitsland
  { land: "Duitsland", naam: "Aachen (A4/A76)", coordinaat: { lat: 50.78, lng: 6.08 } },
  { land: "Duitsland", naam: "Venlo (A67)", coordinaat: { lat: 51.37, lng: 6.17 } },
  { land: "Duitsland", naam: "Oldenzaal (A1/A30)", coordinaat: { lat: 52.32, lng: 6.93 } },
  { land: "Duitsland", naam: "Emmen/Meppen (A37)", coordinaat: { lat: 52.72, lng: 7.3 } },
  { land: "Duitsland", naam: "Bunde (A7)", coordinaat: { lat: 53.18, lng: 7.27 } },
  { land: "Duitsland", naam: "Elten (A12)", coordinaat: { lat: 51.87, lng: 6.17 } },
  // België
  { land: "België", naam: "Hazeldonk (A16)", coordinaat: { lat: 51.48, lng: 4.63 } },
  { land: "België", naam: "Eijsden (A2)", coordinaat: { lat: 50.78, lng: 5.7 } },
  { land: "België", naam: "Zelzate (A11/N62)", coordinaat: { lat: 51.2, lng: 3.82 } },
  { land: "België", naam: "Lommel (A67/E34)", coordinaat: { lat: 51.23, lng: 5.31 } },
];

/** Haversine afstand in km */
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

export type RouteSchatting = {
  land: "Duitsland" | "België";
  bestemming: string;
  afstandEnkel: number;
  afstandRetour: number;
  rijtijdMinuten: number;
};

/**
 * Schat de route naar het dichtstbijzijnde grenstankstation per land.
 * Wegafstand ≈ hemelsbrede afstand × 1.3 (omrijfactor).
 */
export function schatAfstand(postcode: string): RouteSchatting[] | null {
  const prefix = postcode.replace(/\s/g, "").slice(0, 2);
  const origin = POSTCODE_COORDINATEN[prefix];
  if (!origin) return null;

  const result: RouteSchatting[] = [];

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
    const rijtijd = Math.round(retour / 80 * 60); // 80 km/h gemiddeld retour

    result.push({
      land,
      bestemming: dichtstbij.naam,
      afstandEnkel: wegAfstand,
      afstandRetour: retour,
      rijtijdMinuten: rijtijd,
    });
  }

  // Sorteer op afstand: dichtstbijzijnde grens bovenaan,
  // ongeacht of het Duitsland of België is
  return result.sort((a, b) => a.afstandEnkel - b.afstandEnkel);
}

/** Schat basisverbruik in l/100km op basis van cilinderinhoud en brandstofsoort */
export function schattingVerbruik(
  cilinderinhoudCc: number,
  brandstof: "euro95" | "diesel"
): number {
  const isDiesel = brandstof === "diesel";
  if (cilinderinhoudCc <= 1200) return isDiesel ? 4.5 : 5.5;
  if (cilinderinhoudCc <= 1600) return isDiesel ? 5.0 : 6.5;
  if (cilinderinhoudCc <= 2000) return isDiesel ? 5.5 : 7.5;
  if (cilinderinhoudCc <= 3000) return isDiesel ? 6.5 : 9.0;
  return isDiesel ? 8.0 : 11.0;
}

/**
 * Schat verbruik met hybride-correctie.
 * Past de hybride verbruiksfactor toe op het basisverbruik.
 */
export function schattingVerbruikHybride(
  cilinderinhoudCc: number,
  brandstof: "euro95" | "diesel",
  hybrideFactor: number,
): number {
  const basis = schattingVerbruik(cilinderinhoudCc, brandstof);
  return Math.round(basis * hybrideFactor * 10) / 10;
}
