/**
 * Gedeelde localStorage opslag voor het delen van berekeningen
 * tussen de tanken-, boodschappen- en resultaat-pagina's.
 */

export type TankenOpslag = {
  voertuig: {
    merk: string;
    handelsbenaming: string;
    brandstof: string;
    kenteken: string;
  };
  brandstofSoort: string;
  tankGrootte: number;
  verbruik: number;
  besparingDE: number;
  besparingBE: number;
  route: {
    land: string;
    bestemming: string;
    afstandEnkel: number;
    afstandRetour: number;
    rijtijdMinuten: number;
    reiskosten: number;
    netto: number;
  }[];
};

export type BoodschappenOpslag = {
  aantalProducten: number;
  totaalNL: number;
  totaalDE: number;
  totaalBE: number;
  besparingDE: number;
  besparingBE: number;
};

export type GebruikerVoorkeuren = {
  kenteken?: string;
  postcode?: string;
  isLeaseAuto?: boolean;
  extraLiters?: number;
  brandstofOverride?: string | null;
  elektrischPercentage?: number;
  laatsteBezoek?: string;
};

export type BoodschappenSelectie = {
  producten: Record<string, number>; // productId -> quantity
};

export type BerekeningsFlow = "tanken" | "boodschappen" | "beide";

const FLOW_KEY = "grensbesparing_flow";

export function slaaFlowOp(flow: BerekeningsFlow) {
  try {
    localStorage.setItem(FLOW_KEY, flow);
  } catch {
    // localStorage niet beschikbaar
  }
}

/** Wis berekende resultaten bij flow-wissel zodat oude data niet doorlekt.
 *  Voorkeuren (kenteken, postcode, etc.) blijven behouden. */
export function wisResultaatData() {
  try {
    localStorage.removeItem(TANKEN_KEY);
    localStorage.removeItem(BOODSCHAPPEN_KEY);
    localStorage.removeItem(HUISHOUDENS_KEY);
    localStorage.removeItem(GEKOZEN_TANKSTATION_KEY);
    localStorage.removeItem(GEKOZEN_SUPERMARKT_KEY);
    localStorage.removeItem(BOODSCHAPPEN_SELECTIE_KEY);
    localStorage.removeItem(EIGEN_PRODUCTEN_KEY);
  } catch {
    // localStorage niet beschikbaar
  }
}

export function leesFlow(): BerekeningsFlow {
  try {
    const raw = localStorage.getItem(FLOW_KEY);
    if (raw === "tanken" || raw === "boodschappen" || raw === "beide") return raw;
    return "beide";
  } catch {
    return "beide";
  }
}

const TANKEN_KEY = "grensbesparing_tanken";
const BOODSCHAPPEN_KEY = "grensbesparing_boodschappen";
const HUISHOUDENS_KEY = "grensbesparing_huishoudens";
const VOORKEUREN_KEY = "grensbesparing_voorkeuren";
const BOODSCHAPPEN_SELECTIE_KEY = "grensbesparing_boodschappen_selectie";
const EIGEN_PRODUCTEN_KEY = "grensbesparing_eigen_producten";
const GEKOZEN_TANKSTATION_KEY = "grensbesparing_gekozen_tankstation";
const GEKOZEN_SUPERMARKT_KEY = "grensbesparing_gekozen_supermarkt";

// === Gekozen tankstation (voor combi-flow) ===
export type GekozenTankstation = {
  id: string;
  naam: string;
  land: "Duitsland" | "België";
  adres: string;
  coordinaat: { lat: number; lng: number };
  afstandKm: number;
  rijtijdMin: number;
};

export function slaaGekozenTankstationOp(data: GekozenTankstation) {
  try {
    localStorage.setItem(GEKOZEN_TANKSTATION_KEY, JSON.stringify(data));
  } catch { /* localStorage niet beschikbaar */ }
}

export function leesGekozenTankstation(): GekozenTankstation | null {
  try {
    const raw = localStorage.getItem(GEKOZEN_TANKSTATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// === Gekozen supermarkt (voor combi-flow) ===
export type GekozenSupermarkt = {
  id: string;
  naam: string;
  land: "Duitsland" | "België";
  adres: string;
  coordinaat: { lat: number; lng: number };
  afstandVanTankstation: number;
  afstandVanThuis: number;
};

export function slaaGekozenSupermarktOp(data: GekozenSupermarkt) {
  try {
    localStorage.setItem(GEKOZEN_SUPERMARKT_KEY, JSON.stringify(data));
  } catch { /* localStorage niet beschikbaar */ }
}

export function leesGekozenSupermarkt(): GekozenSupermarkt | null {
  try {
    const raw = localStorage.getItem(GEKOZEN_SUPERMARKT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Minimal shape for stored custom products (import type comes from producten.ts)
type OpgeslagenEigenProduct = {
  id: string;
  naam: string;
  merkType: string;
  eenheid: string;
  categorie: string;
  icoon: string;
  prijsNL: number;
  prijsDE: number;
  prijsBE: number;
  isEigen: true;
};

export function slaaHuishoudensOp(aantal: number) {
  try {
    localStorage.setItem(HUISHOUDENS_KEY, String(aantal));
  } catch {
    // localStorage niet beschikbaar
  }
}

export function leesHuishoudens(): number {
  try {
    const raw = localStorage.getItem(HUISHOUDENS_KEY);
    const parsed = raw ? parseInt(raw, 10) : 1;
    return parsed >= 1 && parsed <= 5 ? parsed : 1;
  } catch {
    return 1;
  }
}

export function slaaTankenOp(data: TankenOpslag) {
  try {
    localStorage.setItem(TANKEN_KEY, JSON.stringify(data));
  } catch {
    // localStorage niet beschikbaar
  }
}

export function leesTanken(): TankenOpslag | null {
  try {
    const raw = localStorage.getItem(TANKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function slaaBoodschappenOp(data: BoodschappenOpslag) {
  try {
    localStorage.setItem(BOODSCHAPPEN_KEY, JSON.stringify(data));
  } catch {
    // localStorage niet beschikbaar
  }
}

export function leesBoodschappen(): BoodschappenOpslag | null {
  try {
    const raw = localStorage.getItem(BOODSCHAPPEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// === Gebruiker voorkeuren (kenteken, postcode, lease) ===
export function slaaVoorkeurenOp(data: Partial<GebruikerVoorkeuren>) {
  try {
    const bestaand = leesVoorkeuren();
    const bijgewerkt = { ...bestaand, ...data, laatsteBezoek: new Date().toISOString() };
    localStorage.setItem(VOORKEUREN_KEY, JSON.stringify(bijgewerkt));
  } catch {
    // localStorage niet beschikbaar
  }
}

export function leesVoorkeuren(): GebruikerVoorkeuren {
  try {
    const raw = localStorage.getItem(VOORKEUREN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// === Eigen producten (door gebruiker toegevoegd) ===
export function slaaEigenProductenOp(producten: OpgeslagenEigenProduct[]) {
  try {
    localStorage.setItem(EIGEN_PRODUCTEN_KEY, JSON.stringify(producten));
  } catch {
    // localStorage niet beschikbaar
  }
}

export function leesEigenProducten(): OpgeslagenEigenProduct[] {
  try {
    const raw = localStorage.getItem(EIGEN_PRODUCTEN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// === Boodschappen selectie (product aantallen) ===
export function slaaBoodschappenSelectieOp(producten: Record<string, number>) {
  try {
    localStorage.setItem(BOODSCHAPPEN_SELECTIE_KEY, JSON.stringify({ producten }));
  } catch {
    // localStorage niet beschikbaar
  }
}

export function leesBoodschappenSelectie(): BoodschappenSelectie | null {
  try {
    const raw = localStorage.getItem(BOODSCHAPPEN_SELECTIE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
