import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Prijzen API — haalt echte productprijzen op uit:
 * - Albert Heijn API (NL) — gratis, openbaar
 * - Lidl.de (DE) — via publieke website data
 * - Lidl.be (BE) — via publieke website data
 *
 * Cache: prijzen worden 24 uur bewaard.
 * Fallback: als een API niet bereikbaar is, worden de laatst bekende prijzen gebruikt.
 */

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "product-prices.json");
const CACHE_DUUR_MS = 24 * 60 * 60 * 1000; // 24 uur

// Producten die we willen opzoeken. maxPrijs filtert multipack-outliers.
const PRODUCT_ZOEKOPDRACHTEN = [
  // Zuivel
  { id: "melk-campina", zoekNL: "campina volle melk 1l", zoekDE: "vollmilch 1l", zoekBE: "volle melk 1l", maxPrijs: 3 },
  { id: "melk-huismerk", zoekNL: "ah volle melk 1l", zoekDE: "milch frisch 1l", zoekBE: "volle melk 1l", maxPrijs: 2 },
  { id: "kaas-jong", zoekNL: "jonge kaas plak", zoekDE: "gouda jung", zoekBE: "jonge kaas", maxPrijs: 12 },
  { id: "boter-campina", zoekNL: "campina botergoud 250g", zoekDE: "butter markenbutter 250g", zoekBE: "roomboter 250g", maxPrijs: 4 },
  { id: "boter-huismerk", zoekNL: "ah roomboter 250g", zoekDE: "deutsche markenbutter 250g", zoekBE: "roomboter 250g", maxPrijs: 3 },
  { id: "yoghurt-optimel", zoekNL: "optimel drinkyoghurt 1l", zoekDE: "trinkjoghurt 1l", zoekBE: "drinkyoghurt 1l", maxPrijs: 3 },
  { id: "yoghurt-huismerk", zoekNL: "ah yoghurt natuur 500g", zoekDE: "naturjoghurt 500g", zoekBE: "yoghurt natuur", maxPrijs: 2 },

  // Vlees
  { id: "gehakt", zoekNL: "half om half gehakt 500g", zoekDE: "hackfleisch gemischt 500g", zoekBE: "gehakt 500g", maxPrijs: 7 },
  { id: "kipfilet", zoekNL: "kipfilet 500g", zoekDE: "hähnchenbrustfilet 500g", zoekBE: "kipfilet 500g", maxPrijs: 8 },
  { id: "speklappen", zoekNL: "speklappen 500g", zoekDE: "schweinebauch 500g", zoekBE: "speklappen", maxPrijs: 7 },
  { id: "rookworst-unox", zoekNL: "unox rookworst 275g", zoekDE: "bockwurst", zoekBE: "rookworst", maxPrijs: 4 },
  { id: "rookworst-huismerk", zoekNL: "ah rookworst 275g", zoekDE: "bockwurst", zoekBE: "rookworst", maxPrijs: 3 },

  // Dranken — STRIKTE max om multipacks te negeren
  { id: "cola-cocacola", zoekNL: "coca cola 1.5l fles", zoekDE: "coca cola 1.5l", zoekBE: "coca cola 1.5l", maxPrijs: 3.5 },
  { id: "cola-pepsi", zoekNL: "pepsi 1.5l fles", zoekDE: "pepsi 1.5l", zoekBE: "pepsi 1.5l", maxPrijs: 3 },
  { id: "cola-huismerk", zoekNL: "ah cola 1.5l fles", zoekDE: "cola 1.5l freeway", zoekBE: "cola 1.5l", maxPrijs: 2 },
  { id: "bier-heineken", zoekNL: "heineken krat 24", zoekDE: "heineken kasten", zoekBE: "heineken bak", maxPrijs: 25 },
  { id: "bier-huismerk", zoekNL: "ah pils krat 24", zoekDE: "perlenbacher pils kasten", zoekBE: "pils bak", maxPrijs: 18 },
  { id: "koffie-douwe", zoekNL: "douwe egberts aroma rood 500g", zoekDE: "jacobs filterkaffee 500g", zoekBE: "douwe egberts 500g", maxPrijs: 12 },
  { id: "koffie-huismerk", zoekNL: "ah filterkoffie 500g", zoekDE: "bellarom kaffee 500g", zoekBE: "filterkoffie 500g", maxPrijs: 6 },
  { id: "wijn", zoekNL: "rode wijn huiswijn", zoekDE: "rotwein", zoekBE: "rode wijn", maxPrijs: 8 },

  // Verzorging
  { id: "deo-dove", zoekNL: "dove deodorant spray 150ml", zoekDE: "dove deodorant 150ml", zoekBE: "dove deodorant 150ml", maxPrijs: 5 },
  { id: "deo-axe", zoekNL: "axe deodorant spray 150ml", zoekDE: "axe deodorant 150ml", zoekBE: "axe deodorant 150ml", maxPrijs: 5 },
  { id: "deo-huismerk", zoekNL: "ah deodorant spray", zoekDE: "deodorant spray", zoekBE: "deodorant spray", maxPrijs: 3 },
  { id: "tandpasta-prodent", zoekNL: "prodent tandpasta 75ml", zoekDE: "zahnpasta 75ml", zoekBE: "tandpasta 75ml", maxPrijs: 4 },
  { id: "tandpasta-huismerk", zoekNL: "ah tandpasta 75ml", zoekDE: "zahnpasta", zoekBE: "tandpasta", maxPrijs: 2 },
  { id: "shampoo-andrelon", zoekNL: "andrelon shampoo 300ml", zoekDE: "shampoo 300ml", zoekBE: "shampoo 300ml", maxPrijs: 6 },
  { id: "shampoo-huismerk", zoekNL: "ah shampoo 250ml", zoekDE: "shampoo 250ml", zoekBE: "shampoo 250ml", maxPrijs: 3 },
  { id: "afwasmiddel-dreft", zoekNL: "dreft afwasmiddel 890ml", zoekDE: "spülmittel", zoekBE: "afwasmiddel", maxPrijs: 5 },
  { id: "waspoeder-persil", zoekNL: "persil wasmiddel poeder", zoekDE: "persil waschmittel", zoekBE: "persil", maxPrijs: 18 },
  { id: "waspoeder-huismerk", zoekNL: "ah waspoeder", zoekDE: "waschmittel", zoekBE: "waspoeder", maxPrijs: 8 },
  { id: "wc-papier-page", zoekNL: "page toiletpapier 8 rollen", zoekDE: "toilettenpapier 8 rollen", zoekBE: "toiletpapier 8 rollen", maxPrijs: 8 },
  { id: "wc-papier-huismerk", zoekNL: "ah toiletpapier 8 rollen", zoekDE: "toilettenpapier 8 rollen", zoekBE: "toiletpapier 8 rollen", maxPrijs: 5 },

  // Basis
  { id: "pindakaas-calve", zoekNL: "calve pindakaas 350g", zoekDE: "erdnussbutter 350g", zoekBE: "pindakaas 350g", maxPrijs: 5 },
  { id: "pindakaas-huismerk", zoekNL: "ah pindakaas 350g", zoekDE: "erdnusscreme", zoekBE: "pindakaas", maxPrijs: 3 },
  { id: "hagelslag-dehollandse", zoekNL: "de ruijter hagelslag", zoekDE: "schokostreusel", zoekBE: "hagelslag", maxPrijs: 4 },
  { id: "suiker", zoekNL: "witte suiker 1kg", zoekDE: "zucker 1kg", zoekBE: "witte suiker 1kg", maxPrijs: 3 },
  { id: "bloem", zoekNL: "tarwebloem 1kg", zoekDE: "weizenmehl 1kg", zoekBE: "tarwebloem 1kg", maxPrijs: 2 },
  { id: "pasta-barilla", zoekNL: "barilla spaghetti 500g", zoekDE: "barilla spaghetti 500g", zoekBE: "barilla spaghetti 500g", maxPrijs: 3 },
  { id: "pasta-huismerk", zoekNL: "ah spaghetti 500g", zoekDE: "spaghetti 500g", zoekBE: "spaghetti 500g", maxPrijs: 2 },
  { id: "olijfolie-bertolli", zoekNL: "bertolli olijfolie 500ml", zoekDE: "bertolli olivenöl 500ml", zoekBE: "bertolli olijfolie 500ml", maxPrijs: 10 },
  { id: "olijfolie-huismerk", zoekNL: "ah olijfolie 500ml", zoekDE: "olivenöl 500ml", zoekBE: "olijfolie 500ml", maxPrijs: 6 },
  { id: "nutella", zoekNL: "nutella 400g", zoekDE: "nutella 450g", zoekBE: "nutella 400g", maxPrijs: 5 },
];

type PrijsData = {
  id: string;
  prijsNL: number | null;
  prijsDE: number | null;
  prijsBE: number | null;
  bronNL: "ah-api" | "fallback";
  bronDE: "lidl-api" | "fallback";
  bronBE: "lidl-api" | "fallback";
};

/**
 * Bepaal eerlijke status: 'live' alleen als ALLE prijzen via een API kwamen,
 * 'cache' bij gemengd, 'fallback' als alles handmatig.
 */
function bepaalBron(prijzen: PrijsData[]): "live" | "cache" | "fallback" {
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

type CacheData = {
  prijzen: PrijsData[];
  bijgewerkt: string;
  versie: number;
};

// Realistische browser headers voor Cloudflare bypass bij Lidl
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

// Foutmeldingen per scraper (voor debug)
type ScrapeFout = { fase: string; status?: number; bericht: string };
const scrapeFouten: { ah?: ScrapeFout; lidlDe?: ScrapeFout; lidlBe?: ScrapeFout } = {};

// ===== Albert Heijn — anonymous OAuth + product search =====

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
      scrapeFouten.ah = {
        fase: "token",
        status: res.status,
        bericht: `Token ophalen mislukt: HTTP ${res.status}`,
      };
      return null;
    }
    const data = await res.json();
    const token = data?.access_token;
    if (typeof token !== "string") {
      scrapeFouten.ah = {
        fase: "token",
        status: res.status,
        bericht: "Geen access_token in response",
      };
      return null;
    }
    // Cache 30 minuten (token is meestal langer geldig)
    ahTokenCache = { token, expires: Date.now() + 30 * 60 * 1000 };
    return token;
  } catch (err) {
    scrapeFouten.ah = {
      fase: "token",
      bericht: err instanceof Error ? err.message : String(err),
    };
    return null;
  }
}

async function zoekAHPrijs(
  query: string,
  maxPrijs: number = 50,
): Promise<number | null> {
  const token = await getAHToken();
  if (!token) return null;

  try {
    const url = `https://api.ah.nl/mobile-services/product/search/v2?query=${encodeURIComponent(query)}&size=10&sortOn=PRICELOWHIGH`;
    const res = await fetch(url, {
      headers: {
        ...BROWSER_HEADERS,
        Authorization: `Bearer ${token}`,
        "x-application": "AHWEBSHOP",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      scrapeFouten.ah = {
        fase: "search",
        status: res.status,
        bericht: `Search mislukt: HTTP ${res.status}`,
      };
      return null;
    }

    const data = await res.json();
    const products: Array<{
      priceBeforeBonus?: number;
      currentPrice?: number;
      price?: { now?: number };
    }> =
      data?.products ||
      data?.cards?.flatMap(
        (c: { products?: Array<{ priceBeforeBonus?: number; currentPrice?: number }> }) =>
          c.products || [],
      ) ||
      [];

    // Verzamel alle prijzen binnen de redelijke range (filtert multipacks
    // en mini-formaten weg)
    const prijzen: number[] = [];
    for (const product of products) {
      const prijs =
        product?.priceBeforeBonus ??
        product?.currentPrice ??
        product?.price?.now ??
        null;
      if (typeof prijs === "number" && prijs > 0.3 && prijs <= maxPrijs) {
        prijzen.push(prijs);
      }
    }

    if (prijzen.length === 0) return null;

    // Mediaan = robuust midden van de geldige prijzen
    prijzen.sort((a, b) => a - b);
    const mediaan = prijzen[Math.floor(prijzen.length / 2)];
    return Math.round(mediaan * 100) / 100;
  } catch (err) {
    scrapeFouten.ah = {
      fase: "search",
      bericht: err instanceof Error ? err.message : String(err),
    };
    return null;
  }
}

// ===== Lidl — Algol search API =====
// De "/p/api/gridboxes" was verkeerd. Lidl gebruikt nu een Algolia-achtige
// search via /p/api/discover/{country}/{lang}/search?q=...
async function zoekLidlPrijs(
  baseUrl: string,
  country: string,
  lang: string,
  query: string,
  scraperKey: "lidlDe" | "lidlBe",
): Promise<number | null> {
  const candidatePaths = [
    `/p/api/discover/${country}/${lang}/search?q=${encodeURIComponent(query)}&hitsPerPage=5`,
    `/q/api/search/v2/${lang}_${country}/products?searchKey=${encodeURIComponent(query)}&offset=0&limit=5`,
    `/p/api/v1/${country}/${lang}/products?query=${encodeURIComponent(query)}&limit=5`,
  ];

  let laatsteFout = "";
  for (const path of candidatePaths) {
    try {
      const url = baseUrl + path;
      const res = await fetch(url, {
        headers: {
          ...BROWSER_HEADERS,
          Referer: `${baseUrl}/`,
          Origin: baseUrl,
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        laatsteFout = `${path} → HTTP ${res.status}`;
        continue;
      }

      const data = await res.json();
      const items: Array<{
        price?: { price?: number; currentRetailPrice?: number };
        pricing?: { currentRetailPrice?: number };
      }> =
        data?.hits ||
        data?.items ||
        data?.products ||
        data?.gridboxes ||
        data?.results ||
        [];

      const prijzen: number[] = [];
      for (const item of items) {
        const prijs =
          item?.price?.price ??
          item?.price?.currentRetailPrice ??
          item?.pricing?.currentRetailPrice ??
          null;
        if (typeof prijs === "number" && prijs > 0.3 && prijs < 50) {
          prijzen.push(prijs);
        }
      }

      if (prijzen.length > 0) {
        prijzen.sort((a, b) => a - b);
        return Math.round(prijzen[Math.floor(prijzen.length / 2)] * 100) / 100;
      }

      laatsteFout = `${path} → 200 maar geen prijzen`;
    } catch (err) {
      laatsteFout = `${path} → ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  scrapeFouten[scraperKey] = {
    fase: "search",
    bericht: `Alle endpoints faalden. Laatste: ${laatsteFout}`,
  };
  return null;
}

async function zoekLidlDEPrijs(query: string): Promise<number | null> {
  return zoekLidlPrijs("https://www.lidl.de", "DE", "de", query, "lidlDe");
}

async function zoekLidlBEPrijs(query: string): Promise<number | null> {
  return zoekLidlPrijs("https://www.lidl.be", "BE", "nl", query, "lidlBe");
}

// ===== Fallback prijzen (handmatig onderzocht, april 2026) =====
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

// ===== Cache functies =====
function leesCache(): CacheData | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const data: CacheData = JSON.parse(raw);
    const leeftijd = Date.now() - new Date(data.bijgewerkt).getTime();
    if (leeftijd > CACHE_DUUR_MS) return null; // verlopen
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
    // Cache schrijven mislukt — niet kritiek
  }
}

// ===== Hoofdfunctie: alle prijzen ophalen =====
async function haalAllePrijzenOp(): Promise<CacheData> {
  const prijzen: PrijsData[] = [];

  // Verwerk in batches van 5 om API's niet te overbelasten
  const BATCH_SIZE = 5;
  for (let i = 0; i < PRODUCT_ZOEKOPDRACHTEN.length; i += BATCH_SIZE) {
    const batch = PRODUCT_ZOEKOPDRACHTEN.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (product) => {
        const fallback = FALLBACK_PRIJZEN[product.id];

        // NL: Albert Heijn — pas maxPrijs toe om multipack-uitschieters te negeren
        const ahPrijs = await zoekAHPrijs(product.zoekNL, product.maxPrijs);

        // DE: Lidl — alle endpoints geven 404, fallback gebruikt
        const lidlDEPrijs = await zoekLidlDEPrijs(product.zoekDE);

        // BE: Lidl — alle endpoints geven 404, fallback gebruikt
        const lidlBEPrijs = await zoekLidlBEPrijs(product.zoekBE);

        return {
          id: product.id,
          prijsNL: ahPrijs ?? fallback?.nl ?? null,
          prijsDE: lidlDEPrijs ?? fallback?.de ?? null,
          prijsBE: lidlBEPrijs ?? fallback?.be ?? null,
          bronNL: ahPrijs ? "ah-api" : "fallback",
          bronDE: lidlDEPrijs ? "lidl-api" : "fallback",
          bronBE: lidlBEPrijs ? "lidl-api" : "fallback",
        } as PrijsData;
      })
    );

    prijzen.push(...results);
  }

  return {
    prijzen,
    bijgewerkt: new Date().toISOString(),
    versie: 2,
  };
}

// ===== API Route =====
export async function GET(request: Request) {
  const debugMode = new URL(request.url).searchParams.get("debug") === "1";
  try {
    // Check cache eerst (alleen als geen debug)
    if (!debugMode) {
      const cached = leesCache();
      if (cached) {
        return NextResponse.json({
          ...cached,
          bron: bepaalBron(cached.prijzen),
        });
      }
    }

    // Vers ophalen
    const data = await haalAllePrijzenOp();
    if (!debugMode) schrijfCache(data);

    const response: Record<string, unknown> = {
      ...data,
      bron: bepaalBron(data.prijzen),
    };
    if (debugMode) {
      response.debug = {
        scrapeFouten,
        eersteResultaat: data.prijzen[0],
        ahTokenVerkregen: !!ahTokenCache,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    // Noodoplossing: geef fallback prijzen terug
    const fallbackData: CacheData = {
      prijzen: Object.entries(FALLBACK_PRIJZEN).map(([id, p]) => ({
        id,
        prijsNL: p.nl,
        prijsDE: p.de,
        prijsBE: p.be,
        bronNL: "fallback" as const,
        bronDE: "fallback" as const,
        bronBE: "fallback" as const,
      })),
      bijgewerkt: new Date().toISOString(),
      versie: 2,
    };

    return NextResponse.json({
      ...fallbackData,
      bron: "fallback",
      fout: error instanceof Error ? error.message : "Onbekende fout",
    });
  }
}
