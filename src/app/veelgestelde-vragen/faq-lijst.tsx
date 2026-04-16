"use client";

import { useState } from "react";

type Vraag = {
  vraag: string;
  antwoord: React.ReactNode;
};

/* ─── Zo werkt het — compact stappenblok ─── */
function ZoWerktHet() {
  return (
    <div className="card-bold border-accent/20 bg-gradient-to-br from-accent/5 to-emerald-50/30 p-5 dark:from-accent/10 dark:to-emerald-950/20 dark:border-accent/10">
      <h2 className="text-sm font-extrabold text-navy dark:text-white">
        Zo werkt Grenspret
      </h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Kies wat je wilt berekenen en volg de stappen.
      </p>

      <div className="mt-4 space-y-3">
        {/* Stap 1 */}
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-black text-white">1</span>
          <div>
            <p className="text-xs font-extrabold text-navy dark:text-white">Kies je berekening</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Alleen tanken, alleen boodschappen, of allebei tegelijk.
            </p>
          </div>
        </div>

        {/* Stap 2 */}
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-black text-white">2</span>
          <div>
            <p className="text-xs font-extrabold text-navy dark:text-white">Vul je gegevens in</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Kenteken + postcode voor tanken. Kies producten voor boodschappen.
            </p>
          </div>
        </div>

        {/* Stap 3 */}
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-black text-white">3</span>
          <div>
            <p className="text-xs font-extrabold text-navy dark:text-white">Selecteer een locatie</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Wij zoeken de dichtstbijzijnde tankstations en supermarkten in Duitsland of België.
            </p>
          </div>
        </div>

        {/* Stap 4 */}
        <div className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-black text-white">4</span>
          <div>
            <p className="text-xs font-extrabold text-navy dark:text-white">Bekijk je besparing</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Je ziet precies wat je bespaart, inclusief reiskosten. Deel het met vrienden via WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 rounded-xl bg-white/60 p-3 dark:bg-white/5">
        <p className="text-[11px] font-bold text-accent">💡 Tips</p>
        <ul className="mt-1 space-y-0.5 text-[11px] text-gray-600 dark:text-gray-400">
          <li>• Combi (tanken + boodschappen) geeft de meeste besparing</li>
          <li>• Dicht bij de grens? Dan loont het bijna altijd</li>
          <li>• Ga samen met buren of vrienden voor nog meer voordeel</li>
        </ul>
      </div>
    </div>
  );
}

/* ─── FAQ vragen — kort en bondig ─── */
const VRAGEN: Vraag[] = [
  {
    vraag: "Wat kost Grenspret?",
    antwoord: "Helemaal gratis. Geen account nodig. We verdienen op termijn via partnerlinks, niet met je data.",
  },
  {
    vraag: "Hoeveel brandstof mag ik meenemen?",
    antwoord: "10 liter per persoon in een UN-goedgekeurde metalen jerrycan, bovenop wat in je tank zit. Met 4 personen dus 40 liter extra.",
  },
  {
    vraag: "Welke jerrycan moet ik kopen?",
    antwoord: "Een UN-goedgekeurde metalen jerrycan. Groen = diesel, rood = benzine. Plastic is niet toegestaan voor benzine.",
  },
  {
    vraag: "Mijn kenteken wordt niet gevonden",
    antwoord: "Voer het in zonder streepjes (bv. AB123C). Alle Nederlandse kentekens via RDW werken. Geïmporteerde auto? Vul tankgrootte en verbruik handmatig in.",
  },
  {
    vraag: "Kan ik Grenspret als app installeren?",
    antwoord: (
      <>
        <strong>iPhone:</strong> Deel-icoon → &ldquo;Zet op beginscherm&rdquo;.{" "}
        <strong>Android:</strong> Menu (⋮) → &ldquo;App installeren&rdquo;.
      </>
    ),
  },
  {
    vraag: "Product staat niet in de lijst?",
    antwoord: "Tik op '+ Eigen product' bovenin het grid. Vul naam en NL-prijs in, wij schatten de buitenlandse prijs automatisch.",
  },
  {
    vraag: "Wordt mijn data opgeslagen?",
    antwoord: "Alles blijft lokaal op jouw telefoon. Niets gaat naar onze servers. Geen tracking, geen reclame.",
  },
  {
    vraag: "Loont het altijd om over de grens te gaan?",
    antwoord: "Niet altijd. Woon je ver van de grens en koop je weinig, dan wegen de reiskosten zwaarder. Grenspret geeft eerlijk aan wanneer het niet loont.",
  },
  {
    vraag: "Werkt het voor elektrische auto's?",
    antwoord: "Ja, maar de tankbesparing is dan niet relevant. Grenspret herkent dit via je kenteken en berekent alleen de boodschappenbesparing.",
  },
  {
    vraag: "Hoe deel ik mijn besparing?",
    antwoord: "Op de resultaat-pagina staan drie knoppen: WhatsApp, Afbeelding en Kopieer tekst.",
  },
];

export function FAQLijst() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Zo werkt het blok */}
      <ZoWerktHet />

      {/* FAQ lijst */}
      <div className="space-y-2">
        <h2 className="text-sm font-extrabold text-navy dark:text-white px-1">
          Vragen & antwoorden
        </h2>
        {VRAGEN.map((v, i) => (
          <FAQItem
            key={i}
            index={i}
            vraag={v.vraag}
            antwoord={v.antwoord}
            isOpen={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}

function FAQItem({
  index,
  vraag,
  antwoord,
  isOpen,
  onToggle,
}: {
  index: number;
  vraag: string;
  antwoord: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`card-bold overflow-hidden transition-all ${
        isOpen ? "border-accent/30" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
        aria-expanded={isOpen}
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-all ${
            isOpen
              ? "bg-accent text-white"
              : "bg-accent/10 text-accent"
          }`}
        >
          {index + 1}
        </div>
        <h3 className="flex-1 text-sm font-extrabold text-navy dark:text-white">
          {vraag}
        </h3>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-accent" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="animate-fade-in border-t border-gray-100 bg-gray-50/50 px-4 py-3 pl-14 text-xs leading-relaxed text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
          {antwoord}
        </div>
      )}
    </div>
  );
}
