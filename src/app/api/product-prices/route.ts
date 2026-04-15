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

// Producten die we willen opzoeken, met zoektermen per bron
const PRODUCT_ZOEKOPDRACHTEN = [
  // Zuivel
  { id: "melk-campina", zoekNL: "campina volle melk 1l", zoekDE: "vollmilch 1l", zoekBE: "volle melk 1l" },
  { id: "melk-huismerk", zoekNL: "ah volle melk 1l", zoekDE: "milch frisch 1l", zoekBE: "volle melk 1l" },
  { id: "kaas-jong", zoekNL: "jonge kaas", zoekDE: "gouda jung", zoekBE: "jonge kaas" },
  { id: "boter-campina", zoekNL: "campina botergoud", zoekDE: "butter markenbutter", zoekBE: "roomboter" },
  { id: "boter-huismerk", zoekNL: "ah roomboter", zoekDE: "deutsche markenbutter", zoekBE: "roomboter" },
  { id: "yoghurt-optimel", zoekNL: "optimel drinkyoghurt", zoekDE: "trinkjoghurt", zoekBE: "drinkyoghurt" },
  { id: "yoghurt-huismerk", zoekNL: "ah yoghurt natuur", zoekDE: "naturjoghurt", zoekBE: "yoghurt natuur" },

  // Vlees
  { id: "gehakt", zoekNL: "half om half gehakt 500g", zoekDE: "hackfleisch gemischt 500g", zoekBE: "gehakt 500g" },
  { id: "kipfilet", zoekNL: "kipfilet 500g", zoekDE: "hähnchenbrustfilet", zoekBE: "kipfilet" },
  { id: "speklappen", zoekNL: "speklappen", zoekDE: "schweinebauch", zoekBE: "speklappen" },
  { id: "rookworst-unox", zoekNL: "unox rookworst", zoekDE: "bockwurst", zoekBE: "rookworst" },
  { id: "rookworst-huismerk", zoekNL: "ah rookworst", zoekDE: "bockwurst", zoekBE: "rookworst" },

  // Dranken
  { id: "cola-cocacola", zoekNL: "coca cola 1.5l", zoekDE: "coca cola 1.5l", zoekBE: "coca cola 1.5l" },
  { id: "cola-pepsi", zoekNL: "pepsi 1.5l", zoekDE: "pepsi 1.5l", zoekBE: "pepsi 1.5l" },
  { id: "cola-huismerk", zoekNL: "ah cola 1.5l", zoekDE: "cola 1.5l freeway", zoekBE: "cola 1.5l" },
  { id: "bier-heineken", zoekNL: "heineken krat", zoekDE: "heineken", zoekBE: "heineken" },
  { id: "bier-huismerk", zoekNL: "ah pils krat", zoekDE: "perlenbacher pils", zoekBE: "pils" },
  { id: "koffie-douwe", zoekNL: "douwe egberts aroma rood", zoekDE: "jacobs filterkaffee", zoekBE: "douwe egberts" },
  { id: "koffie-huismerk", zoekNL: "ah filterkoffie", zoekDE: "bellarom kaffee", zoekBE: "filterkoffie" },
  { id: "wijn", zoekNL: "rode wijn huiswijn", zoekDE: "rotwein", zoekBE: "rode wijn" },

  // Verzorging
  { id: "deo-dove", zoekNL: "dove deodorant", zoekDE: "dove deodorant", zoekBE: "dove deodorant" },
  { id: "deo-axe", zoekNL: "axe deodorant", zoekDE: "axe deodorant", zoekBE: "axe deodorant" },
  { id: "deo-huismerk", zoekNL: "ah deodorant", zoekDE: "deodorant", zoekBE: "deodorant" },
  { id: "tandpasta-prodent", zoekNL: "prodent tandpasta", zoekDE: "zahnpasta", zoekBE: "tandpasta" },
  { id: "tandpasta-huismerk", zoekNL: "ah tandpasta", zoekDE: "zahnpasta", zoekBE: "tandpasta" },
  { id: "shampoo-andrelon", zoekNL: "andrelon shampoo", zoekDE: "shampoo", zoekBE: "shampoo" },
  { id: "shampoo-huismerk", zoekNL: "ah shampoo", zoekDE: "shampoo", zoekBE: "shampoo" },
  { id: "afwasmiddel-dreft", zoekNL: "dreft afwasmiddel", zoekDE: "spülmittel", zoekBE: "afwasmiddel" },
  { id: "waspoeder-persil", zoekNL: "persil wasmiddel", zoekDE: "persil waschmittel", zoekBE: "persil" },
  { id: "waspoeder-huismerk", zoekNL: "ah waspoeder", zoekDE: "waschmittel", zoekBE: "waspoeder" },
  { id: "wc-papier-page", zoekNL: "page toiletpapier", zoekDE: "toilettenpapier", zoekBE: "toiletpapier" },
  { id: "wc-papier-huismerk", zoekNL: "ah toiletpapier", zoekDE: "toilettenpapier", zoekBE: "toiletpapier" },

  // Basis
  { id: "pindakaas-calve", zoekNL: "calve pindakaas", zoekDE: "erdnussbutter", zoekBE: "pindakaas" },
  { id: "pindakaas-huismerk", zoekNL: "ah pindakaas", zoekDE: "erdnusscreme", zoekBE: "pindakaas" },
  { id: "hagelslag-dehollandse", zoekNL: "de ruijter hagelslag", zoekDE: "schokostreusel", zoekBE: "hagelslag" },
  { id: "suiker", zoekNL: "witte suiker 1kg", zoekDE: "zucker 1kg", zoekBE: "witte suiker" },
  { id: "bloem", zoekNL: "tarwebloem 1kg", zoekDE: "weizenmehl 1kg", zoekBE: "tarwebloem" },
  { id: "pasta-barilla", zoekNL: "barilla spaghetti", zoekDE: "barilla spaghetti", zoekBE: "barilla spaghetti" },
  { id: "pasta-huismerk", zoekNL: "ah spaghetti", zoekDE: "spaghetti", zoekBE: "spaghetti" },
  { id: "olijfolie-bertolli", zoekNL: "bertolli olijfolie", zoekDE: "bertolli olivenöl", zoekBE: "bertolli olijfolie" },
  { id: "olijfolie-huismerk", zoekNL: "ah olijfolie", zoekDE: "olivenöl", zoekBE: "olijfolie" },
  { id: "nutella", zoekNL: "nutella 400g", zoekDE: "nutella 450g", zoekBE: "nutella" },
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

async function zoekAHPrijs(query: string): Promise<number | null> {
  const token = await getAHToken();
  if (!token) return null;

  try {
    // Sortering op prijs ascending — pak de goedkoopste (= meestal de
    // standaard verpakking, niet een multipack of XL-formaat)
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

    // Verzamel alle geldige prijzen
    const prijzen: number[] = [];
    for (const product of products) {
      const prijs =
        product?.priceBeforeBonus ??
        product?.currentPrice ??
        product?.price?.now ??
        null;
      if (typeof prijs === "number" && prijs > 0.3 && prijs < 50) {
        prijzen.push(prijs);
      }
    }

    if (prijzen.length === 0) return null;

    // Pak de mediaan om uitschieters (mini-formaten of multipacks) te vermijden
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

        // NL: Albert Heijn
        const ahPrijs = await zoekAHPrijs(product.zoekNL);

        // DE: Lidl
        const lidlDEPrijs = await zoekLidlDEPrijs(product.zoekDE);

        // BE: Lidl
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
