export type Categorie =
  | "zuivel"
  | "vlees"
  | "dranken"
  | "verzorging"
  | "basis";

export type MerkType = "a-merk" | "huismerk";

export type Product = {
  id: string;
  naam: string;
  merk?: string;
  merkType: MerkType;
  eenheid: string;
  categorie: Categorie;
  icoon: string;
  prijsNL: number;
  prijsDE: number;
  prijsBE: number;
};

export const CATEGORIE_LABELS: Record<Categorie, { label: string; icoon: string; kleur: string }> = {
  zuivel: { label: "Zuivel", icoon: "🧀", kleur: "from-amber-400 to-yellow-300" },
  vlees: { label: "Vlees", icoon: "🥩", kleur: "from-red-400 to-rose-300" },
  dranken: { label: "Dranken", icoon: "🥤", kleur: "from-blue-400 to-cyan-300" },
  verzorging: { label: "Verzorging", icoon: "🧴", kleur: "from-purple-400 to-pink-300" },
  basis: { label: "Basisproducten", icoon: "🌾", kleur: "from-emerald-400 to-green-300" },
};

export const MERK_LABELS: Record<MerkType, { label: string; kleur: string }> = {
  "a-merk": { label: "A-merk", kleur: "bg-blue-500" },
  "huismerk": { label: "Huismerk", kleur: "bg-gray-500" },
};

/**
 * Gemiddelde besparingspercentages per categorie (fractie, 0-1).
 * Gebaseerd op publieke marktdata (Consumentenbond, CBS).
 * Gebruikt voor "eigen product" feature: wanneer een gebruiker een product
 * toevoegt dat niet in de catalogus staat, schatten we DE/BE prijs op basis
 * van deze gemiddelde kortingen.
 */
export const CATEGORIE_KORTING: Record<Categorie, { DE: number; BE: number }> = {
  zuivel: { DE: 0.27, BE: 0.15 }, // zuivel & vlees gemiddeld
  vlees: { DE: 0.27, BE: 0.15 },
  dranken: { DE: 0.38, BE: 0.20 }, // dranken/alcohol hoogste korting
  verzorging: { DE: 0.32, BE: 0.15 }, // drogisterij & huishoudelijk
  basis: { DE: 0.22, BE: 0.12 }, // droge waren
};

export type EigenProduct = {
  id: string;
  naam: string;
  merk?: string;
  merkType: MerkType;
  eenheid: string;
  categorie: Categorie;
  icoon: string;
  prijsNL: number;
  prijsDE: number;
  prijsBE: number;
  isEigen: true;
};

/**
 * Bereken geschatte DE en BE prijs voor een eigen product
 * op basis van NL prijs en categorie-gemiddelde.
 */
export function schatBuitenlandPrijzen(prijsNL: number, categorie: Categorie) {
  const korting = CATEGORIE_KORTING[categorie];
  return {
    prijsDE: Math.round(prijsNL * (1 - korting.DE) * 100) / 100,
    prijsBE: Math.round(prijsNL * (1 - korting.BE) * 100) / 100,
  };
}

export const PRODUCTEN: Product[] = [
  // ═══════════════════════════════════════
  //  ZUIVEL
  // ═══════════════════════════════════════

  // Melk
  { id: "melk-campina", naam: "Volle melk", merk: "Campina", merkType: "a-merk", eenheid: "1 liter", categorie: "zuivel", icoon: "🥛", prijsNL: 1.39, prijsDE: 1.15, prijsBE: 1.25 },
  { id: "melk-huismerk", naam: "Volle melk", merkType: "huismerk", eenheid: "1 liter", categorie: "zuivel", icoon: "🥛", prijsNL: 1.09, prijsDE: 0.85, prijsBE: 0.95 },

  // Kaas
  { id: "kaas-jong", naam: "Jonge kaas", merkType: "huismerk", eenheid: "1 kg", categorie: "zuivel", icoon: "🧀", prijsNL: 10.99, prijsDE: 7.99, prijsBE: 8.49 },

  // Boter
  { id: "boter-campina", naam: "Botergoud", merk: "Campina", merkType: "a-merk", eenheid: "250 gram", categorie: "zuivel", icoon: "🧈", prijsNL: 2.79, prijsDE: 2.09, prijsBE: 2.29 },
  { id: "boter-huismerk", naam: "Roomboter", merkType: "huismerk", eenheid: "250 gram", categorie: "zuivel", icoon: "🧈", prijsNL: 2.19, prijsDE: 1.59, prijsBE: 1.79 },

  // Yoghurt
  { id: "yoghurt-optimel", naam: "Drinkyoghurt", merk: "Optimel", merkType: "a-merk", eenheid: "1 liter", categorie: "zuivel", icoon: "🍶", prijsNL: 2.29, prijsDE: 1.69, prijsBE: 1.89 },
  { id: "yoghurt-huismerk", naam: "Yoghurt natuur", merkType: "huismerk", eenheid: "500 gram", categorie: "zuivel", icoon: "🍶", prijsNL: 1.09, prijsDE: 0.79, prijsBE: 0.89 },

  // ═══════════════════════════════════════
  //  VLEES
  // ═══════════════════════════════════════
  { id: "gehakt", naam: "Half-om-half gehakt", merkType: "huismerk", eenheid: "500 gram", categorie: "vlees", icoon: "🍖", prijsNL: 4.49, prijsDE: 3.29, prijsBE: 3.69 },
  { id: "kipfilet", naam: "Kipfilet", merkType: "huismerk", eenheid: "500 gram", categorie: "vlees", icoon: "🍗", prijsNL: 4.99, prijsDE: 3.79, prijsBE: 4.19 },
  { id: "speklappen", naam: "Speklappen", merkType: "huismerk", eenheid: "500 gram", categorie: "vlees", icoon: "🥓", prijsNL: 4.29, prijsDE: 3.19, prijsBE: 3.49 },
  { id: "rookworst-unox", naam: "Rookworst", merk: "Unox", merkType: "a-merk", eenheid: "275 gram", categorie: "vlees", icoon: "🌭", prijsNL: 2.99, prijsDE: 2.49, prijsBE: 2.59 },
  { id: "rookworst-huismerk", naam: "Rookworst", merkType: "huismerk", eenheid: "275 gram", categorie: "vlees", icoon: "🌭", prijsNL: 1.99, prijsDE: 1.49, prijsBE: 1.69 },

  // ═══════════════════════════════════════
  //  DRANKEN
  // ═══════════════════════════════════════

  // Cola
  { id: "cola-cocacola", naam: "Coca-Cola", merk: "Coca-Cola", merkType: "a-merk", eenheid: "1.5 liter", categorie: "dranken", icoon: "🥤", prijsNL: 1.89, prijsDE: 1.29, prijsBE: 1.49 },
  { id: "cola-pepsi", naam: "Pepsi", merk: "Pepsi", merkType: "a-merk", eenheid: "1.5 liter", categorie: "dranken", icoon: "🥤", prijsNL: 1.79, prijsDE: 1.19, prijsBE: 1.39 },
  { id: "cola-huismerk", naam: "Cola", merkType: "huismerk", eenheid: "1.5 liter", categorie: "dranken", icoon: "🥤", prijsNL: 0.89, prijsDE: 0.49, prijsBE: 0.59 },

  // Bier
  { id: "bier-heineken", naam: "Heineken", merk: "Heineken", merkType: "a-merk", eenheid: "24 × 0.3L", categorie: "dranken", icoon: "🍺", prijsNL: 15.99, prijsDE: 10.99, prijsBE: 12.49 },
  { id: "bier-huismerk", naam: "Pils (krat)", merkType: "huismerk", eenheid: "24 × 0.3L", categorie: "dranken", icoon: "🍺", prijsNL: 9.99, prijsDE: 6.49, prijsBE: 7.99 },

  // Koffie
  { id: "koffie-douwe", naam: "Aroma Rood", merk: "Douwe Egberts", merkType: "a-merk", eenheid: "500 gram", categorie: "dranken", icoon: "☕", prijsNL: 6.49, prijsDE: 4.99, prijsBE: 5.49 },
  { id: "koffie-huismerk", naam: "Filterkoffie", merkType: "huismerk", eenheid: "500 gram", categorie: "dranken", icoon: "☕", prijsNL: 3.99, prijsDE: 2.79, prijsBE: 3.19 },

  // Wijn
  { id: "wijn", naam: "Rode wijn", merkType: "huismerk", eenheid: "0.75 liter", categorie: "dranken", icoon: "🍷", prijsNL: 3.99, prijsDE: 2.49, prijsBE: 2.99 },

  // ═══════════════════════════════════════
  //  VERZORGING
  // ═══════════════════════════════════════

  // Deodorant
  { id: "deo-dove", naam: "Deodorant", merk: "Dove", merkType: "a-merk", eenheid: "150 ml", categorie: "verzorging", icoon: "🧴", prijsNL: 3.99, prijsDE: 2.49, prijsBE: 2.99 },
  { id: "deo-axe", naam: "Deodorant", merk: "Axe", merkType: "a-merk", eenheid: "150 ml", categorie: "verzorging", icoon: "🧴", prijsNL: 4.49, prijsDE: 2.79, prijsBE: 3.29 },
  { id: "deo-huismerk", naam: "Deodorant", merkType: "huismerk", eenheid: "150 ml", categorie: "verzorging", icoon: "🧴", prijsNL: 1.49, prijsDE: 0.89, prijsBE: 1.09 },

  // Tandpasta
  { id: "tandpasta-prodent", naam: "Tandpasta", merk: "Prodent", merkType: "a-merk", eenheid: "75 ml", categorie: "verzorging", icoon: "🪥", prijsNL: 2.49, prijsDE: 1.59, prijsBE: 1.89 },
  { id: "tandpasta-huismerk", naam: "Tandpasta", merkType: "huismerk", eenheid: "75 ml", categorie: "verzorging", icoon: "🪥", prijsNL: 0.99, prijsDE: 0.59, prijsBE: 0.75 },

  // Shampoo
  { id: "shampoo-andrelon", naam: "Shampoo", merk: "Andrélon", merkType: "a-merk", eenheid: "300 ml", categorie: "verzorging", icoon: "🧴", prijsNL: 3.49, prijsDE: 2.29, prijsBE: 2.79 },
  { id: "shampoo-huismerk", naam: "Shampoo", merkType: "huismerk", eenheid: "250 ml", categorie: "verzorging", icoon: "🧴", prijsNL: 1.49, prijsDE: 0.89, prijsBE: 1.09 },

  // Schoonmaak
  { id: "afwasmiddel-dreft", naam: "Afwasmiddel", merk: "Dreft", merkType: "a-merk", eenheid: "890 ml", categorie: "verzorging", icoon: "🫧", prijsNL: 3.29, prijsDE: 2.19, prijsBE: 2.59 },
  { id: "waspoeder-persil", naam: "Wasmiddel", merk: "Persil", merkType: "a-merk", eenheid: "1.35 kg", categorie: "verzorging", icoon: "🫧", prijsNL: 12.99, prijsDE: 8.49, prijsBE: 9.99 },
  { id: "waspoeder-huismerk", naam: "Waspoeder", merkType: "huismerk", eenheid: "1.35 kg", categorie: "verzorging", icoon: "🫧", prijsNL: 5.99, prijsDE: 3.99, prijsBE: 4.49 },

  // Toiletpapier
  { id: "wc-papier-page", naam: "Toiletpapier", merk: "Page", merkType: "a-merk", eenheid: "8 rollen", categorie: "verzorging", icoon: "🧻", prijsNL: 5.99, prijsDE: 3.99, prijsBE: 4.69 },
  { id: "wc-papier-huismerk", naam: "Toiletpapier", merkType: "huismerk", eenheid: "8 rollen", categorie: "verzorging", icoon: "🧻", prijsNL: 2.99, prijsDE: 1.79, prijsBE: 2.19 },

  // ═══════════════════════════════════════
  //  BASISPRODUCTEN
  // ═══════════════════════════════════════

  // Pindakaas
  { id: "pindakaas-calve", naam: "Pindakaas", merk: "Calvé", merkType: "a-merk", eenheid: "350 gram", categorie: "basis", icoon: "🥜", prijsNL: 3.29, prijsDE: 2.49, prijsBE: 2.79 },
  { id: "pindakaas-huismerk", naam: "Pindakaas", merkType: "huismerk", eenheid: "350 gram", categorie: "basis", icoon: "🥜", prijsNL: 1.79, prijsDE: 1.19, prijsBE: 1.39 },

  // Hagelslag
  { id: "hagelslag-dehollandse", naam: "Hagelslag", merk: "De Ruijter", merkType: "a-merk", eenheid: "380 gram", categorie: "basis", icoon: "🍫", prijsNL: 2.99, prijsDE: 2.49, prijsBE: 2.69 },

  // Suiker
  { id: "suiker", naam: "Witte suiker", merkType: "huismerk", eenheid: "1 kg", categorie: "basis", icoon: "🍬", prijsNL: 1.19, prijsDE: 0.85, prijsBE: 0.95 },

  // Bloem
  { id: "bloem", naam: "Tarwebloem", merkType: "huismerk", eenheid: "1 kg", categorie: "basis", icoon: "🌾", prijsNL: 0.99, prijsDE: 0.59, prijsBE: 0.75 },

  // Pasta
  { id: "pasta-barilla", naam: "Spaghetti", merk: "Barilla", merkType: "a-merk", eenheid: "500 gram", categorie: "basis", icoon: "🍝", prijsNL: 1.89, prijsDE: 1.19, prijsBE: 1.39 },
  { id: "pasta-huismerk", naam: "Spaghetti", merkType: "huismerk", eenheid: "500 gram", categorie: "basis", icoon: "🍝", prijsNL: 0.89, prijsDE: 0.49, prijsBE: 0.59 },

  // Olijfolie
  { id: "olijfolie-bertolli", naam: "Olijfolie", merk: "Bertolli", merkType: "a-merk", eenheid: "500 ml", categorie: "basis", icoon: "🫒", prijsNL: 6.99, prijsDE: 4.99, prijsBE: 5.49 },
  { id: "olijfolie-huismerk", naam: "Olijfolie", merkType: "huismerk", eenheid: "500 ml", categorie: "basis", icoon: "🫒", prijsNL: 3.99, prijsDE: 2.79, prijsBE: 3.19 },

  // Nutella
  { id: "nutella", naam: "Nutella", merk: "Nutella", merkType: "a-merk", eenheid: "400 gram", categorie: "basis", icoon: "🍫", prijsNL: 3.69, prijsDE: 2.49, prijsBE: 2.89 },
];
