"use server";

/**
 * Hybride classificatie uit RDW brandstof-endpoint.
 * - "geen"     → gewone verbrandingsmotor
 * - "NOVC-HEV" → hybride (niet plug-in, bijv. Toyota Yaris Hybrid)
 * - "OVC-HEV"  → plug-in hybride (PHEV, bijv. Mitsubishi Outlander PHEV)
 */
export type HybrideKlasse = "geen" | "NOVC-HEV" | "OVC-HEV";

export type VoertuigData = {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  brandstof: string;
  eersteKleur: string;
  aantalCilinders: string;
  cilinderinhoud: string;
  /** Datum eerste toelating in formaat YYYYMMDD */
  eersteToelating: string;
  /** Hybride classificatie — "geen" als het geen hybride is */
  hybrideKlasse: HybrideKlasse;
};

export type VoertuigResult =
  | { success: true; data: VoertuigData }
  | { success: false; error: string; code?: string };

const TIMEOUT_MS = 8000;

async function fetchMetTimeout(url: string, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      // Cache agressiever zodat repeated lookups snel zijn
      next: { revalidate: 3600 },
      headers: {
        "Accept": "application/json",
        "User-Agent": "Grenspret/1.0 (grenspret.nl)",
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function zoekVoertuig(kenteken: string): Promise<VoertuigResult> {
  const cleaned = kenteken.replace(/[\s-]/g, "").toUpperCase();

  if (!/^[A-Z0-9]{1,8}$/.test(cleaned)) {
    return {
      success: false,
      error: "Dat lijkt geen geldig kenteken. Probeer iets als 'AB123C'.",
      code: "INVALID_FORMAT",
    };
  }

  try {
    const [voertuigRes, brandstofRes] = await Promise.all([
      fetchMetTimeout(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${cleaned}`),
      fetchMetTimeout(`https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${cleaned}`),
    ]);

    if (!voertuigRes.ok) {
      console.error(`RDW voertuig response ${voertuigRes.status}: ${voertuigRes.statusText}`);
      return {
        success: false,
        error:
          voertuigRes.status === 429
            ? "Even rustig aan — de RDW is druk. Probeer het over een minuutje opnieuw."
            : "De RDW-service is tijdelijk niet bereikbaar. Probeer het zo opnieuw.",
        code: `RDW_${voertuigRes.status}`,
      };
    }

    if (!brandstofRes.ok) {
      console.error(`RDW brandstof response ${brandstofRes.status}: ${brandstofRes.statusText}`);
      return {
        success: false,
        error: "De RDW-service is tijdelijk niet bereikbaar. Probeer het zo opnieuw.",
        code: `RDW_FUEL_${brandstofRes.status}`,
      };
    }

    const voertuigen = await voertuigRes.json();
    const brandstoffen = await brandstofRes.json();

    if (!Array.isArray(voertuigen) || voertuigen.length === 0) {
      return {
        success: false,
        error: "Geen voertuig gevonden met dit kenteken. Controleer of je het goed hebt overgetypt.",
        code: "NOT_FOUND",
      };
    }

    const v = voertuigen[0];
    const brandstofArray = Array.isArray(brandstoffen) ? brandstoffen : [];
    const b = brandstofArray[0];

    // Hybride detectie: check klasse_hybride_elektrisch_voertuig in alle brandstofrecords
    let hybrideKlasse: HybrideKlasse = "geen";
    for (const brandstofRecord of brandstofArray) {
      const klasse = brandstofRecord.klasse_hybride_elektrisch_voertuig;
      if (klasse === "OVC-HEV") {
        hybrideKlasse = "OVC-HEV";
        break; // PHEV is de specifiekste match
      }
      if (klasse === "NOVC-HEV") {
        hybrideKlasse = "NOVC-HEV";
      }
    }

    // Voor hybrides: pak het benzine/diesel record (niet het elektriciteit-record)
    const brandstofRecord =
      brandstofArray.find(
        (r: Record<string, string>) =>
          r.brandstof_omschrijving?.toLowerCase().includes("benzine") ||
          r.brandstof_omschrijving?.toLowerCase().includes("diesel"),
      ) ?? b;

    return {
      success: true,
      data: {
        kenteken: v.kenteken,
        merk: v.merk ?? "Onbekend",
        handelsbenaming: v.handelsbenaming ?? "Onbekend",
        brandstof: brandstofRecord?.brandstof_omschrijving ?? "Onbekend",
        eersteKleur: v.eerste_kleur ?? "Onbekend",
        aantalCilinders: v.aantal_cilinders ?? "-",
        cilinderinhoud: v.cilinderinhoud ? `${v.cilinderinhoud} cc` : "-",
        eersteToelating: v.datum_eerste_toelating ?? "",
        hybrideKlasse,
      },
    };
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    const isNetwork =
      err instanceof TypeError &&
      typeof err.message === "string" &&
      err.message.toLowerCase().includes("fetch");

    console.error("RDW lookup error:", err);

    if (isAbort) {
      return {
        success: false,
        error: "De verbinding duurde te lang. Check je internet en probeer opnieuw.",
        code: "TIMEOUT",
      };
    }
    if (isNetwork) {
      return {
        success: false,
        error: "Geen verbinding met de RDW. Check je internet en probeer opnieuw.",
        code: "NETWORK",
      };
    }
    return {
      success: false,
      error: "Er ging iets mis bij het ophalen. Probeer het zo opnieuw.",
      code: "UNKNOWN",
    };
  }
}
