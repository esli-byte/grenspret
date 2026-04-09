"use server";

export type VoertuigData = {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  brandstof: string;
  eersteKleur: string;
  aantalCilinders: string;
  cilinderinhoud: string;
};

export type VoertuigResult =
  | { success: true; data: VoertuigData }
  | { success: false; error: string };

export async function zoekVoertuig(kenteken: string): Promise<VoertuigResult> {
  const cleaned = kenteken.replace(/[\s-]/g, "").toUpperCase();

  if (!/^[A-Z0-9]{1,8}$/.test(cleaned)) {
    return { success: false, error: "Ongeldig kenteken formaat" };
  }

  try {
    const [voertuigRes, brandstofRes] = await Promise.all([
      fetch(
        `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${cleaned}`
      ),
      fetch(
        `https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${cleaned}`
      ),
    ]);

    if (!voertuigRes.ok || !brandstofRes.ok) {
      return { success: false, error: "Fout bij het ophalen van gegevens" };
    }

    const voertuigen = await voertuigRes.json();
    const brandstoffen = await brandstofRes.json();

    if (voertuigen.length === 0) {
      return { success: false, error: "Geen voertuig gevonden met dit kenteken" };
    }

    const v = voertuigen[0];
    const b = brandstoffen[0];

    return {
      success: true,
      data: {
        kenteken: v.kenteken,
        merk: v.merk ?? "Onbekend",
        handelsbenaming: v.handelsbenaming ?? "Onbekend",
        brandstof: b?.brandstof_omschrijving ?? "Onbekend",
        eersteKleur: v.eerste_kleur ?? "Onbekend",
        aantalCilinders: v.aantal_cilinders ?? "-",
        cilinderinhoud: v.cilinderinhoud
          ? `${v.cilinderinhoud} cc`
          : "-",
      },
    };
  } catch {
    return { success: false, error: "Kon geen verbinding maken met de RDW" };
  }
}
