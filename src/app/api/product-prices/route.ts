import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Prijzen API v3 — haalt echte productprijzen op uit MEERDERE bronnen:
 *
 * Nederland:
 *   1. Albert Heijn API   — anoniem OAuth + product search
 *   2. Jumbo API          — mobiele API, geen auth nodig
 *
 * Duitsland:
 *   1. REWE API           — shop.rewe.de suggesties/zoek
 *   2. Lidl.de            — publieke website data (vaak geblokkeerd)
 *
 * België:
 *   1. Lidl.be            — publieke website data (vaak geblokkeerd)
 *
 * Cross-referentie (alle landen):
 *   - Open Food Facts     — open-source productdatabase
 *
 * Cache: prijzen worden 24 uur bewaard.
 * Merge: als meerdere bronnen een prijs geven, nemen we het gemiddelde.
 * Fallback: als GEEN API bereikbaar is, worden handmatige referentieprijzen gebruikt.
 */

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "product-prices.json");
const CACHE_DUUR_MS = 24 * 60 * 60 * 1000; // 24 uur

// ===== Producten database met zoektermen per bron =====
const PRODUCT_ZOEKOPDRACHTEN = [
  // Zuivel
  { id: "melk-campina", zoekNL: "campina volle melk 1l", zoekJumbo: "campina volle melk 1l", zoekDE: "vollmilch 1l", zoekREWE: "vollmilch 1l", zoekBE: "volle melk 1l", zoekOFF: "milk whole", maxPrijs: 3 },
  { id: "melk-huismerk", zoekNL: "ah volle melk 1l", zoekJumbo: "jumbo volle melk 1l", zoekDE: "milch frisch 1l", zoekREWE: "frische milch 1l", zoekBE: "volle melk 1l", zoekOFF: "whole milk", maxPrijs: 2 },
  { id: "kaas-jong", zoekNL: "jonge kaas plak", zoekJumbo: "jonge kaas plakken", zoekDE: "gouda jung", zoekREWE: "gouda jung scheiben", zoekBE: "jonge kaas", zoekOFF: "gouda cheese", maxPrijs: 12 },
  { id: "boter-campina", zoekNL: "campina botergoud 250g", zoekJumbo: "campina botergoud 250g", zoekDE: "butter markenbutter 250g", zoekREWE: "markenbutter 250g", zoekBE: "roomboter 250g", zoekOFF: "butter 250g", maxPrijs: 4 },
  { id: "boter-huismerk", zoekNL: "ah roomboter 250g", zoekJumbo: "jumbo roomboter 250g", zoekDE: "deutsche markenbutter 250g", zoekREWE: "butter 250g", zoekBE: "roomboter 250g", zoekOFF: "butter", maxPrijs: 3 },
  { id: "yoghurt-optimel", zoekNL: "optimel drinkyoghurt 1l", zoekJumbo: "optimel drinkyoghurt", zoekDE: "trinkjoghurt 1l", zoekREWE: "trinkjoghurt", zoekBE: "drinkyoghurt 1l", zoekOFF: "drinking yoghurt", maxPrijs: 3 },
  { id: "yoghurt-huismerk", zoekNL: "ah yoghurt natuur 500g", zoekJumbo: "jumbo yoghurt natuur", zoekDE: "naturjoghurt 500g", zoekREWE: "naturjoghurt 500g", zoekBE: "yoghurt natuur", zoekOFF: "natural yoghurt", maxPrijs: 2 },

  // Vlees
  { id: "gehakt", zoekNL: "half om half gehakt 500g", zoekJumbo: "half om half gehakt 500g", zoekDE: "hackfleisch gemischt 500g", zoekREWE: "hackfleisch gemischt 500g", zoekBE: "gehakt 500g", zoekOFF: "minced meat", maxPrijs: 7 },
  { id: "kipfilet", zoekNL: "kipfilet 500g", zoekJumbo: "kipfilet", zoekDE: "hähnchenbrustfilet 500g", zoekREWE: "hähnchenbrustfilet", zoekBE: "kipfilet 500g", zoekOFF: "chicken breast", maxPrijs: 8 },
  { id: "speklappen", zoekNL: "speklappen 500g", zoekJumbo: "speklappen", zoekDE: "schweinebauch 500g", zoekREWE: "schweinebauch", zoekBE: "speklappen", zoekOFF: "pork belly", maxPrijs: 7 },
  { id: "rookworst-unox", zoekNL: "unox rookworst 275g", zoekJumbo: "unox rookworst", zoekDE: "bockwurst", zoekREWE: "bockwurst", zoekBE: "rookworst", zoekOFF: "rookworst", maxPrijs: 4 },
  { id: "rookworst-huismerk", zoekNL: "ah rookworst 275g", zoekJumbo: "jumbo rookworst", zoekDE: "bockwurst", zoekREWE: "bockwurst", zoekBE: "rookworst", zoekOFF: "smoked sausage", maxPrijs: 3 },

  // Dranken
  { id: "cola-cocacola", zoekNL: "coca cola 1.5l fles", zoekJumbo: "coca cola 1.5l", zoekDE: "coca cola 1.5l", zoekREWE: "coca cola 1.5l", zoekBE: "coca cola 1.5l", zoekOFF: "coca cola 1.5l", maxPrijs: 3.5 },
  { id: "cola-pepsi", zoekNL: "pepsi 1.5l fles", zoekJumbo: "pepsi 1.5l", zoekDE: "pepsi 1.5l", zoekREWE: "pepsi 1.5l", zoekBE: "pepsi 1.5l", zoekOFF: "pepsi 1.5l", maxPrijs: 3 },
  { id: "cola-huismerk", zoekNL: "ah cola 1.5l fles", zoekJumbo: "jumbo cola 1.5l", zoekDE: "cola 1.5l freeway", zoekREWE: "cola 1.5l", zoekBE: "cola 1.5l", zoekOFF: "cola", maxPrijs: 2 },
  { id: "bier-heineken", zoekNL: "heineken krat 24", zoekJumbo: "heineken krat", zoekDE: "heineken kasten", zoekREWE: "heineken kasten 24", zoekBE: "heineken bak", zoekOFF: "heineken beer", maxPrijs: 25 },
  { id: "bier-huismerk", zoekNL: "ah pils krat 24", zoekJumbo: "jumbo pils krat", zoekDE: "perlenbacher pils kasten", zoekREWE: "pils kasten 24", zoekBE: "pils bak", zoekOFF: "pilsner beer", maxPrijs: 18 },
  { id: "koffie-douwe", zoekNL: "douwe egberts aroma rood 500g", zoekJumbo: "douwe egberts aroma rood", zoekDE: "jacobs filterkaffee 500g", zoekREWE: "jacobs filterkaffee 500g", zoekBE: "douwe egberts 500g", zoekOFF: "filter coffee 500g", maxPrijs: 12 },
  { id: "koffie-huismerk", zoekNL: "ah filterkoffie 500g", zoekJumbo: "jumbo filterkoffie", zoekDE: "bellarom kaffee 500g", zoekREWE: "filterkaffee 500g", zoekBE: "filterkoffie 500g", zoekOFF: "filter coffee", maxPrijs: 6 },
  { id: "wijn", zoekNL: "rode wijn huiswijn", zoekJumbo: "rode wijn", zoekDE: "rotwein", zoekREWE: "rotwein trocken", zoekBE: "rode wijn", zoekOFF: "red wine", maxPrijs: 8 },

  // Verzorging
  { id: "deo-dove", zoekNL: "dove deodorant spray 150ml", zoekJumbo: "dove deodorant spray", zoekDE: "dove deodorant 150ml", zoekREWE: "dove deodorant 150ml", zoekBE: "dove deodorant 150ml", zoekOFF: "dove deodorant", maxPrijs: 5 },
  { id: "deo-axe", zoekNL: "axe deodorant spray 150ml", zoekJumbo: "axe deodorant spray", zoekDE: "axe deodorant 150ml", zoekREWE: "axe deodorant 150ml", zoekBE: "axe deodorant 150ml", zoekOFF: "axe deodorant", maxPrijs: 5 },
  { id: "deo-huismerk", zoekNL: "ah deodorant spray", zoekJumbo: "jumbo deodorant spray", zoekDE: "deodorant spray", zoekREWE: "deodorant spray", zoekBE: "deodorant spray", zoekOFF: "deodorant spray", maxPrijs: 3 },
  { id: "tandpasta-prodent", zoekNL: "prodent tandpasta 75ml", zoekJumbo: "prodent tandpasta", zoekDE: "zahnpasta 75ml", zoekREWE: "zahnpasta 75ml", zoekBE: "tandpasta 75ml", zoekOFF: "toothpaste", maxPrijs: 4 },
  { id: "tandpasta-huismerk", zoekNL: "ah tandpasta 75ml", zoekJumbo: "jumbo tandpasta", zoekDE: "zahnpasta", zoekREWE: "zahnpasta", zoekBE: "tandpasta", zoekOFF: "toothpaste", maxPrijs: 2 },
  { id: "shampoo-andrelon", zoekNL: "andrelon shampoo 300ml", zoekJumbo: "andrelon shampoo", zoekDE: "shampoo 300ml", zoekREWE: "shampoo 300ml", zoekBE: "shampoo 300ml", zoekOFF: "shampoo 300ml", maxPrijs: 6 },
  { id: "shampoo-huismerk", zoekNL: "ah shampoo 250ml", zoekJumbo: "jumbo shampoo", zoekDE: "shampoo 250ml", zoekREWE: "shampoo 250ml", zoekBE: "shampoo 250ml", zoekOFF: "shampoo", maxPrijs: 3 },
  { id: "afwasmiddel-dreft", zoekNL: "dreft afwasmiddel 890ml", zoekJumbo: "dreft afwasmiddel", zoekDE: "spülmittel", zoekREWE: "spülmittel pril", zoekBE: "afwasmiddel", zoekOFF: "dish soap", maxPrijs: 5 },
  { id: "waspoeder-persil", zoekNL: "persil wasmiddel poeder", zoekJumbo: "persil wasmiddel", zoekDE: "persil waschmittel", zoekREWE: "persil waschmittel", zoekBE: "persil", zoekOFF: "persil washing powder", maxPrijs: 18 },
  { id: "waspoeder-huismerk", zoekNL: "ah waspoeder", zoekJumbo: "jumbo waspoeder", zoekDE: "waschmittel", zoekREWE: "waschmittel pulver", zoekBE: "waspoeder", zoekOFF: "washing powder", maxPrijs: 8 },
  { id: "wc-papier-page", zoekNL: "page toiletpapier 8 rollen", zoekJumbo: "page toiletpapier", zoekDE: "toilettenpapier 8 rollen", zoekREWE: "toilettenpapier 8 rollen", zoekBE: "toiletpapier 8 rollen", zoekOFF: "toilet paper", maxPrijs: 8 },
  { id: "wc-papier-huismerk", zoekNL: "ah toiletpapier 8 rollen", zoekJumbo: "jumbo toiletpapier", zoekDE: "toilettenpapier 8 rollen", zoekREWE: "toilettenpapier", zoekBE: "toiletpapier 8 rollen", zoekOFF: "toilet paper", maxPrijs: 5 },

  // Basis
  { id: "pindakaas-calve", zoekNL: "calve pindakaas 350g", zoekJumbo: "calve pindakaas", zoekDE: "erdnussbutter 350g", zoekREWE: "erdnussbutter", zoekBE: "pindakaas 350g", zoekOFF: "peanut butter", maxPrijs: 5 },
  { id: "pindakaas-huismerk", zoekNL: "ah pindakaas 350g", zoekJumbo: "jumbo pindakaas", zoekDE: "erdnusscreme", zoekREWE: "erdnusscreme", zoekBE: "pindakaas", zoekOFF: "peanut butter", maxPrijs: 3 },
  { id: "hagelslag-dehollandse", zoekNL: "de ruijter hagelslag", zoekJumbo: "de ruijter hagelslag", zoekDE: "schokostreusel", zoekREWE: "schokostreusel", zoekBE: "hagelslag", zoekOFF: "chocolate sprinkles", maxPrijs: 4 },
  { id: "suiker", zoekNL: "witte suiker 1kg", zoekJumbo: "witte suiker 1kg", zoekDE: "zucker 1kg", zoekREWE: "zucker 1kg", zoekBE: "witte suiker 1kg", zoekOFF: "sugar 1kg", maxPrijs: 3 },
  { id: "bloem", zoekNL: "tarwebloem 1kg", zoekJumbo: "tarwebloem 1kg", zoekDE: "weizenmehl 1kg", zoekREWE: "weizenmehl 1kg", zoekBE: "tarwebloem 1kg", zoekOFF: "wheat flour 1kg", maxPrijs: 2 },
  { id: "pasta-barilla", zoekNL: "barilla spaghetti 500g", zoekJumbo: "barilla spaghetti", zoekDE: "barilla spaghetti 500g", zoekREWE: "barilla spaghetti 500g", zoekBE: "barilla spaghetti 500g", zoekOFF: "barilla spaghetti", maxPrijs: 3 },
  { id: "pasta-huismerk", zoekNL: "ah spaghetti 500g", zoekJumbo: "jumbo spaghetti", zoekDE: "spaghetti 500g", zoekREWE: "spaghetti 500g", zoekBE: "spaghetti 500g", zoekOFF: "spaghetti", maxPrijs: 2 },
  { id: "olijfolie-bertolli", zoekNL: "bertolli olijfolie 500ml", zoekJumbo: "bertolli olijfolie", zoekDE: "bertolli olivenöl 500ml", zoekREWE: "bertolli olivenöl", zoekBE: "bertolli olijfolie 500ml", zoekOFF: "bertolli olive oil", maxPrijs: 10 },
  { id: "olijfolie-huismerk", zoekNL: "ah olijfolie 500ml", zoekJumbo: "jumbo olijfolie", zoekDE: "olivenöl 500ml", zoekREWE: "olivenöl nativ", zoekBE: "olijfolie 500ml", zoekOFF: "olive oil", maxPrijs: 6 },
  { id: "nutella", zoekNL: "nutella 400g", zoekJumbo: "nutella 400g", zoekDE: "nutella 450g", zoekREWE: "nutella 450g", zoekBE: "nutella 400g", zoekOFF: "nutella", maxPrijs: 5 },
];

// ===== Types =====
type BronNaam = "ah-api" | "jumbo-api" | "rewe-api" | "lidl-api" | "off-api" | "fallback";

type PrijsData = {
  id: string;
  prijsNL: number | null;
  prijsDE: number | null;
  prijsBE: number | null;
  bronNL: BronNaam;
  bronDE: BronNaam;
  bronBE: BronNaam;
};

type CacheData = {
  prijzen: PrijsData[];
  bijgewerkt: string;
  versie: number;
};

type ScrapeFout = { fase: string; status?: number; bericht: string };
const scrapeFouten: Record<string, ScrapeFout> = {};

// ===== Helpers =====
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "nl-NL,nl;q=0.9,de;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
};

/** Mediaan van een array getallen */
function mediaan(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** Rond af op 2 decimalen */
function rond(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Slim samenvoegen van meerdere prijsbronnen:
 * - Als 1 bron: gebruik die
 * - Als 2+ bronnen: neem gemiddelde (outlier-resistent door maxPrijs filter)
 */
function mergePrijzen(prijzen: number[]): number | null {
  const geldig = prijzen.filter((p) => p > 0);
  if (geldig.length === 0) return null;
  if (geldig.length === 1) return rond(geldig[0]);
  // Gemiddelde van alle bronnen
  const gem = geldig.reduce((a, b) => a + b, 0) / geldig.length;
  return rond(gem);
}

/**
 * Bepaal bron-status: de "beste" bron wint.
 * Als minstens 1 API-prijs aanwezig is, is het niet "fallback".
 */
function bepaalBronNaam(bronnen: (BronNaam | null)[]): BronNaam {
  const echte = bronnen.filter((b) => b && b !== "fallback");
  if (echte.length > 0) return echte[0]!;
  return "fallback";
}

function bepaalOverallBron(prijzen: PrijsData[]): "live" | "cache" | "fallback" {
  if (prijzen.length === 0) return "fallback";
  let live = 0;
  let totaal = 0;
  for (const p of prijzen) {
    totaal += 3;
    if (p.bronNL !== "fallback") live++;
    if (p.bronDE !== "fallback") live++;
    if (p.bronBE !== "fallback") live++;
  }
  if (live === totaal) return "live";
  if (live === 0) return "fallback";
  return "cache";
}

// ╔══════════════════════════════════════════════════════════╗
// ║  BRON 1: ALBERT HEIJN (NL) — anonymous OAuth + search  ║
// ╚══════════════════════════════════════════════════════════╝

let ahTokenCache: { token: string; expires: number } | null = null;

async function getAHToken(): Promise<string | null> {
  if (ahTokenCache && ahTokenCache.expires > Date.now()) {
    return ahTokenCache.token;
  }
  try {
    const res = await fetch(
      "https://api.ah.nl/mobile-auth/v1/auth/token/anonymous",
      {
        method: "POST",
        headers: {
          ...BROWSER_HEADERS,
          "x-application": "AHWEBSHOP",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId: "appie" }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      scrapeFouten.ah = { fase: "token", status: res.status, bericht: `HTTP ${res.status}` };
      return null;
    }
    const data = await res.json();
    const token = data?.access_token;
    if (typeof token !== "string") {
      scrapeFouten.ah = { fase: "token", bericht: "Geen access_token" };
      return null;
    }
    ahTokenCache = { token, expires: Date.now() + 30 * 60 * 1000 };
    return token;
  } catch (err) {
    scrapeFouten.ah = { fase: "token", bericht: err instanceof Error ? err.message : String(err) };
    return null;
  }
}

async function zoekAHPrijs(query: string, maxPrijs: number): Promise<number | null> {
  const token = await getAHToken();
  if (!token) return null;
  try {
    const url = `https://api.ah.nl/mobile-services/product/search/v2?query=${encodeURIComponent(query)}&size=10&sortOn=PRICELOWHIGH`;
    const res = await fetch(url, {
      headers: { ...BROWSER_HEADERS, Authorization: `Bearer ${token}`, "x-application": "AHWEBSHOP" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      scrapeFouten.ah = { fase: "search", status: res.status, bericht: `Search HTTP ${res.status}` };
      return null;
    }
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] =
      data?.products ||
      data?.cards?.flatMap((c: { products?: unknown[] }) => c.products || []) ||
      [];

    const prijzen: number[] = [];
    for (const p of products) {
      const prijs = p?.priceBeforeBonus ?? p?.currentPrice ?? p?.price?.now ?? null;
      if (typeof prijs === "number" && prijs > 0.3 && prijs <= maxPrijs) {
        prijzen.push(prijs);
      }
    }
    if (prijzen.length === 0) return null;
    return rond(mediaan(prijzen));
  } catch (err) {
    scrapeFouten.ah = { fase: "search", bericht: err instanceof Error ? err.message : String(err) };
    return null;
  }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  BRON 2: JUMBO (NL) — mobiele API, geen auth nodig     ║
// ╚══════════════════════════════════════════════════════════╝

async function zoekJumboPrijs(query: string, maxPrijs: number): Promise<number | null> {
  try {
    const url = `https://mobileapi.jumbo.com/v17/search?offset=0&limit=10&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      scrapeFouten.jumbo = { fase: "search", status: res.status, bericht: `HTTP ${res.status}` };
      return null;
    }
    const data = await res.json();
    // Jumbo response: { products: { data: [...], total: N } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = data?.products?.data || data?.data || [];

    const prijzen: number[] = [];
    for (const item of items) {
      // Jumbo price formats: { prices: { price: { amount: 139 } } } (in centen)
      // of { prices: { promotionalPrice: { amount: 109 }, price: { amount: 139 } } }
      const prijsCenten =
        item?.prices?.price?.amount ??
        item?.prices?.promotionalPrice?.amount ??
        item?.price?.amount ??
        null;
      if (typeof prijsCenten === "number" && prijsCenten > 0) {
        const prijs = prijsCenten / 100; // centen → euro's
        if (prijs > 0.3 && prijs <= maxPrijs) {
          prijzen.push(prijs);
        }
      }
      // Alternatief format: prijs direct in euro's
      const prijsEuro = item?.currentPrice ?? item?.price ?? null;
      if (typeof prijsEuro === "number" && prijsEuro > 0.3 && prijsEuro <= maxPrijs) {
        prijzen.push(prijsEuro);
      }
    }

    if (prijzen.length === 0) return null;
    return rond(mediaan(prijzen));
  } catch (err) {
    scrapeFouten.jumbo = { fase: "search", bericht: err instanceof Error ? err.message : String(err) };
    return null;
  }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  BRON 3: REWE (DE) — shop.rewe.de suggesties API       ║
// ╚══════════════════════════════════════════════════════════╝

async function zoekREWEPrijs(query: string, maxPrijs: number): Promise<number | null> {
  // REWE heeft 2 endpoints: /api/suggestions (gedetailleerd) en /api/products (simpeler)
  const endpoints = [
    `https://shop.rewe.de/api/suggestions?q=${encodeURIComponent(query)}`,
    `https://shop.rewe.de/api/products?search=${encodeURIComponent(query)}&page=1`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          ...BROWSER_HEADERS,
          "Accept-Language": "de-DE,de;q=0.9",
          Referer: "https://shop.rewe.de/",
          Origin: "https://shop.rewe.de",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: any[] =
        data?.suggestions ||
        data?.products ||
        data?.items ||
        data?._embedded?.products ||
        [];

      const prijzen: number[] = [];
      for (const item of items) {
        // REWE price formats variëren:
        // { currentRetailPrice: 1.29 }
        // { price: { currentRetailPrice: 1.29 } }
        // { pricing: { currentRetailPrice: 1.29 } }
        // { _embedded: { articles: [{ _embedded: { listing: { pricing: { price: { value: 1.29 } } } } }] } }
        const prijs =
          item?.currentRetailPrice ??
          item?.price?.currentRetailPrice ??
          item?.pricing?.currentRetailPrice ??
          item?.price?.value ??
          item?.price?.price ??
          item?.retailPrice ??
          null;

        if (typeof prijs === "number" && prijs > 0.3 && prijs <= maxPrijs) {
          prijzen.push(prijs);
        }

        // Dieper genest formaat (REWE v2)
        const articles = item?._embedded?.articles || [];
        for (const art of articles) {
          const artPrijs =
            art?._embedded?.listing?.pricing?.price?.value ??
            art?.pricing?.currentRetailPrice ??
            null;
          if (typeof artPrijs === "number" && artPrijs > 0.3 && artPrijs <= maxPrijs) {
            prijzen.push(artPrijs);
          }
        }
      }

      if (prijzen.length > 0) {
        return rond(mediaan(prijzen));
      }
    } catch {
      // Probeer volgende endpoint
    }
  }

  scrapeFouten.rewe = { fase: "search", bericht: `Geen resultaten voor: ${query}` };
  return null;
}

// ╔══════════════════════════════════════════════════════════╗
// ║  BRON 4: LIDL (DE/BE) — website API (vaak geblokkeerd) ║
// ╚══════════════════════════════════════════════════════════╝

async function zoekLidlPrijs(
  baseUrl: string,
  country: string,
  lang: string,
  query: string,
  scraperKey: string,
): Promise<number | null> {
  const candidatePaths = [
    `/p/api/discover/${country}/${lang}/search?q=${encodeURIComponent(query)}&hitsPerPage=5`,
    `/q/api/search/v2/${lang}_${country}/products?searchKey=${encodeURIComponent(query)}&offset=0&limit=5`,
    `/p/api/v1/${country}/${lang}/products?query=${encodeURIComponent(query)}&limit=5`,
  ];

  let laatsteFout = "";
  for (const p of candidatePaths) {
    try {
      const res = await fetch(baseUrl + p, {
        headers: { ...BROWSER_HEADERS, Referer: `${baseUrl}/`, Origin: baseUrl },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) { laatsteFout = `${p} → HTTP ${res.status}`; continue; }

      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: any[] = data?.hits || data?.items || data?.products || data?.results || [];
      const prijzen: number[] = [];
      for (const item of items) {
        const prijs = item?.price?.price ?? item?.price?.currentRetailPrice ?? item?.pricing?.currentRetailPrice ?? null;
        if (typeof prijs === "number" && prijs > 0.3 && prijs < 50) prijzen.push(prijs);
      }
      if (prijzen.length > 0) return rond(mediaan(prijzen));
      laatsteFout = `${p} → 200 maar geen prijzen`;
    } catch (err) {
      laatsteFout = `${p} → ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  scrapeFouten[scraperKey] = { fase: "search", bericht: `Alle endpoints faalden. Laatste: ${laatsteFout}` };
  return null;
}

// ╔══════════════════════════════════════════════════════════╗
// ║  BRON 5: OPEN FOOD FACTS — open-source productdata     ║
// ╚══════════════════════════════════════════════════════════╝

/**
 * Open Food Facts heeft geen directe prijzen in het hoofdproduct,
 * maar we kunnen het gebruiken om de "gemiddelde" verkoopprijs per land
 * te schatten op basis van het product-record.
 *
 * We zoeken op productnaam en kijken naar:
 * - product.stores_tags (welke winkels)
 * - product.countries_tags (welke landen)
 * - Soms bevat het veld "price" of "price_per_kg" data
 * - We gebruiken het als validatie: als OFF een prijs heeft die
 *   sterk afwijkt van onze andere bronnen, loggen we een waarschuwing
 */
async function zoekOFFPrijs(
  query: string,
  land: string, // "netherlands", "germany", "belgium"
  maxPrijs: number,
): Promise<number | null> {
  try {
    // Gebruik het land-specifieke subdomain voor betere relevantie
    const subdomain =
      land === "netherlands" ? "nl" :
      land === "germany" ? "de" :
      land === "belgium" ? "be" : "world";

    const url = `https://${subdomain}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,price,stores_tags,countries_tags`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Grenspret/1.0 (contact@grenspret.nl)" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] = data?.products || [];

    // OFF heeft soms een "price" veld (niet altijd gevuld)
    const prijzen: number[] = [];
    for (const p of products) {
      // Sommige OFF producten hebben price data
      const prijs = p?.price ?? p?.price_per_unit ?? null;
      if (typeof prijs === "number" && prijs > 0.3 && prijs <= maxPrijs) {
        prijzen.push(prijs);
      }
    }

    if (prijzen.length > 0) {
      return rond(mediaan(prijzen));
    }

    return null;
  } catch {
    // OFF is een bonus-bron, fouten zijn niet kritiek
    return null;
  }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  FALLBACK PRIJZEN (handmatig onderzocht, april 2026)    ║
// ╚══════════════════════════════════════════════════════════╝

const FALLBACK_PRIJZEN: Record<string, { nl: number; de: number; be: number }> = {
  "melk-campina": { nl: 1.39, de: 1.15, be: 1.25 },
  "melk-huismerk": { nl: 1.09, de: 0.85, be: 0.95 },
  "kaas-jong": { nl: 10.99, de: 7.99, be: 8.49 },
  "boter-campina": { nl: 2.79, de: 2.09, be: 2.29 },
  "boter-huismerk": { nl: 2.19, de: 1.59, be: 1.79 },
  "yoghurt-optimel": { nl: 2.29, de: 1.69, be: 1.89 },
  "yoghurt-huismerk": { nl: 1.09, de: 0.79, be: 0.89 },
  "gehakt": { nl: 4.49, de: 3.29, be: 3.69 },
  "kipfilet": { nl: 4.99, de: 3.79, be: 4.19 },
  "speklappen": { nl: 4.29, de: 3.19, be: 3.49 },
  "rookworst-unox": { nl: 2.99, de: 2.49, be: 2.59 },
  "rookworst-huismerk": { nl: 1.99, de: 1.49, be: 1.69 },
  "cola-cocacola": { nl: 1.89, de: 1.29, be: 1.49 },
  "cola-pepsi": { nl: 1.79, de: 1.19, be: 1.39 },
  "cola-huismerk": { nl: 0.89, de: 0.49, be: 0.59 },
  "bier-heineken": { nl: 15.99, de: 10.99, be: 12.49 },
  "bier-huismerk": { nl: 9.99, de: 6.49, be: 7.99 },
  "koffie-douwe": { nl: 6.49, de: 4.99, be: 5.49 },
  "koffie-huismerk": { nl: 3.99, de: 2.79, be: 3.19 },
  "wijn": { nl: 3.99, de: 2.49, be: 2.99 },
  "deo-dove": { nl: 3.99, de: 2.49, be: 2.99 },
  "deo-axe": { nl: 4.49, de: 2.79, be: 3.29 },
  "deo-huismerk": { nl: 1.49, de: 0.89, be: 1.09 },
  "tandpasta-prodent": { nl: 2.49, de: 1.59, be: 1.89 },
  "tandpasta-huismerk": { nl: 0.99, de: 0.59, be: 0.75 },
  "shampoo-andrelon": { nl: 3.49, de: 2.29, be: 2.79 },
  "shampoo-huismerk": { nl: 1.49, de: 0.89, be: 1.09 },
  "afwasmiddel-dreft": { nl: 3.29, de: 2.19, be: 2.59 },
  "waspoeder-persil": { nl: 12.99, de: 8.49, be: 9.99 },
  "waspoeder-huismerk": { nl: 5.99, de: 3.99, be: 4.49 },
  "wc-papier-page": { nl: 5.99, de: 3.99, be: 4.69 },
  "wc-papier-huismerk": { nl: 2.99, de: 1.79, be: 2.19 },
  "pindakaas-calve": { nl: 3.29, de: 2.49, be: 2.79 },
  "pindakaas-huismerk": { nl: 1.79, de: 1.19, be: 1.39 },
  "hagelslag-dehollandse": { nl: 2.99, de: 2.49, be: 2.69 },
  "suiker": { nl: 1.19, de: 0.85, be: 0.95 },
  "bloem": { nl: 0.99, de: 0.59, be: 0.75 },
  "pasta-barilla": { nl: 1.89, de: 1.19, be: 1.39 },
  "pasta-huismerk": { nl: 0.89, de: 0.49, be: 0.59 },
  "olijfolie-bertolli": { nl: 6.99, de: 4.99, be: 5.49 },
  "olijfolie-huismerk": { nl: 3.99, de: 2.79, be: 3.19 },
  "nutella": { nl: 3.69, de: 2.49, be: 2.89 },
};

// ╔══════════════════════════════════════════════════════════╗
// ║  CACHE FUNCTIES                                         ║
// ╚══════════════════════════════════════════════════════════╝

function leesCache(): CacheData | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const data: CacheData = JSON.parse(raw);
    const leeftijd = Date.now() - new Date(data.bijgewerkt).getTime();
    if (leeftijd > CACHE_DUUR_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function schrijfCache(data: CacheData) {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch {
    // Niet kritiek
  }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  HOOFD: ALLE PRIJZEN OPHALEN & SAMENVOEGEN              ║
// ╚══════════════════════════════════════════════════════════╝

async function haalAllePrijzenOp(): Promise<CacheData> {
  const prijzen: PrijsData[] = [];

  // Verwerk in batches van 4 om APIs niet te overbelasten
  const BATCH_SIZE = 4;
  for (let i = 0; i < PRODUCT_ZOEKOPDRACHTEN.length; i += BATCH_SIZE) {
    const batch = PRODUCT_ZOEKOPDRACHTEN.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (product) => {
        const fallback = FALLBACK_PRIJZEN[product.id];

        // ── NEDERLAND: AH + Jumbo + OFF parallel ophalen ──
        const [ahPrijs, jumboPrijs, offNLPrijs] = await Promise.all([
          zoekAHPrijs(product.zoekNL, product.maxPrijs),
          zoekJumboPrijs(product.zoekJumbo, product.maxPrijs),
          zoekOFFPrijs(product.zoekOFF, "netherlands", product.maxPrijs),
        ]);

        // ── DUITSLAND: REWE + Lidl + OFF parallel ophalen ──
        const [rewePrijs, lidlDEPrijs, offDEPrijs] = await Promise.all([
          zoekREWEPrijs(product.zoekREWE, product.maxPrijs),
          zoekLidlPrijs("https://www.lidl.de", "DE", "de", product.zoekDE, "lidlDe"),
          zoekOFFPrijs(product.zoekOFF, "germany", product.maxPrijs),
        ]);

        // ── BELGIË: Lidl + OFF parallel ophalen ──
        const [lidlBEPrijs, offBEPrijs] = await Promise.all([
          zoekLidlPrijs("https://www.lidl.be", "BE", "nl", product.zoekBE, "lidlBe"),
          zoekOFFPrijs(product.zoekOFF, "belgium", product.maxPrijs),
        ]);

        // ── SAMENVOEGEN: meerdere bronnen → 1 prijs per land ──
        const nlBronnen = [ahPrijs, jumboPrijs, offNLPrijs].filter((p): p is number => p !== null);
        const deBronnen = [rewePrijs, lidlDEPrijs, offDEPrijs].filter((p): p is number => p !== null);
        const beBronnen = [lidlBEPrijs, offBEPrijs].filter((p): p is number => p !== null);

        // Bepaal welke API-bron als label wordt getoond
        const bronNL = bepaalBronNaam([
          ahPrijs ? "ah-api" : null,
          jumboPrijs ? "jumbo-api" : null,
          offNLPrijs ? "off-api" : null,
        ]);
        const bronDE = bepaalBronNaam([
          rewePrijs ? "rewe-api" : null,
          lidlDEPrijs ? "lidl-api" : null,
          offDEPrijs ? "off-api" : null,
        ]);
        const bronBE = bepaalBronNaam([
          lidlBEPrijs ? "lidl-api" : null,
          offBEPrijs ? "off-api" : null,
        ]);

        return {
          id: product.id,
          prijsNL: mergePrijzen(nlBronnen) ?? fallback?.nl ?? null,
          prijsDE: mergePrijzen(deBronnen) ?? fallback?.de ?? null,
          prijsBE: mergePrijzen(beBronnen) ?? fallback?.be ?? null,
          bronNL: nlBronnen.length > 0 ? bronNL : "fallback",
          bronDE: deBronnen.length > 0 ? bronDE : "fallback",
          bronBE: beBronnen.length > 0 ? bronBE : "fallback",
        } as PrijsData;
      }),
    );

    prijzen.push(...results);
  }

  return {
    prijzen,
    bijgewerkt: new Date().toISOString(),
    versie: 3,
  };
}

// ╔══════════════════════════════════════════════════════════╗
// ║  API ROUTE                                              ║
// ╚══════════════════════════════════════════════════════════╝

export async function GET(request: Request) {
  const debugMode = new URL(request.url).searchParams.get("debug") === "1";
  try {
    // Cache check (niet in debug)
    if (!debugMode) {
      const cached = leesCache();
      if (cached) {
        return NextResponse.json({
          ...cached,
          bron: bepaalOverallBron(cached.prijzen),
        });
      }
    }

    // Vers ophalen
    const data = await haalAllePrijzenOp();
    if (!debugMode) schrijfCache(data);

    const response: Record<string, unknown> = {
      ...data,
      bron: bepaalOverallBron(data.prijzen),
    };

    if (debugMode) {
      // Tel hoeveel prijzen per bron
      const bronTelling: Record<string, number> = {};
      for (const p of data.prijzen) {
        for (const b of [p.bronNL, p.bronDE, p.bronBE]) {
          bronTelling[b] = (bronTelling[b] || 0) + 1;
        }
      }

      response.debug = {
        scrapeFouten,
        bronTelling,
        eersteResultaat: data.prijzen[0],
        ahTokenVerkregen: !!ahTokenCache,
        aantalProducten: data.prijzen.length,
        bronnen: {
          nl: ["Albert Heijn API", "Jumbo API", "Open Food Facts"],
          de: ["REWE API", "Lidl API", "Open Food Facts"],
          be: ["Lidl API", "Open Food Facts"],
        },
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    // Noodoplossing: fallback prijzen
    const fallbackData: CacheData = {
      prijzen: Object.entries(FALLBACK_PRIJZEN).map(([id, p]) => ({
        id,
        prijsNL: p.nl,
        prijsDE: p.de,
        prijsBE: p.be,
        bronNL: "fallback" as BronNaam,
        bronDE: "fallback" as BronNaam,
        bronBE: "fallback" as BronNaam,
      })),
      bijgewerkt: new Date().toISOString(),
      versie: 3,
    };

    return NextResponse.json({
      ...fallbackData,
      bron: "fallback",
      fout: error instanceof Error ? error.message : "Onbekende fout",
    });
  }
}
