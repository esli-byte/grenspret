export type Categorie =
  | "zuivel"
  | "vlees"
  | "dranken"
  | "verzorging"
  | "basis";

export type Product = {
  id: string;
  naam: string;
  eenheid: string;
  categorie: Categorie;
  prijsNL: number;
  prijsDE: number;
  prijsBE: number;
};

export const CATEGORIE_LABELS: Record<Categorie, { label: string; icoon: string }> = {
  zuivel: { label: "Zuivel", icoon: "🧀" },
  vlees: { label: "Vlees", icoon: "🥩" },
  dranken: { label: "Dranken", icoon: "🥤" },
  verzorging: { label: "Verzorging", icoon: "🧴" },
  basis: { label: "Basisproducten", icoon: "🌾" },
};

export const PRODUCTEN: Product[] = [
  // Zuivel
  { id: "melk", naam: "Volle melk", eenheid: "1 liter", categorie: "zuivel", prijsNL: 1.29, prijsDE: 1.09, prijsBE: 1.15 },
  { id: "kaas-jong", naam: "Jonge kaas", eenheid: "1 kg", categorie: "zuivel", prijsNL: 10.99, prijsDE: 7.99, prijsBE: 8.49 },
  { id: "boter", naam: "Roomboter", eenheid: "250 gram", categorie: "zuivel", prijsNL: 2.49, prijsDE: 1.89, prijsBE: 2.09 },
  { id: "yoghurt", naam: "Yoghurt natuur", eenheid: "500 gram", categorie: "zuivel", prijsNL: 1.09, prijsDE: 0.79, prijsBE: 0.89 },

  // Vlees
  { id: "gehakt", naam: "Half-om-half gehakt", eenheid: "500 gram", categorie: "vlees", prijsNL: 4.49, prijsDE: 3.29, prijsBE: 3.69 },
  { id: "kipfilet", naam: "Kipfilet", eenheid: "500 gram", categorie: "vlees", prijsNL: 4.99, prijsDE: 3.79, prijsBE: 4.19 },
  { id: "speklappen", naam: "Speklappen", eenheid: "500 gram", categorie: "vlees", prijsNL: 4.29, prijsDE: 3.19, prijsBE: 3.49 },
  { id: "rookworst", naam: "Rookworst", eenheid: "275 gram", categorie: "vlees", prijsNL: 2.79, prijsDE: 2.19, prijsBE: 2.39 },

  // Dranken
  { id: "bier", naam: "Pils (krat)", eenheid: "24 × 0.3L", categorie: "dranken", prijsNL: 12.99, prijsDE: 8.49, prijsBE: 9.99 },
  { id: "cola", naam: "Coca-Cola", eenheid: "1.5 liter", categorie: "dranken", prijsNL: 1.89, prijsDE: 1.29, prijsBE: 1.49 },
  { id: "koffie", naam: "Filterkoffie", eenheid: "500 gram", categorie: "dranken", prijsNL: 5.49, prijsDE: 4.29, prijsBE: 4.69 },
  { id: "wijn", naam: "Rode wijn (huismerk)", eenheid: "0.75 liter", categorie: "dranken", prijsNL: 3.99, prijsDE: 2.49, prijsBE: 2.99 },

  // Verzorging
  { id: "tandpasta", naam: "Tandpasta", eenheid: "75 ml", categorie: "verzorging", prijsNL: 2.29, prijsDE: 1.45, prijsBE: 1.69 },
  { id: "shampoo", naam: "Shampoo", eenheid: "250 ml", categorie: "verzorging", prijsNL: 2.99, prijsDE: 1.95, prijsBE: 2.29 },
  { id: "waspoeder", naam: "Waspoeder", eenheid: "1.35 kg", categorie: "verzorging", prijsNL: 8.99, prijsDE: 5.99, prijsBE: 6.99 },
  { id: "wc-papier", naam: "Toiletpapier", eenheid: "8 rollen", categorie: "verzorging", prijsNL: 4.49, prijsDE: 2.99, prijsBE: 3.49 },

  // Basisproducten
  { id: "suiker", naam: "Witte suiker", eenheid: "1 kg", categorie: "basis", prijsNL: 1.19, prijsDE: 0.85, prijsBE: 0.95 },
  { id: "bloem", naam: "Tarwebloem", eenheid: "1 kg", categorie: "basis", prijsNL: 0.99, prijsDE: 0.59, prijsBE: 0.75 },
  { id: "pasta", naam: "Spaghetti", eenheid: "500 gram", categorie: "basis", prijsNL: 1.19, prijsDE: 0.69, prijsBE: 0.85 },
  { id: "olijfolie", naam: "Olijfolie", eenheid: "500 ml", categorie: "basis", prijsNL: 5.49, prijsDE: 3.99, prijsBE: 4.29 },
];
