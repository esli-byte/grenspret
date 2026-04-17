/**
 * Data types en storage helpers voor "samen boodschappen" feature.
 *
 * Concept:
 * - Gebruiker kan personen toevoegen (naam + kleur)
 * - Per product kan quantity verdeeld worden over personen
 * - Dashboard toont per persoon het te betalen bedrag
 *
 * "Mij" is altijd aanwezig als default persoon (ingelogde gebruiker).
 */

export const MIJ_ID = "mij";

export type Persoon = {
  id: string;
  naam: string;
  kleur: string; // hex-achtige kleur voor visuele distinctie
};

/**
 * Toewijzing = per product per persoon het aantal dat die persoon betaalt.
 * { productId: { persoonId: aantal } }
 */
export type Toewijzingen = Record<string, Record<string, number>>;

const PERSONEN_KEY = "grensbesparing_personen";
const TOEWIJZINGEN_KEY = "grensbesparing_toewijzingen";
const GROEPSMODUS_KEY = "grensbesparing_groepsmodus";
const ACTIEVE_PERSOON_KEY = "grensbesparing_actieve_persoon";

// Mooie, onderscheidende kleuren voor personen
export const PERSOON_KLEUREN = [
  "#ef4444", // rood
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blauw
  "#8b5cf6", // violet
  "#ec4899", // roze
  "#14b8a6", // teal
  "#f97316", // oranje
];

// Kleur voor "mij"
export const MIJ_KLEUR = "#fb923c"; // accent-kleur van de app (oranje)

export function slaaPersonenOp(personen: Persoon[]) {
  try {
    localStorage.setItem(PERSONEN_KEY, JSON.stringify(personen));
  } catch {
    /* no-op */
  }
}

export function leesPersonen(): Persoon[] {
  try {
    const raw = localStorage.getItem(PERSONEN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function slaaToewijzingenOp(toewijzingen: Toewijzingen) {
  try {
    localStorage.setItem(TOEWIJZINGEN_KEY, JSON.stringify(toewijzingen));
  } catch {
    /* no-op */
  }
}

export function leesToewijzingen(): Toewijzingen {
  try {
    const raw = localStorage.getItem(TOEWIJZINGEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function slaaGroepsmodusOp(aan: boolean) {
  try {
    localStorage.setItem(GROEPSMODUS_KEY, aan ? "1" : "0");
  } catch {
    /* no-op */
  }
}

export function leesGroepsmodus(): boolean {
  try {
    return localStorage.getItem(GROEPSMODUS_KEY) === "1";
  } catch {
    return false;
  }
}

export function slaaActievePersoonOp(id: string) {
  try {
    localStorage.setItem(ACTIEVE_PERSOON_KEY, id);
  } catch {
    /* no-op */
  }
}

export function leesActievePersoon(): string {
  try {
    return localStorage.getItem(ACTIEVE_PERSOON_KEY) || MIJ_ID;
  } catch {
    return MIJ_ID;
  }
}

/**
 * Bereken de totale quantity van een product over alle personen.
 */
export function totaleQuantity(toewijzingen: Toewijzingen, productId: string): number {
  const perPersoon = toewijzingen[productId];
  if (!perPersoon) return 0;
  return Object.values(perPersoon).reduce((s, n) => s + n, 0);
}

/**
 * Voeg +1 toe voor een specifieke persoon bij een product.
 */
export function voegToeVoorPersoon(
  toewijzingen: Toewijzingen,
  productId: string,
  persoonId: string,
): Toewijzingen {
  const perPersoon = { ...(toewijzingen[productId] ?? {}) };
  perPersoon[persoonId] = (perPersoon[persoonId] ?? 0) + 1;
  return { ...toewijzingen, [productId]: perPersoon };
}

/**
 * Haal 1 weg voor een specifieke persoon bij een product.
 * Als 0, verwijder de persoon-entry. Als product leeg is, verwijder product.
 */
export function haalWegVoorPersoon(
  toewijzingen: Toewijzingen,
  productId: string,
  persoonId: string,
): Toewijzingen {
  const perPersoon = { ...(toewijzingen[productId] ?? {}) };
  const huidig = perPersoon[persoonId] ?? 0;
  if (huidig <= 0) return toewijzingen;
  if (huidig === 1) {
    delete perPersoon[persoonId];
  } else {
    perPersoon[persoonId] = huidig - 1;
  }
  const nieuw = { ...toewijzingen };
  if (Object.keys(perPersoon).length === 0) {
    delete nieuw[productId];
  } else {
    nieuw[productId] = perPersoon;
  }
  return nieuw;
}

/**
 * Haal alle quantity weg voor een product (alle personen, alle aantallen).
 */
export function verwijderProductToewijzing(
  toewijzingen: Toewijzingen,
  productId: string,
): Toewijzingen {
  const nieuw = { ...toewijzingen };
  delete nieuw[productId];
  return nieuw;
}

/** Wis alle samen-boodschappen data (personen, toewijzingen, groepsmodus) */
export function wisSamenBoodschappenData() {
  try {
    localStorage.removeItem(PERSONEN_KEY);
    localStorage.removeItem(TOEWIJZINGEN_KEY);
    localStorage.removeItem(GROEPSMODUS_KEY);
    localStorage.removeItem(ACTIEVE_PERSOON_KEY);
  } catch {
    // localStorage niet beschikbaar
  }
}
