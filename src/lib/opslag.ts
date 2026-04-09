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

const TANKEN_KEY = "grensbesparing_tanken";
const BOODSCHAPPEN_KEY = "grensbesparing_boodschappen";
const HUISHOUDENS_KEY = "grensbesparing_huishoudens";

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
