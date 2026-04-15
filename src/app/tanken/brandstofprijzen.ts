export type BrandstofSoort = "euro95" | "diesel";

export type LandPrijzen = {
  land: string;
  vlag: string;
  euro95: number;
  diesel: number;
  bron?: string;
  bronUrl?: string;
};

/** Fallback prijzen als de API niet beschikbaar is — april 2026 */
export const FALLBACK_PRIJZEN: LandPrijzen[] = [
  { land: "Nederland", vlag: "🇳🇱", euro95: 2.15, diesel: 1.79, bron: "handmatig" },
  { land: "Duitsland", vlag: "🇩🇪", euro95: 1.73, diesel: 1.60, bron: "handmatig" },
  { land: "België", vlag: "🇧🇪", euro95: 1.81, diesel: 1.68, bron: "handmatig" },
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
