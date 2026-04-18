/**
 * Postcode lookup via de gratis PDOK Locatieserver API (overheid).
 * Geeft plaatsnaam + gemeente terug bij een geldige Nederlandse postcode.
 */

export type PostcodeLookupResult = {
  success: true;
  plaatsnaam: string;
  gemeente: string;
  provincie: string;
  volledigAdres: string; // bijv. "Hellevoetsluis, Zuid-Holland"
} | {
  success: false;
  error: string;
};

/**
 * Zoek plaatsnaam bij een Nederlandse postcode via PDOK Locatieserver.
 * Verwacht formaat: "1234AB" of "1234 AB"
 */
export async function zoekPostcode(postcode: string): Promise<PostcodeLookupResult> {
  // Normaliseer: verwijder spaties
  const schoon = postcode.replace(/\s/g, "").toUpperCase();

  // Valideer formaat: 4 cijfers + 2 letters
  if (!/^\d{4}[A-Z]{2}$/.test(schoon)) {
    return { success: false, error: "Voer een geldige postcode in (bijv. 1234 AB)" };
  }

  try {
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=postcode:${schoon}&rows=1&fq=type:postcode`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`PDOK API error: ${res.status}`);
    }

    const data = await res.json();
    const docs = data?.response?.docs;

    if (!docs || docs.length === 0) {
      return { success: false, error: "Postcode niet gevonden. Controleer je invoer." };
    }

    const doc = docs[0];
    const plaatsnaam = doc.woonplaatsnaam || "";
    const gemeente = doc.gemeentenaam || "";
    const provincie = doc.provincienaam || "";

    return {
      success: true,
      plaatsnaam,
      gemeente,
      provincie,
      volledigAdres: provincie ? `${plaatsnaam}, ${provincie}` : plaatsnaam,
    };
  } catch {
    // Fallback: als API niet bereikbaar is, laat gebruiker toch doorgaan
    return { success: false, error: "Kon postcode niet opzoeken. Probeer het opnieuw." };
  }
}
