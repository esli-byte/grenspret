export type Categorie =
  | "zuivel"
  | "vlees"
  | "dranken"
  | "verzorging"
  | "basis"
  | "groente-fruit"
  | "brood"
  | "diepvries"
  | "snacks"
  | "tabak"
  | "sterke-drank";

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
  "groente-fruit": { label: "Groente & Fruit", icoon: "🥦", kleur: "from-lime-400 to-green-400" },
  brood: { label: "Brood & Ontbijt", icoon: "🍞", kleur: "from-orange-400 to-amber-400" },
  diepvries: { label: "Diepvries", icoon: "🧊", kleur: "from-sky-400 to-blue-400" },
  snacks: { label: "Snacks & Koek", icoon: "🍿", kleur: "from-fuchsia-400 to-pink-400" },
  tabak: { label: "Tabak", icoon: "🚬", kleur: "from-stone-500 to-zinc-500" },
  "sterke-drank": { label: "Sterke drank", icoon: "🥃", kleur: "from-amber-600 to-yellow-700" },
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
  "groente-fruit": { DE: 0.10, BE: 0.05 }, // weinig verschil, lokaal geteeld
  brood: { DE: 0.15, BE: 0.08 }, // bakkerijproducten matig goedkoper
  diepvries: { DE: 0.28, BE: 0.15 }, // vergelijkbaar met zuivel
  snacks: { DE: 0.25, BE: 0.12 }, // koek/snoep gemiddeld
  tabak: { DE: 0.05, BE: 0.10 }, // DE amper goedkoper, BE iets wel
  "sterke-drank": { DE: 0.28, BE: 0.18 }, // BE accijns lager, DE nog lager
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

  // Rijst
  { id: "rijst-lassie", naam: "Basmati rijst", merk: "Lassie", merkType: "a-merk", eenheid: "500 gram", categorie: "basis", icoon: "🍚", prijsNL: 2.79, prijsDE: 2.19, prijsBE: 2.49 },
  { id: "rijst-huismerk", naam: "Witte rijst", merkType: "huismerk", eenheid: "1 kg", categorie: "basis", icoon: "🍚", prijsNL: 1.89, prijsDE: 1.29, prijsBE: 1.59 },

  // Blik / conserven
  { id: "tomatenpuree", naam: "Tomatenpuree", merkType: "huismerk", eenheid: "140 gram", categorie: "basis", icoon: "🥫", prijsNL: 0.69, prijsDE: 0.49, prijsBE: 0.59 },
  { id: "bonen-heinz", naam: "Witte bonen in tomatensaus", merk: "Heinz", merkType: "a-merk", eenheid: "415 gram", categorie: "basis", icoon: "🥫", prijsNL: 1.69, prijsDE: 1.29, prijsBE: 1.49 },
  { id: "soep-unox", naam: "Tomatensoep", merk: "Unox", merkType: "a-merk", eenheid: "800 ml", categorie: "basis", icoon: "🥫", prijsNL: 2.49, prijsDE: 1.89, prijsBE: 2.19 },
  { id: "mais-bonduelle", naam: "Mais", merk: "Bonduelle", merkType: "a-merk", eenheid: "300 gram", categorie: "basis", icoon: "🌽", prijsNL: 1.79, prijsDE: 1.29, prijsBE: 1.49 },

  // Sauzen
  { id: "mayonaise-hellmann", naam: "Mayonaise", merk: "Hellmann's", merkType: "a-merk", eenheid: "450 ml", categorie: "basis", icoon: "🥫", prijsNL: 2.99, prijsDE: 2.19, prijsBE: 2.49 },
  { id: "ketchup-heinz", naam: "Tomatenketchup", merk: "Heinz", merkType: "a-merk", eenheid: "570 gram", categorie: "basis", icoon: "🍅", prijsNL: 3.49, prijsDE: 2.29, prijsBE: 2.69 },
  { id: "sojasaus-kikkoman", naam: "Sojasaus", merk: "Kikkoman", merkType: "a-merk", eenheid: "250 ml", categorie: "basis", icoon: "🫙", prijsNL: 2.99, prijsDE: 2.19, prijsBE: 2.49 },

  // Eieren
  { id: "eieren-10", naam: "Scharreleieren", merkType: "huismerk", eenheid: "10 stuks", categorie: "zuivel", icoon: "🥚", prijsNL: 2.49, prijsDE: 1.89, prijsBE: 2.09 },
  { id: "eieren-6", naam: "Vrije uitloop eieren", merkType: "huismerk", eenheid: "6 stuks", categorie: "zuivel", icoon: "🥚", prijsNL: 1.99, prijsDE: 1.49, prijsBE: 1.69 },

  // Kaas varianten
  { id: "kaas-oude", naam: "Oude kaas plakjes", merkType: "huismerk", eenheid: "200 gram", categorie: "zuivel", icoon: "🧀", prijsNL: 3.29, prijsDE: 2.39, prijsBE: 2.69 },
  { id: "kaas-mozzarella", naam: "Mozzarella", merk: "Galbani", merkType: "a-merk", eenheid: "125 gram", categorie: "zuivel", icoon: "🧀", prijsNL: 1.69, prijsDE: 0.99, prijsBE: 1.19 },

  // Yoghurt/zuivel
  { id: "kwark-arla", naam: "Magere kwark", merk: "Arla", merkType: "a-merk", eenheid: "500 gram", categorie: "zuivel", icoon: "🍶", prijsNL: 1.99, prijsDE: 1.39, prijsBE: 1.59 },
  { id: "slagroom", naam: "Slagroom", merkType: "huismerk", eenheid: "250 ml", categorie: "zuivel", icoon: "🥛", prijsNL: 1.49, prijsDE: 0.99, prijsBE: 1.19 },
  { id: "vla-melkunie", naam: "Vanillevla", merk: "Melkunie", merkType: "a-merk", eenheid: "1 liter", categorie: "zuivel", icoon: "🍶", prijsNL: 2.19, prijsDE: 1.59, prijsBE: 1.79 },

  // Vlees extra
  { id: "hamburger", naam: "Hamburgers", merkType: "huismerk", eenheid: "4 stuks", categorie: "vlees", icoon: "🍔", prijsNL: 3.99, prijsDE: 2.79, prijsBE: 3.19 },
  { id: "knakworst-unox", naam: "Knakworstjes", merk: "Unox", merkType: "a-merk", eenheid: "200 gram", categorie: "vlees", icoon: "🌭", prijsNL: 2.69, prijsDE: 1.89, prijsBE: 2.19 },
  { id: "bacon", naam: "Bacon", merkType: "huismerk", eenheid: "150 gram", categorie: "vlees", icoon: "🥓", prijsNL: 2.49, prijsDE: 1.69, prijsBE: 1.99 },
  { id: "shoarma", naam: "Shoarmavlees", merkType: "huismerk", eenheid: "500 gram", categorie: "vlees", icoon: "🌯", prijsNL: 5.49, prijsDE: 3.99, prijsBE: 4.49 },
  { id: "worstjes-bbq", naam: "BBQ worstjes", merkType: "huismerk", eenheid: "400 gram", categorie: "vlees", icoon: "🌭", prijsNL: 4.29, prijsDE: 3.19, prijsBE: 3.59 },

  // Dranken extra
  { id: "aj-dubbelfris", naam: "Dubbelfrisss", merk: "Dubbelfrisss", merkType: "a-merk", eenheid: "1.5 liter", categorie: "dranken", icoon: "🧃", prijsNL: 1.99, prijsDE: 1.29, prijsBE: 1.49 },
  { id: "water-spa", naam: "Mineraalwater", merk: "Spa", merkType: "a-merk", eenheid: "1.5 liter", categorie: "dranken", icoon: "💧", prijsNL: 1.19, prijsDE: 0.69, prijsBE: 0.89 },
  { id: "water-huismerk", naam: "Bronwater", merkType: "huismerk", eenheid: "6×1.5L", categorie: "dranken", icoon: "💧", prijsNL: 2.99, prijsDE: 1.99, prijsBE: 2.29 },
  { id: "thee-pickwick", naam: "Engelse melange thee", merk: "Pickwick", merkType: "a-merk", eenheid: "80 zakjes", categorie: "dranken", icoon: "🍵", prijsNL: 3.79, prijsDE: 2.49, prijsBE: 2.89 },
  { id: "koffie-pads", naam: "Senseo koffiepads", merk: "Senseo", merkType: "a-merk", eenheid: "36 stuks", categorie: "dranken", icoon: "☕", prijsNL: 3.99, prijsDE: 2.49, prijsBE: 2.99 },
  { id: "redbull", naam: "Energy drink", merk: "Red Bull", merkType: "a-merk", eenheid: "250 ml", categorie: "dranken", icoon: "⚡", prijsNL: 1.89, prijsDE: 1.29, prijsBE: 1.49 },
  { id: "wijn-wit", naam: "Witte wijn", merkType: "huismerk", eenheid: "0.75 liter", categorie: "dranken", icoon: "🍾", prijsNL: 4.49, prijsDE: 2.79, prijsBE: 3.49 },
  { id: "prosecco", naam: "Prosecco", merkType: "huismerk", eenheid: "0.75 liter", categorie: "dranken", icoon: "🥂", prijsNL: 6.99, prijsDE: 3.99, prijsBE: 4.99 },

  // Verzorging extra
  { id: "douchegel-nivea", naam: "Douchegel", merk: "Nivea", merkType: "a-merk", eenheid: "250 ml", categorie: "verzorging", icoon: "🧴", prijsNL: 3.49, prijsDE: 2.19, prijsBE: 2.59 },
  { id: "zeep-dove", naam: "Handzeep", merk: "Dove", merkType: "a-merk", eenheid: "250 ml", categorie: "verzorging", icoon: "🧼", prijsNL: 2.49, prijsDE: 1.59, prijsBE: 1.89 },
  { id: "mondwater-listerine", naam: "Mondwater", merk: "Listerine", merkType: "a-merk", eenheid: "500 ml", categorie: "verzorging", icoon: "🪥", prijsNL: 5.49, prijsDE: 3.49, prijsBE: 4.19 },
  { id: "luiers-pampers", naam: "Luiers maat 4", merk: "Pampers", merkType: "a-merk", eenheid: "44 stuks", categorie: "verzorging", icoon: "👶", prijsNL: 12.99, prijsDE: 8.49, prijsBE: 9.99 },
  { id: "maandverband", naam: "Maandverband", merk: "Always", merkType: "a-merk", eenheid: "16 stuks", categorie: "verzorging", icoon: "🩸", prijsNL: 3.99, prijsDE: 2.49, prijsBE: 2.99 },
  { id: "vaatwastabletten", naam: "Vaatwastabletten", merk: "Finish", merkType: "a-merk", eenheid: "40 stuks", categorie: "verzorging", icoon: "🫧", prijsNL: 12.99, prijsDE: 7.99, prijsBE: 9.99 },
  { id: "keukenrol", naam: "Keukenpapier", merkType: "huismerk", eenheid: "4 rollen", categorie: "verzorging", icoon: "🧻", prijsNL: 3.49, prijsDE: 2.19, prijsBE: 2.69 },

  // ═══════════════════════════════════════
  //  GROENTE & FRUIT
  // ═══════════════════════════════════════
  { id: "tomaten", naam: "Tomaten los", merkType: "huismerk", eenheid: "500 gram", categorie: "groente-fruit", icoon: "🍅", prijsNL: 1.99, prijsDE: 1.79, prijsBE: 1.89 },
  { id: "komkommer", naam: "Komkommer", merkType: "huismerk", eenheid: "1 stuk", categorie: "groente-fruit", icoon: "🥒", prijsNL: 0.99, prijsDE: 0.89, prijsBE: 0.95 },
  { id: "paprika", naam: "Paprika rood", merkType: "huismerk", eenheid: "1 stuk", categorie: "groente-fruit", icoon: "🫑", prijsNL: 1.29, prijsDE: 1.09, prijsBE: 1.19 },
  { id: "sla", naam: "Kropsla", merkType: "huismerk", eenheid: "1 krop", categorie: "groente-fruit", icoon: "🥬", prijsNL: 1.49, prijsDE: 1.29, prijsBE: 1.39 },
  { id: "uien", naam: "Uien", merkType: "huismerk", eenheid: "1 kg", categorie: "groente-fruit", icoon: "🧅", prijsNL: 1.29, prijsDE: 1.09, prijsBE: 1.19 },
  { id: "wortelen", naam: "Winterwortelen", merkType: "huismerk", eenheid: "1 kg", categorie: "groente-fruit", icoon: "🥕", prijsNL: 1.19, prijsDE: 0.99, prijsBE: 1.09 },
  { id: "aardappelen", naam: "Aardappelen", merkType: "huismerk", eenheid: "2.5 kg", categorie: "groente-fruit", icoon: "🥔", prijsNL: 3.49, prijsDE: 2.99, prijsBE: 3.19 },
  { id: "champignons", naam: "Champignons", merkType: "huismerk", eenheid: "250 gram", categorie: "groente-fruit", icoon: "🍄", prijsNL: 1.49, prijsDE: 1.29, prijsBE: 1.39 },
  { id: "broccoli", naam: "Broccoli", merkType: "huismerk", eenheid: "500 gram", categorie: "groente-fruit", icoon: "🥦", prijsNL: 1.99, prijsDE: 1.69, prijsBE: 1.89 },
  { id: "appel", naam: "Elstar appels", merkType: "huismerk", eenheid: "1 kg", categorie: "groente-fruit", icoon: "🍎", prijsNL: 2.49, prijsDE: 2.19, prijsBE: 2.29 },
  { id: "banaan", naam: "Bananen", merkType: "huismerk", eenheid: "1 kg", categorie: "groente-fruit", icoon: "🍌", prijsNL: 1.79, prijsDE: 1.49, prijsBE: 1.59 },
  { id: "sinaasappel", naam: "Sinaasappels", merkType: "huismerk", eenheid: "1.5 kg", categorie: "groente-fruit", icoon: "🍊", prijsNL: 2.99, prijsDE: 2.49, prijsBE: 2.69 },
  { id: "avocado", naam: "Avocado", merkType: "huismerk", eenheid: "1 stuk", categorie: "groente-fruit", icoon: "🥑", prijsNL: 1.49, prijsDE: 1.29, prijsBE: 1.39 },
  { id: "druiven", naam: "Witte druiven", merkType: "huismerk", eenheid: "500 gram", categorie: "groente-fruit", icoon: "🍇", prijsNL: 2.99, prijsDE: 2.49, prijsBE: 2.79 },

  // ═══════════════════════════════════════
  //  BROOD & ONTBIJT
  // ═══════════════════════════════════════
  { id: "brood-wit", naam: "Wit casino", merkType: "huismerk", eenheid: "800 gram", categorie: "brood", icoon: "🍞", prijsNL: 1.99, prijsDE: 1.59, prijsBE: 1.79 },
  { id: "brood-volkoren", naam: "Volkoren casino", merkType: "huismerk", eenheid: "800 gram", categorie: "brood", icoon: "🍞", prijsNL: 2.29, prijsDE: 1.79, prijsBE: 2.09 },
  { id: "brood-bruin", naam: "Bruin casino", merkType: "huismerk", eenheid: "800 gram", categorie: "brood", icoon: "🍞", prijsNL: 2.09, prijsDE: 1.69, prijsBE: 1.89 },
  { id: "croissants", naam: "Croissants", merkType: "huismerk", eenheid: "6 stuks", categorie: "brood", icoon: "🥐", prijsNL: 2.49, prijsDE: 1.99, prijsBE: 2.19 },
  { id: "beschuit", naam: "Beschuit", merk: "Bolletje", merkType: "a-merk", eenheid: "13 stuks", categorie: "brood", icoon: "🍪", prijsNL: 1.59, prijsDE: 1.19, prijsBE: 1.39 },
  { id: "crackers", naam: "Crackers", merk: "LU", merkType: "a-merk", eenheid: "250 gram", categorie: "brood", icoon: "🍘", prijsNL: 1.89, prijsDE: 1.39, prijsBE: 1.59 },
  { id: "muesli-quaker", naam: "Havermout", merk: "Quaker", merkType: "a-merk", eenheid: "500 gram", categorie: "brood", icoon: "🥣", prijsNL: 2.49, prijsDE: 1.79, prijsBE: 2.09 },
  { id: "cornflakes-kellogg", naam: "Cornflakes", merk: "Kellogg's", merkType: "a-merk", eenheid: "500 gram", categorie: "brood", icoon: "🥣", prijsNL: 3.49, prijsDE: 2.49, prijsBE: 2.89 },
  { id: "muesli-huismerk", naam: "Luxe muesli", merkType: "huismerk", eenheid: "500 gram", categorie: "brood", icoon: "🥣", prijsNL: 2.29, prijsDE: 1.69, prijsBE: 1.89 },
  { id: "kaas-plakjes", naam: "Jonge kaas plakjes", merkType: "huismerk", eenheid: "200 gram", categorie: "brood", icoon: "🧀", prijsNL: 2.99, prijsDE: 2.29, prijsBE: 2.49 },

  // ═══════════════════════════════════════
  //  DIEPVRIES
  // ═══════════════════════════════════════
  { id: "pizza-dr-oetker", naam: "Pizza Ristorante", merk: "Dr. Oetker", merkType: "a-merk", eenheid: "355 gram", categorie: "diepvries", icoon: "🍕", prijsNL: 3.49, prijsDE: 2.29, prijsBE: 2.69 },
  { id: "pizza-huismerk", naam: "Pizza Margherita", merkType: "huismerk", eenheid: "350 gram", categorie: "diepvries", icoon: "🍕", prijsNL: 1.99, prijsDE: 1.29, prijsBE: 1.49 },
  { id: "friet", naam: "Frites dunne", merkType: "huismerk", eenheid: "1 kg", categorie: "diepvries", icoon: "🍟", prijsNL: 2.49, prijsDE: 1.79, prijsBE: 1.99 },
  { id: "ijs-ben-jerry", naam: "IJs", merk: "Ben & Jerry's", merkType: "a-merk", eenheid: "465 ml", categorie: "diepvries", icoon: "🍨", prijsNL: 6.99, prijsDE: 4.99, prijsBE: 5.79 },
  { id: "ijs-magnum", naam: "Magnum Classic", merk: "Magnum", merkType: "a-merk", eenheid: "4 stuks", categorie: "diepvries", icoon: "🍦", prijsNL: 3.99, prijsDE: 2.79, prijsBE: 3.29 },
  { id: "loempia", naam: "Loempia", merkType: "huismerk", eenheid: "6 stuks", categorie: "diepvries", icoon: "🥟", prijsNL: 2.99, prijsDE: 2.19, prijsBE: 2.49 },
  { id: "spinazie-vries", naam: "Gehakte spinazie", merkType: "huismerk", eenheid: "450 gram", categorie: "diepvries", icoon: "🥬", prijsNL: 1.49, prijsDE: 1.09, prijsBE: 1.29 },
  { id: "vissticks-iglo", naam: "Vissticks", merk: "Iglo", merkType: "a-merk", eenheid: "450 gram", categorie: "diepvries", icoon: "🐟", prijsNL: 4.49, prijsDE: 3.19, prijsBE: 3.69 },

  // ═══════════════════════════════════════
  //  SNACKS & KOEK
  // ═══════════════════════════════════════
  { id: "chips-lays", naam: "Naturel chips", merk: "Lay's", merkType: "a-merk", eenheid: "225 gram", categorie: "snacks", icoon: "🍟", prijsNL: 2.49, prijsDE: 1.89, prijsBE: 2.19 },
  { id: "chips-doritos", naam: "Doritos Nacho Cheese", merk: "Doritos", merkType: "a-merk", eenheid: "185 gram", categorie: "snacks", icoon: "🧀", prijsNL: 2.79, prijsDE: 2.09, prijsBE: 2.39 },
  { id: "popcorn", naam: "Popcorn zoet", merkType: "huismerk", eenheid: "100 gram", categorie: "snacks", icoon: "🍿", prijsNL: 1.49, prijsDE: 0.99, prijsBE: 1.19 },
  { id: "choco-milka", naam: "Chocolade melk", merk: "Milka", merkType: "a-merk", eenheid: "100 gram", categorie: "snacks", icoon: "🍫", prijsNL: 1.79, prijsDE: 1.19, prijsBE: 1.39 },
  { id: "choco-tonys", naam: "Chocolade melk", merk: "Tony's", merkType: "a-merk", eenheid: "180 gram", categorie: "snacks", icoon: "🍫", prijsNL: 3.49, prijsDE: 3.19, prijsBE: 3.29 },
  { id: "stroopwafels", naam: "Stroopwafels", merk: "Jules Destrooper", merkType: "a-merk", eenheid: "10 stuks", categorie: "snacks", icoon: "🧇", prijsNL: 2.99, prijsDE: 2.29, prijsBE: 2.59 },
  { id: "koekjes-lu", naam: "Prince chocolade", merk: "LU", merkType: "a-merk", eenheid: "300 gram", categorie: "snacks", icoon: "🍪", prijsNL: 2.29, prijsDE: 1.59, prijsBE: 1.89 },
  { id: "drop", naam: "Drop gemengd", merk: "Venco", merkType: "a-merk", eenheid: "400 gram", categorie: "snacks", icoon: "🍬", prijsNL: 3.49, prijsDE: 2.79, prijsBE: 3.09 },
  { id: "mars", naam: "Mars", merk: "Mars", merkType: "a-merk", eenheid: "4 × 51 gram", categorie: "snacks", icoon: "🍫", prijsNL: 2.49, prijsDE: 1.79, prijsBE: 2.09 },
  { id: "snickers", naam: "Snickers", merk: "Snickers", merkType: "a-merk", eenheid: "4 × 50 gram", categorie: "snacks", icoon: "🍫", prijsNL: 2.49, prijsDE: 1.79, prijsBE: 2.09 },
  { id: "oreo", naam: "Oreo koekjes", merk: "Oreo", merkType: "a-merk", eenheid: "154 gram", categorie: "snacks", icoon: "🍪", prijsNL: 1.99, prijsDE: 1.39, prijsBE: 1.69 },
  { id: "ontbijtkoek", naam: "Ontbijtkoek", merk: "Peijnenburg", merkType: "a-merk", eenheid: "450 gram", categorie: "snacks", icoon: "🍞", prijsNL: 2.79, prijsDE: 2.19, prijsBE: 2.49 },

  // ═══════════════════════════════════════
  //  TABAK & SIGARETTEN
  // ═══════════════════════════════════════
  // Sigaretten pakjes (20 stuks)
  { id: "sig-marlboro", naam: "Sigaretten 20", merk: "Marlboro", merkType: "a-merk", eenheid: "20 stuks", categorie: "tabak", icoon: "🚬", prijsNL: 10.50, prijsDE: 9.10, prijsBE: 8.10 },
  { id: "sig-marlboro-gold", naam: "Sigaretten Gold 20", merk: "Marlboro", merkType: "a-merk", eenheid: "20 stuks", categorie: "tabak", icoon: "🚬", prijsNL: 10.50, prijsDE: 9.10, prijsBE: 8.10 },
  { id: "sig-lucky-strike", naam: "Sigaretten 20", merk: "Lucky Strike", merkType: "a-merk", eenheid: "20 stuks", categorie: "tabak", icoon: "🚬", prijsNL: 10.30, prijsDE: 9.00, prijsBE: 7.90 },
  { id: "sig-camel", naam: "Sigaretten 20", merk: "Camel", merkType: "a-merk", eenheid: "20 stuks", categorie: "tabak", icoon: "🚬", prijsNL: 10.30, prijsDE: 8.90, prijsBE: 7.80 },
  { id: "sig-winston", naam: "Sigaretten 20", merk: "Winston", merkType: "a-merk", eenheid: "20 stuks", categorie: "tabak", icoon: "🚬", prijsNL: 9.80, prijsDE: 8.50, prijsBE: 7.40 },
  { id: "sig-lm", naam: "Sigaretten 20", merk: "L&M", merkType: "a-merk", eenheid: "20 stuks", categorie: "tabak", icoon: "🚬", prijsNL: 9.80, prijsDE: 8.50, prijsBE: 7.40 },
  { id: "sig-philip-morris", naam: "Sigaretten 20", merk: "Philip Morris", merkType: "a-merk", eenheid: "20 stuks", categorie: "tabak", icoon: "🚬", prijsNL: 10.00, prijsDE: 8.70, prijsBE: 7.60 },

  // Sigaretten slof (200 stuks = 10 pakjes)
  { id: "sig-marlboro-slof", naam: "Sigaretten slof", merk: "Marlboro", merkType: "a-merk", eenheid: "10 × 20", categorie: "tabak", icoon: "🚬", prijsNL: 105.00, prijsDE: 91.00, prijsBE: 81.00 },
  { id: "sig-lucky-slof", naam: "Sigaretten slof", merk: "Lucky Strike", merkType: "a-merk", eenheid: "10 × 20", categorie: "tabak", icoon: "🚬", prijsNL: 103.00, prijsDE: 90.00, prijsBE: 79.00 },

  // Shag / rolshag (50 gr)
  { id: "shag-van-nelle", naam: "Shag", merk: "Van Nelle", merkType: "a-merk", eenheid: "50 gram", categorie: "tabak", icoon: "🌿", prijsNL: 12.80, prijsDE: 11.00, prijsBE: 9.50 },
  { id: "shag-drum", naam: "Shag", merk: "Drum", merkType: "a-merk", eenheid: "50 gram", categorie: "tabak", icoon: "🌿", prijsNL: 12.80, prijsDE: 11.00, prijsBE: 9.50 },
  { id: "shag-samson", naam: "Shag", merk: "Samson", merkType: "a-merk", eenheid: "50 gram", categorie: "tabak", icoon: "🌿", prijsNL: 12.50, prijsDE: 10.80, prijsBE: 9.30 },
  { id: "shag-javaanse", naam: "Shag", merk: "Javaanse Jongens", merkType: "a-merk", eenheid: "50 gram", categorie: "tabak", icoon: "🌿", prijsNL: 12.50, prijsDE: 10.80, prijsBE: 9.30 },

  // Vloei / aanstekers
  { id: "vloei-rizla", naam: "Vloeipapier", merk: "Rizla", merkType: "a-merk", eenheid: "50 vellen", categorie: "tabak", icoon: "📄", prijsNL: 0.99, prijsDE: 0.79, prijsBE: 0.85 },
  { id: "aansteker-bic", naam: "Aansteker", merk: "Bic", merkType: "a-merk", eenheid: "1 stuk", categorie: "tabak", icoon: "🔥", prijsNL: 1.99, prijsDE: 1.49, prijsBE: 1.69 },

  // ═══════════════════════════════════════
  //  STERKE DRANK
  // ═══════════════════════════════════════
  // Whisky
  { id: "whisky-johnnie-red", naam: "Red Label", merk: "Johnnie Walker", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 21.99, prijsDE: 15.99, prijsBE: 18.49 },
  { id: "whisky-jameson", naam: "Ierse whisky", merk: "Jameson", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 24.99, prijsDE: 17.99, prijsBE: 20.99 },
  { id: "whisky-jack", naam: "Tennessee whisky", merk: "Jack Daniel's", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 26.99, prijsDE: 19.99, prijsBE: 22.49 },
  { id: "whisky-ballantines", naam: "Finest", merk: "Ballantine's", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 19.99, prijsDE: 13.99, prijsBE: 16.49 },

  // Rum
  { id: "rum-bacardi", naam: "Carta Blanca", merk: "Bacardi", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 18.99, prijsDE: 13.49, prijsBE: 15.49 },
  { id: "rum-captain-morgan", naam: "Spiced Gold", merk: "Captain Morgan", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 19.99, prijsDE: 14.49, prijsBE: 16.99 },
  { id: "rum-havana", naam: "Añejo 3 años", merk: "Havana Club", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 20.99, prijsDE: 14.99, prijsBE: 17.49 },

  // Wodka
  { id: "wodka-smirnoff", naam: "Red Label", merk: "Smirnoff", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🍸", prijsNL: 16.99, prijsDE: 11.99, prijsBE: 13.99 },
  { id: "wodka-absolut", naam: "Original", merk: "Absolut", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🍸", prijsNL: 19.99, prijsDE: 14.49, prijsBE: 16.49 },

  // Gin
  { id: "gin-bombay", naam: "Sapphire", merk: "Bombay", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🍸", prijsNL: 22.99, prijsDE: 16.49, prijsBE: 18.99 },
  { id: "gin-hendricks", naam: "Gin", merk: "Hendrick's", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🍸", prijsNL: 34.99, prijsDE: 24.99, prijsBE: 28.99 },
  { id: "gin-gordons", naam: "London Dry", merk: "Gordon's", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🍸", prijsNL: 17.99, prijsDE: 12.99, prijsBE: 14.99 },

  // Jenever & likeur
  { id: "jenever-bols", naam: "Jonge jenever", merk: "Bols", merkType: "a-merk", eenheid: "1 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 15.99, prijsDE: 13.49, prijsBE: 14.49 },
  { id: "jenever-hartevelt", naam: "Jonge jenever", merk: "Hartevelt", merkType: "a-merk", eenheid: "1 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 14.99, prijsDE: 12.49, prijsBE: 13.49 },
  { id: "likeur-baileys", naam: "Original", merk: "Baileys", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🍾", prijsNL: 17.99, prijsDE: 12.49, prijsBE: 14.99 },
  { id: "amaretto-disaronno", naam: "Amaretto", merk: "Disaronno", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🍾", prijsNL: 19.99, prijsDE: 14.49, prijsBE: 16.99 },

  // Cognac / brandy
  { id: "cognac-hennessy", naam: "V.S.", merk: "Hennessy", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 46.99, prijsDE: 33.99, prijsBE: 38.99 },
  { id: "martini-bianco", naam: "Bianco", merk: "Martini", merkType: "a-merk", eenheid: "1 liter", categorie: "sterke-drank", icoon: "🍸", prijsNL: 11.99, prijsDE: 8.49, prijsBE: 9.99 },

  // Tequila
  { id: "tequila-jose", naam: "Silver", merk: "José Cuervo", merkType: "a-merk", eenheid: "0.7 liter", categorie: "sterke-drank", icoon: "🥃", prijsNL: 19.99, prijsDE: 14.49, prijsBE: 16.99 },
];
