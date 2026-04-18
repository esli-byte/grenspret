export type Coordinaat = { lat: number; lng: number };

export type GrensLocatie = {
  id: string;
  naam: string;
  type: "tankstation" | "supermarkt";
  keten: string;
  land: "Duitsland" | "België" | "Luxemburg";
  adres: string;
  coordinaat: Coordinaat;
};

export const GRENSLOCATIES: GrensLocatie[] = [
  // === TANKSTATIONS DUITSLAND ===
  {
    id: "ts-de-aral-elten",
    naam: "Aral Elten",
    type: "tankstation",
    keten: "Aral",
    land: "Duitsland",
    adres: "Eltener Markt 2, 46446 Emmerich",
    coordinaat: { lat: 51.87, lng: 6.16 },
  },
  {
    id: "ts-de-shell-kranenburg",
    naam: "Shell Kranenburg",
    type: "tankstation",
    keten: "Shell",
    land: "Duitsland",
    adres: "Klever Str. 85, 47559 Kranenburg",
    coordinaat: { lat: 51.78, lng: 6.0 },
  },
  {
    id: "ts-de-aral-suderwick",
    naam: "Aral Suderwick",
    type: "tankstation",
    keten: "Aral",
    land: "Duitsland",
    adres: "Winterswijker Str. 2, 46354 Südlohn",
    coordinaat: { lat: 51.94, lng: 6.87 },
  },
  {
    id: "ts-de-jet-venlo",
    naam: "JET Venlo",
    type: "tankstation",
    keten: "JET",
    land: "Duitsland",
    adres: "Straelener Str. 50, 47638 Straelen",
    coordinaat: { lat: 51.44, lng: 6.27 },
  },
  {
    id: "ts-de-aral-kaldenkirchen",
    naam: "Aral Kaldenkirchen",
    type: "tankstation",
    keten: "Aral",
    land: "Duitsland",
    adres: "Venloer Str. 100, 41334 Nettetal",
    coordinaat: { lat: 51.32, lng: 6.2 },
  },
  {
    id: "ts-de-shell-aachen",
    naam: "Shell Aachen-Vetschau",
    type: "tankstation",
    keten: "Shell",
    land: "Duitsland",
    adres: "Vetschauer Str. 8, 52134 Herzogenrath",
    coordinaat: { lat: 50.87, lng: 6.1 },
  },
  {
    id: "ts-de-esso-bad-bentheim",
    naam: "Esso Bad Bentheim",
    type: "tankstation",
    keten: "Esso",
    land: "Duitsland",
    adres: "Schüttorfer Str. 58, 48455 Bad Bentheim",
    coordinaat: { lat: 52.3, lng: 7.16 },
  },
  {
    id: "ts-de-aral-nordhorn",
    naam: "Aral Nordhorn",
    type: "tankstation",
    keten: "Aral",
    land: "Duitsland",
    adres: "Lingener Str. 62, 48531 Nordhorn",
    coordinaat: { lat: 52.44, lng: 7.07 },
  },
  {
    id: "ts-de-star-meppen",
    naam: "Star Meppen",
    type: "tankstation",
    keten: "Star",
    land: "Duitsland",
    adres: "Hasebrinkstr. 2, 49716 Meppen",
    coordinaat: { lat: 52.69, lng: 7.3 },
  },
  {
    id: "ts-de-aral-bunde",
    naam: "Aral Bunde",
    type: "tankstation",
    keten: "Aral",
    land: "Duitsland",
    adres: "Bunder Str. 10, 26831 Bunde",
    coordinaat: { lat: 53.18, lng: 7.27 },
  },
  // === TANKSTATIONS BELGIE ===
  {
    id: "ts-be-lukoil-hazeldonk",
    naam: "Lukoil Hazeldonk",
    type: "tankstation",
    keten: "Lukoil",
    land: "België",
    adres: "Bredaseweg 185, 2930 Brasschaat",
    coordinaat: { lat: 51.48, lng: 4.52 },
  },
  {
    id: "ts-be-total-zelzate",
    naam: "TotalEnergies Zelzate",
    type: "tankstation",
    keten: "TotalEnergies",
    land: "België",
    adres: "Assenedesteenweg 42, 9060 Zelzate",
    coordinaat: { lat: 51.2, lng: 3.81 },
  },
  {
    id: "ts-be-gulf-lommel",
    naam: "Gulf Lommel",
    type: "tankstation",
    keten: "Gulf",
    land: "België",
    adres: "Luikersteenweg 215, 3920 Lommel",
    coordinaat: { lat: 51.23, lng: 5.31 },
  },
  {
    id: "ts-be-esso-maasmechelen",
    naam: "Esso Maasmechelen",
    type: "tankstation",
    keten: "Esso",
    land: "België",
    adres: "Rijksweg 402, 3630 Maasmechelen",
    coordinaat: { lat: 50.97, lng: 5.69 },
  },
  {
    id: "ts-be-texaco-vise",
    naam: "Texaco Visé",
    type: "tankstation",
    keten: "Texaco",
    land: "België",
    adres: "Rue de Maestricht 12, 4600 Visé",
    coordinaat: { lat: 50.74, lng: 5.7 },
  },
  // === SUPERMARKTEN DUITSLAND ===
  {
    id: "sm-de-aldi-elten",
    naam: "ALDI Elten",
    type: "supermarkt",
    keten: "ALDI",
    land: "Duitsland",
    adres: "Eltener Markt 12, 46446 Emmerich",
    coordinaat: { lat: 51.87, lng: 6.16 },
  },
  {
    id: "sm-de-lidl-kranenburg",
    naam: "Lidl Kranenburg",
    type: "supermarkt",
    keten: "Lidl",
    land: "Duitsland",
    adres: "Großer Haag 10, 47559 Kranenburg",
    coordinaat: { lat: 51.78, lng: 6.01 },
  },
  {
    id: "sm-de-aldi-kaldenkirchen",
    naam: "ALDI Kaldenkirchen",
    type: "supermarkt",
    keten: "ALDI",
    land: "Duitsland",
    adres: "Venloer Str. 49, 41334 Nettetal",
    coordinaat: { lat: 51.32, lng: 6.19 },
  },
  {
    id: "sm-de-kaufland-herzogenrath",
    naam: "Kaufland Herzogenrath",
    type: "supermarkt",
    keten: "Kaufland",
    land: "Duitsland",
    adres: "Roermonder Str. 3, 52134 Herzogenrath",
    coordinaat: { lat: 50.87, lng: 6.09 },
  },
  {
    id: "sm-de-lidl-bad-bentheim",
    naam: "Lidl Bad Bentheim",
    type: "supermarkt",
    keten: "Lidl",
    land: "Duitsland",
    adres: "Gildehauser Weg 55, 48455 Bad Bentheim",
    coordinaat: { lat: 52.31, lng: 7.15 },
  },
  {
    id: "sm-de-aldi-nordhorn",
    naam: "ALDI Nordhorn",
    type: "supermarkt",
    keten: "ALDI",
    land: "Duitsland",
    adres: "Denekamper Str. 120, 48531 Nordhorn",
    coordinaat: { lat: 52.44, lng: 7.06 },
  },
  {
    id: "sm-de-lidl-meppen",
    naam: "Lidl Meppen",
    type: "supermarkt",
    keten: "Lidl",
    land: "Duitsland",
    adres: "Hasebrinkstr. 3, 49716 Meppen",
    coordinaat: { lat: 52.69, lng: 7.29 },
  },
  {
    id: "sm-de-edeka-bunde",
    naam: "EDEKA Bunde",
    type: "supermarkt",
    keten: "EDEKA",
    land: "Duitsland",
    adres: "Bunder Hauptstr. 25, 26831 Bunde",
    coordinaat: { lat: 53.18, lng: 7.26 },
  },
  {
    id: "sm-de-aldi-straelen",
    naam: "ALDI Straelen",
    type: "supermarkt",
    keten: "ALDI",
    land: "Duitsland",
    adres: "Venloer Str. 23, 47638 Straelen",
    coordinaat: { lat: 51.44, lng: 6.27 },
  },
  {
    id: "sm-de-lidl-emmerich",
    naam: "Lidl Emmerich",
    type: "supermarkt",
    keten: "Lidl",
    land: "Duitsland",
    adres: "Reeser Str. 91, 46446 Emmerich",
    coordinaat: { lat: 51.84, lng: 6.24 },
  },
  // === SUPERMARKTEN BELGIE ===
  {
    id: "sm-be-colruyt-essen",
    naam: "Colruyt Essen",
    type: "supermarkt",
    keten: "Colruyt",
    land: "België",
    adres: "Nieuwmoersesteenweg 75, 2910 Essen",
    coordinaat: { lat: 51.46, lng: 4.46 },
  },
  {
    id: "sm-be-aldi-zelzate",
    naam: "ALDI Zelzate",
    type: "supermarkt",
    keten: "ALDI",
    land: "België",
    adres: "Grote Markt 1, 9060 Zelzate",
    coordinaat: { lat: 51.2, lng: 3.81 },
  },
  {
    id: "sm-be-lidl-lommel",
    naam: "Lidl Lommel",
    type: "supermarkt",
    keten: "Lidl",
    land: "België",
    adres: "Balendijk 40, 3920 Lommel",
    coordinaat: { lat: 51.23, lng: 5.32 },
  },
  {
    id: "sm-be-colruyt-maasmechelen",
    naam: "Colruyt Maasmechelen",
    type: "supermarkt",
    keten: "Colruyt",
    land: "België",
    adres: "Rijksweg 315, 3630 Maasmechelen",
    coordinaat: { lat: 50.97, lng: 5.68 },
  },
  {
    id: "sm-be-delhaize-vise",
    naam: "Delhaize Visé",
    type: "supermarkt",
    keten: "Delhaize",
    land: "België",
    adres: "Rue de Maestricht 32, 4600 Visé",
    coordinaat: { lat: 50.74, lng: 5.69 },
  },

  // === TANKSTATIONS LUXEMBURG ===
  {
    id: "ts-lu-aral-wasserbillig",
    naam: "Aral Wasserbillig",
    type: "tankstation",
    keten: "Aral",
    land: "Luxemburg",
    adres: "Route de Trèves, 6601 Wasserbillig",
    coordinaat: { lat: 49.72, lng: 6.50 },
  },
  {
    id: "ts-lu-q8-wasserbillig",
    naam: "Q8 Wasserbillig",
    type: "tankstation",
    keten: "Q8",
    land: "Luxemburg",
    adres: "Esplanade de la Moselle, 6601 Wasserbillig",
    coordinaat: { lat: 49.71, lng: 6.50 },
  },
  {
    id: "ts-lu-shell-remich",
    naam: "Shell Remich",
    type: "tankstation",
    keten: "Shell",
    land: "Luxemburg",
    adres: "Route de l'Europe, 5765 Remich",
    coordinaat: { lat: 49.55, lng: 6.37 },
  },
  {
    id: "ts-lu-total-echternach",
    naam: "TotalEnergies Echternach",
    type: "tankstation",
    keten: "TotalEnergies",
    land: "Luxemburg",
    adres: "Route de Luxembourg, 6450 Echternach",
    coordinaat: { lat: 49.81, lng: 6.42 },
  },
  {
    id: "ts-lu-gulf-esch",
    naam: "Gulf Esch-sur-Alzette",
    type: "tankstation",
    keten: "Gulf",
    land: "Luxemburg",
    adres: "Boulevard J.F. Kennedy, 4170 Esch-sur-Alzette",
    coordinaat: { lat: 49.50, lng: 5.98 },
  },
  {
    id: "ts-lu-aral-mertert",
    naam: "Aral Mertert",
    type: "tankstation",
    keten: "Aral",
    land: "Luxemburg",
    adres: "Route de Wasserbillig, 6686 Mertert",
    coordinaat: { lat: 49.70, lng: 6.48 },
  },

  // === SUPERMARKTEN LUXEMBURG ===
  {
    id: "sm-lu-auchan-kirchberg",
    naam: "Auchan Kirchberg",
    type: "supermarkt",
    keten: "Auchan",
    land: "Luxemburg",
    adres: "31 Rue du Puits Romain, 2956 Luxembourg",
    coordinaat: { lat: 49.63, lng: 6.15 },
  },
  {
    id: "sm-lu-cactus-wasserbillig",
    naam: "Cactus Wasserbillig",
    type: "supermarkt",
    keten: "Cactus",
    land: "Luxemburg",
    adres: "Route de Luxembourg, 6645 Wasserbillig",
    coordinaat: { lat: 49.72, lng: 6.49 },
  },
  {
    id: "sm-lu-lidl-wasserbillig",
    naam: "Lidl Wasserbillig",
    type: "supermarkt",
    keten: "Lidl",
    land: "Luxemburg",
    adres: "Zone Industrielle, 6601 Wasserbillig",
    coordinaat: { lat: 49.72, lng: 6.50 },
  },
  {
    id: "sm-lu-aldi-echternach",
    naam: "ALDI Echternach",
    type: "supermarkt",
    keten: "ALDI",
    land: "Luxemburg",
    adres: "Zone Industrielle, 6450 Echternach",
    coordinaat: { lat: 49.81, lng: 6.41 },
  },
  {
    id: "sm-lu-colruyt-esch",
    naam: "Colruyt Esch-sur-Alzette",
    type: "supermarkt",
    keten: "Colruyt",
    land: "Luxemburg",
    adres: "Rue de Luxembourg, 4221 Esch-sur-Alzette",
    coordinaat: { lat: 49.50, lng: 5.99 },
  },
  {
    id: "sm-lu-delhaize-remich",
    naam: "Delhaize Remich",
    type: "supermarkt",
    keten: "Delhaize",
    land: "Luxemburg",
    adres: "Route de l'Europe, 5765 Remich",
    coordinaat: { lat: 49.55, lng: 6.36 },
  },
];

/** Haversine afstand in km */
export function haversineKm(a: Coordinaat, b: Coordinaat): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export type LocatieMetAfstand = GrensLocatie & {
  afstandKm: number;
  rijtijdMin: number;
  afstandVanThuis?: number; // optioneel: afstand van thuis (voor combi-route)
};

/**
 * Zoek de dichtstbijzijnde locaties van een bepaald type.
 * Returns top N over alle landen, puur gesorteerd op afstand —
 * dichtstbijzijnde bovenaan, ongeacht of het Duitsland of België is.
 */
export function zoekDichtstbijzijnde(
  origin: Coordinaat,
  type: "tankstation" | "supermarkt",
  aantal: number = 5
): LocatieMetAfstand[] {
  const locaties = GRENSLOCATIES.filter((l) => l.type === type);

  const metAfstand: LocatieMetAfstand[] = locaties.map((l) => {
    const hemelsbreedte = haversineKm(origin, l.coordinaat);
    const afstandKm = Math.round(hemelsbreedte * 1.3);
    const rijtijdMin = Math.round((afstandKm / 80) * 60);
    return { ...l, afstandKm, rijtijdMin };
  });

  return metAfstand
    .sort((a, b) => a.afstandKm - b.afstandKm)
    .slice(0, aantal);
}

/**
 * Zoek supermarkten in de buurt van een specifiek coördinaat (bijv. een tankstation).
 * Filtert op hetzelfde land als het tankstation zodat de route logisch blijft.
 * Geeft ook de afstand vanaf de origin (thuis) mee voor de totale route.
 */
export function zoekSupermarktenBijTankstation(
  tankstationCoordinaat: Coordinaat,
  tankstationLand: "Duitsland" | "België" | "Luxemburg",
  thuisCoordinaat: Coordinaat,
  aantal: number = 4
): LocatieMetAfstand[] {
  const supermarkten = GRENSLOCATIES.filter(
    (l) => l.type === "supermarkt" && l.land === tankstationLand
  );

  const metAfstand: LocatieMetAfstand[] = supermarkten.map((l) => {
    // Afstand van tankstation naar supermarkt
    const afstandVanTankstation = haversineKm(tankstationCoordinaat, l.coordinaat) * 1.3;
    // Afstand van thuis naar deze supermarkt (voor totale route)
    const afstandVanThuis = haversineKm(thuisCoordinaat, l.coordinaat) * 1.3;
    const afstandKm = Math.round(afstandVanTankstation);
    const rijtijdMin = Math.round((afstandKm / 60) * 60); // stadsverkeer ~60km/h
    return { ...l, afstandKm, rijtijdMin, afstandVanThuis: Math.round(afstandVanThuis) };
  });

  return metAfstand
    .sort((a, b) => a.afstandKm - b.afstandKm)
    .slice(0, aantal);
}

/**
 * Postcode naar coordinaat.
 * Probeert eerst 4-cijferig (nauwkeurig ~1km), valt terug naar 2-cijferig (~20km).
 */
export function postcodeNaarCoordinaat(
  postcode: string
): Coordinaat | null {
  const clean = postcode.replace(/\s/g, "");
  // Probeer 4 cijfers eerst (meest nauwkeurig)
  const pc4 = clean.slice(0, 4);
  if (pc4.length === 4 && POSTCODE_COORDINATEN[pc4]) {
    return POSTCODE_COORDINATEN[pc4];
  }
  // Fallback naar 2 cijfers
  const pc2 = clean.slice(0, 2);
  return POSTCODE_COORDINATEN[pc2] ?? null;
}

const POSTCODE_COORDINATEN: Record<string, Coordinaat> = {
  "10": { lat: 52.37, lng: 4.89 },
  "11": { lat: 52.36, lng: 4.87 },
  "12": { lat: 52.33, lng: 4.86 },
  "13": { lat: 52.4, lng: 4.84 },
  "14": { lat: 52.42, lng: 4.83 },
  "15": { lat: 52.53, lng: 4.8 },
  "16": { lat: 52.45, lng: 4.65 },
  "17": { lat: 52.63, lng: 4.75 },
  "18": { lat: 52.7, lng: 5.05 },
  "19": { lat: 52.52, lng: 4.95 },
  "20": { lat: 51.92, lng: 4.48 },
  "21": { lat: 51.87, lng: 4.5 },
  "22": { lat: 51.89, lng: 4.47 },
  "23": { lat: 51.93, lng: 4.45 },
  "24": { lat: 51.95, lng: 4.55 },
  "25": { lat: 51.92, lng: 4.42 },
  "26": { lat: 51.97, lng: 4.36 },
  "27": { lat: 51.85, lng: 4.65 },
  "28": { lat: 51.82, lng: 4.64 },
  "29": { lat: 51.82, lng: 4.55 },
  "30": { lat: 52.08, lng: 4.28 },
  "31": { lat: 52.05, lng: 4.32 },
  "32": { lat: 52.12, lng: 4.28 },
  "33": { lat: 52.04, lng: 4.35 },
  "34": { lat: 52.16, lng: 4.49 },
  "35": { lat: 52.17, lng: 4.47 },
  "36": { lat: 52.06, lng: 4.5 },
  "37": { lat: 52.0, lng: 4.37 },
  "38": { lat: 52.08, lng: 4.32 },
  "39": { lat: 52.16, lng: 4.45 },
  "40": { lat: 51.59, lng: 4.78 },
  "41": { lat: 51.55, lng: 4.47 },
  "42": { lat: 51.48, lng: 3.61 },
  "43": { lat: 51.5, lng: 3.6 },
  "44": { lat: 51.44, lng: 3.57 },
  "45": { lat: 51.58, lng: 3.77 },
  "46": { lat: 51.65, lng: 3.83 },
  "47": { lat: 51.6, lng: 4.73 },
  "48": { lat: 51.59, lng: 4.78 },
  "49": { lat: 51.57, lng: 4.97 },
  "50": { lat: 51.44, lng: 5.47 },
  "51": { lat: 51.5, lng: 5.07 },
  "52": { lat: 51.69, lng: 5.3 },
  "53": { lat: 51.43, lng: 5.48 },
  "54": { lat: 51.46, lng: 5.51 },
  "55": { lat: 51.44, lng: 5.63 },
  "56": { lat: 51.42, lng: 5.46 },
  "57": { lat: 51.45, lng: 5.7 },
  "58": { lat: 51.45, lng: 5.48 },
  "59": { lat: 51.48, lng: 5.4 },
  "60": { lat: 51.98, lng: 5.91 },
  "61": { lat: 51.97, lng: 5.95 },
  "62": { lat: 51.85, lng: 5.87 },
  "63": { lat: 51.84, lng: 5.86 },
  "64": { lat: 51.96, lng: 5.83 },
  "65": { lat: 51.82, lng: 5.86 },
  "66": { lat: 52.0, lng: 6.03 },
  "67": { lat: 52.22, lng: 6.15 },
  "68": { lat: 52.01, lng: 6.24 },
  "69": { lat: 52.06, lng: 5.98 },
  "70": { lat: 52.52, lng: 6.08 },
  "71": { lat: 52.48, lng: 6.25 },
  "72": { lat: 52.53, lng: 6.09 },
  "73": { lat: 52.24, lng: 6.17 },
  "74": { lat: 52.43, lng: 6.45 },
  "75": { lat: 52.35, lng: 6.67 },
  "76": { lat: 52.75, lng: 6.5 },
  "77": { lat: 52.73, lng: 6.6 },
  "78": { lat: 52.51, lng: 6.08 },
  "79": { lat: 52.42, lng: 6.11 },
  "80": { lat: 52.22, lng: 5.17 },
  "81": { lat: 52.16, lng: 5.38 },
  "82": { lat: 52.39, lng: 5.27 },
  "83": { lat: 52.35, lng: 5.22 },
  "84": { lat: 52.3, lng: 5.17 },
  "85": { lat: 52.51, lng: 5.47 },
  "86": { lat: 52.53, lng: 5.72 },
  "87": { lat: 52.63, lng: 5.92 },
  "88": { lat: 52.78, lng: 5.7 },
  "89": { lat: 52.52, lng: 5.42 },
  "90": { lat: 53.22, lng: 6.57 },
  "91": { lat: 53.15, lng: 6.75 },
  "92": { lat: 53.0, lng: 6.55 },
  "93": { lat: 52.95, lng: 6.65 },
  "94": { lat: 53.25, lng: 6.52 },
  "95": { lat: 53.33, lng: 6.25 },
  "96": { lat: 53.2, lng: 5.8 },
  "97": { lat: 52.85, lng: 6.4 },
  "98": { lat: 53.1, lng: 6.56 },
  "99": { lat: 52.77, lng: 6.9 },

  // === 4-CIJFERIGE POSTCODES (nauwkeurig ~1km) ===
  // Grensgebied Zuid (Zeeuws-Vlaanderen, West-Brabant)
  "3221": { lat: 51.82, lng: 4.13 }, // Hellevoetsluis
  "3222": { lat: 51.83, lng: 4.14 },
  "3223": { lat: 51.84, lng: 4.12 },
  "3011": { lat: 51.92, lng: 4.48 }, // Rotterdam centrum
  "3012": { lat: 51.92, lng: 4.47 },
  "3013": { lat: 51.93, lng: 4.48 },
  "3071": { lat: 51.89, lng: 4.51 }, // Rotterdam Zuid
  "4301": { lat: 51.53, lng: 4.29 }, // Zierikzee
  "4331": { lat: 51.50, lng: 3.61 }, // Middelburg
  "4382": { lat: 51.45, lng: 3.58 }, // Vlissingen
  "4501": { lat: 51.35, lng: 3.83 }, // Oostburg
  "4511": { lat: 51.33, lng: 3.56 }, // Breskens
  "4524": { lat: 51.27, lng: 3.80 }, // Sluis
  "4535": { lat: 51.32, lng: 4.01 }, // Terneuzen
  "4600": { lat: 51.35, lng: 4.16 }, // Bergen op Zoom
  "4611": { lat: 51.50, lng: 4.29 },
  "4700": { lat: 51.59, lng: 4.32 }, // Roosendaal
  "4701": { lat: 51.53, lng: 4.46 },
  "4800": { lat: 51.59, lng: 4.78 }, // Breda
  "4801": { lat: 51.59, lng: 4.77 },
  "4811": { lat: 51.59, lng: 4.78 },
  "4818": { lat: 51.59, lng: 4.80 },
  "4900": { lat: 51.50, lng: 4.93 }, // Oosterhout
  "5000": { lat: 51.44, lng: 5.47 }, // Tilburg
  "5001": { lat: 51.56, lng: 5.08 },
  "5038": { lat: 51.69, lng: 5.30 },
  "5211": { lat: 51.69, lng: 5.30 }, // 's-Hertogenbosch
  "5212": { lat: 51.69, lng: 5.31 },
  "5401": { lat: 51.77, lng: 5.53 }, // Uden
  "5500": { lat: 51.44, lng: 5.48 }, // Veldhoven
  "5600": { lat: 51.44, lng: 5.48 }, // Eindhoven
  "5611": { lat: 51.44, lng: 5.48 },
  "5612": { lat: 51.44, lng: 5.47 },
  "5616": { lat: 51.43, lng: 5.44 },
  "5700": { lat: 51.48, lng: 5.67 }, // Helmond
  "5800": { lat: 51.49, lng: 5.68 },

  // Grensgebied Limburg
  "5900": { lat: 51.45, lng: 5.98 }, // Venlo-regio
  "5911": { lat: 51.37, lng: 5.97 }, // Venlo
  "5912": { lat: 51.37, lng: 5.98 },
  "5914": { lat: 51.36, lng: 5.97 },
  "5921": { lat: 51.40, lng: 5.96 }, // Blerick
  "6001": { lat: 51.25, lng: 5.97 }, // Weert
  "6041": { lat: 51.17, lng: 5.99 }, // Roermond
  "6042": { lat: 51.19, lng: 5.99 },
  "6101": { lat: 51.05, lng: 5.88 }, // Echt
  "6131": { lat: 50.98, lng: 5.87 }, // Sittard
  "6132": { lat: 50.99, lng: 5.87 },
  "6161": { lat: 50.95, lng: 5.83 }, // Geleen
  "6200": { lat: 50.85, lng: 5.69 }, // Maastricht
  "6211": { lat: 50.85, lng: 5.69 },
  "6212": { lat: 50.84, lng: 5.68 },
  "6213": { lat: 50.84, lng: 5.69 },
  "6221": { lat: 50.85, lng: 5.70 },
  "6229": { lat: 50.84, lng: 5.71 },
  "6301": { lat: 50.87, lng: 5.98 }, // Valkenburg
  "6400": { lat: 50.87, lng: 5.98 }, // Heerlen
  "6411": { lat: 50.89, lng: 5.98 },
  "6412": { lat: 50.88, lng: 5.99 },
  "6461": { lat: 50.87, lng: 6.01 }, // Kerkrade

  // Grensgebied Oost (Gelderland, Overijssel, Twente)
  "6500": { lat: 51.84, lng: 5.85 }, // Nijmegen
  "6511": { lat: 51.84, lng: 5.87 },
  "6512": { lat: 51.85, lng: 5.87 },
  "6541": { lat: 51.84, lng: 5.86 },
  "6611": { lat: 51.77, lng: 5.53 },
  "6701": { lat: 51.96, lng: 5.91 }, // Wageningen
  "6811": { lat: 51.97, lng: 5.91 }, // Arnhem
  "6812": { lat: 51.98, lng: 5.91 },
  "6821": { lat: 51.98, lng: 5.92 },
  "6901": { lat: 52.01, lng: 6.30 }, // Zevenaar
  "6921": { lat: 51.90, lng: 6.10 }, // Duiven
  "6951": { lat: 52.06, lng: 6.15 }, // Dieren
  "7001": { lat: 52.22, lng: 6.15 }, // Doetinchem
  "7002": { lat: 52.21, lng: 6.97 },
  "7011": { lat: 52.22, lng: 6.16 },
  "7101": { lat: 52.15, lng: 6.74 }, // Winterswijk
  "7201": { lat: 52.27, lng: 6.16 }, // Zutphen
  "7311": { lat: 52.22, lng: 6.90 }, // Apeldoorn
  "7411": { lat: 52.35, lng: 6.66 }, // Deventer
  "7500": { lat: 52.43, lng: 6.45 }, // Enschede-regio
  "7511": { lat: 52.22, lng: 6.89 }, // Enschede
  "7512": { lat: 52.22, lng: 6.90 },
  "7521": { lat: 52.22, lng: 6.88 },
  "7541": { lat: 52.22, lng: 6.87 },
  "7556": { lat: 52.23, lng: 6.87 }, // Hengelo
  "7571": { lat: 52.27, lng: 6.80 }, // Oldenzaal
  "7600": { lat: 52.43, lng: 6.45 }, // Almelo
  "7621": { lat: 52.35, lng: 6.76 }, // Borne
  "7701": { lat: 52.54, lng: 6.62 }, // Dedemsvaart
  "7741": { lat: 52.59, lng: 6.67 }, // Coevorden

  // Grensgebied Noord (Drenthe, Groningen)
  "7800": { lat: 52.53, lng: 6.09 }, // Emmen-regio
  "7811": { lat: 52.79, lng: 6.90 }, // Emmen
  "7812": { lat: 52.78, lng: 6.89 },
  "7901": { lat: 52.73, lng: 6.50 }, // Hoogeveen
  "7940": { lat: 52.86, lng: 6.32 }, // Meppel
  "8011": { lat: 52.51, lng: 6.09 }, // Zwolle
  "8012": { lat: 52.52, lng: 6.10 },
  "9400": { lat: 53.01, lng: 6.56 }, // Assen
  "9401": { lat: 53.00, lng: 6.55 },
  "9501": { lat: 53.06, lng: 6.97 }, // Stadskanaal
  "9601": { lat: 53.17, lng: 6.76 }, // Hoogezand
  "9700": { lat: 53.22, lng: 6.57 }, // Groningen
  "9711": { lat: 53.22, lng: 6.57 },
  "9712": { lat: 53.22, lng: 6.56 },
  "9718": { lat: 53.22, lng: 6.55 },
  "9900": { lat: 53.26, lng: 7.21 }, // Appingedam
  "9901": { lat: 53.32, lng: 7.05 },
  "9910": { lat: 53.24, lng: 7.03 },
  "9930": { lat: 53.18, lng: 7.21 }, // Delfzijl
  "9950": { lat: 53.18, lng: 7.09 }, // Winschoten

  // Grote steden (veel gebruikers)
  "1011": { lat: 52.37, lng: 4.90 }, // Amsterdam centrum
  "1012": { lat: 52.37, lng: 4.89 },
  "1013": { lat: 52.38, lng: 4.88 },
  "1071": { lat: 52.35, lng: 4.88 }, // Amsterdam Zuid
  "1081": { lat: 52.34, lng: 4.87 }, // Amstelveen
  "1101": { lat: 52.31, lng: 4.94 }, // Amsterdam Zuidoost
  "2011": { lat: 52.38, lng: 4.64 }, // Haarlem
  "2511": { lat: 52.08, lng: 4.31 }, // Den Haag
  "2512": { lat: 52.08, lng: 4.31 },
  "2515": { lat: 52.07, lng: 4.29 },
  "3500": { lat: 52.09, lng: 5.12 }, // Utrecht
  "3511": { lat: 52.09, lng: 5.12 },
  "3512": { lat: 52.09, lng: 5.12 },
  "3513": { lat: 52.10, lng: 5.12 },
  "3818": { lat: 52.15, lng: 5.37 }, // Amersfoort
  "3822": { lat: 52.16, lng: 5.39 },
};
