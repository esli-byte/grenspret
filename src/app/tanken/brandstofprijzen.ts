export type BrandstofSoort = "euro95" | "euro98" | "diesel";

export type LandPrijzen = {
  land: string;
  vlag: string;
  euro95: number;
  euro98: number;
  diesel: number;
  bron?: string;
  bronUrl?: string;
};

/** Fallback prijzen als de API niet beschikbaar is — bijgewerkt 17 april 2026 */
export const FALLBACK_PRIJZEN: LandPrijzen[] = [
  { land: "Nederland", vlag: "🇳🇱", euro95: 2.57, euro98: 2.71, diesel: 2.73, bron: "handmatig" },
  { land: "Duitsland", vlag: "🇩🇪", euro95: 2.10, euro98: 2.22, diesel: 2.28, bron: "handmatig" },
  { land: "België", vlag: "🇧🇪", euro95: 1.76, euro98: 1.88, diesel: 2.08, bron: "handmatig" },
  { land: "Luxemburg", vlag: "🇱🇺", euro95: 1.72, euro98: 1.85, diesel: 1.72, bron: "handmatig" },
];

/** Gemiddelde tankgrootte op basis van cilinderinhoud */
export function schattingTankgrootte(cilinderinhoudCc: number): number {
  if (cilinderinhoudCc <= 1200) return 40;
  if (cilinderinhoudCc <= 1600) return 45;
  if (cilinderinhoudCc <= 2000) return 50;
  if (cilinderinhoudCc <= 3000) return 60;
  return 70;
}

/** Map RDW brandstof-omschrijving naar onze brandstofsoort */
export function mapBrandstofSoort(
  rdwOmschrijving: string
): BrandstofSoort | null {
  const lower = rdwOmschrijving.toLowerCase();
  if (lower.includes("diesel")) return "diesel";
  if (
    lower.includes("benzine") ||
    lower.includes("euro") ||
    lower.includes("lpg")
  )
    return "euro95";
  return null;
}

// ═══════════════════════════════════════════════════════════
//  EURO 98 DETECTIE
//
//  Adviseert Euro 98 wanneer:
//  1. Oudere auto (eerste toelating vóór 2000) met benzinemotor
//  2. Prestatiemotor: grote cilinderinhoud (>2500cc) benzine
//  3. Sportmerken die Euro 98 aanbevelen (Porsche, BMW M, AMG, etc.)
// ═══════════════════════════════════════════════════════════

const SPORTMERKEN_KEYWORDS = [
  "porsche", "maserati", "ferrari", "lamborghini", "aston martin",
  "mclaren", "lotus", "alpine", "cupra",
];

const SPORT_MODEL_KEYWORDS = [
  "amg", " m ", " m3", " m4", " m5", " m6", " m8",
  " rs ", " rs3", " rs4", " rs5", " rs6", " rs7",
  " gti", " gts", " gt ", " r32", "type r", "type-r",
  " vrs", " sti", "wrx", "nismo", " trd",
  "turbo", "compressor",
];

/**
 * Bepaal of Euro 98 wordt aanbevolen op basis van voertuiggegevens.
 * Retourneert "euro98" als aanbevolen, anders de huidige brandstofsoort.
 */
export function detecteerEuro98(
  basisSoort: BrandstofSoort,
  eersteToelating: string,
  cilinderinhoudStr: string,
  merk: string,
  handelsbenaming: string,
): { aanbevolen: BrandstofSoort; reden: string | null } {
  // Alleen relevant voor benzineauto's
  if (basisSoort !== "euro95") {
    return { aanbevolen: basisSoort, reden: null };
  }

  const merkModel = `${merk} ${handelsbenaming}`.toLowerCase();

  // Check 1: Sportmerk
  for (const keyword of SPORTMERKEN_KEYWORDS) {
    if (merkModel.includes(keyword)) {
      return {
        aanbevolen: "euro98",
        reden: `${merk} adviseert Euro 98 (Super Plus) voor optimale prestaties`,
      };
    }
  }

  // Check 2: Sportmodel
  // Voeg spaties toe aan begin/eind zodat we " m " matchen in "BMW M3"
  const merkModelPadded = ` ${merkModel} `;
  for (const keyword of SPORT_MODEL_KEYWORDS) {
    if (merkModelPadded.includes(keyword)) {
      return {
        aanbevolen: "euro98",
        reden: `${handelsbenaming} is een prestatiemodel — Euro 98 aanbevolen`,
      };
    }
  }

  // Check 3: Grote cilinderinhoud (>2500cc) bij benzine = waarschijnlijk prestatiemotor
  const cc = parseInt(cilinderinhoudStr.replace(/\D/g, ""), 10);
  if (!isNaN(cc) && cc > 2500) {
    return {
      aanbevolen: "euro98",
      reden: `Grote motor (${cc} cc) — Euro 98 wordt aanbevolen`,
    };
  }

  // Check 4: Oudere auto (vóór 2000)
  if (eersteToelating && eersteToelating.length >= 4) {
    const jaar = parseInt(eersteToelating.slice(0, 4), 10);
    if (!isNaN(jaar) && jaar < 2000) {
      return {
        aanbevolen: "euro98",
        reden: `Bouwjaar ${jaar} — oudere motoren presteren beter op Euro 98`,
      };
    }
  }

  return { aanbevolen: "euro95", reden: null };
}

// ═══════════════════════════════════════════════════════════
//  HYBRIDE VERBRUIKSAANPASSING
//
//  Hybrides (NOVC-HEV) verbruiken typisch ~35% minder brandstof
//  dankzij de elektromotor die meehelpt.
//
//  Plug-in hybrides (OVC-HEV) verbruiken minder afhankelijk van
//  hoe vaak de bestuurder de batterij oplaadt:
//  - 100% elektrisch rijden → bijna geen brandstof
//  - 0% elektrisch rijden  → ~25% minder dan puur benzine
//  - De gebruiker kiest een percentage via een slider
// ═══════════════════════════════════════════════════════════

import type { HybrideKlasse } from "./actions";

/**
 * Bereken de hybride verbruiksfactor (vermenigvuldiger voor basisverbruik).
 *
 * @param klasse - Hybride classificatie uit RDW
 * @param elektrischPercentage - Alleen voor PHEV: 0-100% van ritten op elektrisch
 * @returns factor 0-1 waarmee het basisverbruik vermenigvuldigd wordt
 */
export function hybrideVerbruiksFactor(
  klasse: HybrideKlasse,
  elektrischPercentage = 0,
): number {
  switch (klasse) {
    case "NOVC-HEV":
      // Gewone hybride: ~35% zuiniger
      return 0.65;

    case "OVC-HEV": {
      // Plug-in hybride: van 75% verbruik (nooit laden) tot ~5% (altijd elektrisch)
      const pct = Math.max(0, Math.min(100, elektrischPercentage));
      // Bij 0% elektrisch → 0.75 (25% zuiniger dan normaal dankzij recuperatie)
      // Bij 100% elektrisch → 0.05 (bijna geen benzine, alleen voor verwarming etc.)
      return 0.75 - (pct / 100) * 0.7;
    }

    default:
      return 1; // Geen hybride → geen aanpassing
  }
}

/** Leesbare label voor hybride type */
export function hybrideLabel(klasse: HybrideKlasse): string | null {
  switch (klasse) {
    case "NOVC-HEV":
      return "Hybride";
    case "OVC-HEV":
      return "Plug-in Hybride";
    default:
      return null;
  }
}

export type Besparing = {
  land: string;
  vlag: string;
  prijsPerLiter: number;
  totaalKosten: number;
  besparing: number;
};

export function berekenBesparingen(
  brandstofSoort: BrandstofSoort,
  tankGrootte: number,
  prijzen: LandPrijzen[]
): Besparing[] {
  const nl = prijzen[0];
  const nlPrijs = nl[brandstofSoort];
  const nlTotaal = nlPrijs * tankGrootte;

  return prijzen.map((land) => {
    const prijs = land[brandstofSoort];
    const totaal = prijs * tankGrootte;
    return {
      land: land.land,
      vlag: land.vlag,
      prijsPerLiter: prijs,
      totaalKosten: totaal,
      besparing: nlTotaal - totaal,
    };
  });
}
