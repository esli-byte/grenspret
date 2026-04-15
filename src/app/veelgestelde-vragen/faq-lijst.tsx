"use client";

import { useState } from "react";

type Vraag = {
  vraag: string;
  antwoord: React.ReactNode;
};

const VRAGEN: Vraag[] = [
  {
    vraag: "Wat kost Grenspret?",
    antwoord: (
      <>
        <p>
          Helemaal niets. Grenspret is volledig gratis te gebruiken en je hoeft
          ook geen account aan te maken voor de berekening. Een account is
          alleen handig als je je lijstjes wilt bewaren over meerdere apparaten.
        </p>
        <p className="mt-2">
          We verdienen op termijn geld met partnerlinks naar jerrycans en
          supermarkt-bezorgdiensten, niet met je data of reclame.
        </p>
      </>
    ),
  },
  {
    vraag: "Hoeveel brandstof mag ik wettelijk meenemen over de grens?",
    antwoord: (
      <>
        <p>
          In een auto mag je <strong>10 liter per persoon</strong> meenemen in
          een goedgekeurde jerrycan, bovenop wat er in je tank zit. Met vier
          personen in de auto mag je dus tot 40 liter extra meenemen.
        </p>
        <p className="mt-2">
          De jerrycan moet een <strong>UN-goedgekeurde metalen jerrycan</strong> zijn.
          Plastic jerrycans zijn <strong>niet</strong> toegestaan voor benzine.
          Voor diesel gelden soepelere regels, maar metaal blijft de veiligste keuze.
        </p>
      </>
    ),
  },
  {
    vraag: "Welke jerrycan moet ik kopen?",
    antwoord: (
      <>
        <p>
          Kies een <strong>UN-goedgekeurde metalen jerrycan</strong>, meestal herkenbaar
          aan een UN-stempel op de zijkant. Groene jerrycans zijn voor diesel,
          rode voor benzine. Zorg dat hij een stevige sluiting heeft en test
          hem voor gebruik op lekkage.
        </p>
        <p className="mt-2">
          Losse tuiten voor schoner overtanken zijn los te koop. Bewaar je
          jerrycan na gebruik altijd goed geventileerd, niet in je auto.
        </p>
      </>
    ),
  },
  {
    vraag: "Mijn kenteken wordt niet gevonden, wat nu?",
    antwoord: (
      <>
        <p>
          Controleer eerst of je het kenteken zonder streepjes of spaties hebt
          ingevoerd, bijvoorbeeld <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-navy dark:bg-gray-800 dark:text-white">AB123C</code>.
          Grenspret haalt voertuigen op via de RDW, dus alle auto&apos;s met een
          Nederlands kenteken zouden moeten werken.
        </p>
        <p className="mt-2">
          Heb je een geïmporteerde auto, een oldtimer of een lease-auto waarvan
          de exacte gegevens ontbreken? Probeer dan je berekening zonder
          kenteken en vul zelf je tankgrootte en verbruik in. We werken aan een
          handmatige invoer-optie.
        </p>
      </>
    ),
  },
  {
    vraag: "Kan ik Grenspret als app op mijn telefoon zetten?",
    antwoord: (
      <>
        <p>
          Ja, Grenspret is een Progressive Web App. Je kunt hem met twee tikken
          op je beginscherm zetten:
        </p>
        <p className="mt-2">
          <strong>iPhone (Safari):</strong> tik op het delen-icoon onderaan
          (vierkantje met pijltje omhoog) en kies &ldquo;Zet op beginscherm&rdquo;.
        </p>
        <p className="mt-2">
          <strong>Android (Chrome):</strong> tik op het menu (drie puntjes rechtsboven)
          en kies &ldquo;App installeren&rdquo; of &ldquo;Toevoegen aan startscherm&rdquo;.
        </p>
        <p className="mt-2">
          Daarna staat Grenspret als icoon op je telefoon, net als een gewone app.
        </p>
      </>
    ),
  },
  {
    vraag: "Hoe werkt samen boodschappen doen?",
    antwoord: (
      <>
        <p>
          Op de boodschappen-pagina staat bovenaan een schakelaar &ldquo;Samen
          boodschappen&rdquo;. Zet die aan en voeg de mensen toe voor wie je ook
          gaat shoppen. Iedere persoon krijgt een eigen kleur.
        </p>
        <p className="mt-2">
          Tik op een naam om de &ldquo;actieve shopper&rdquo; te wisselen. Producten
          die je daarna aanvinkt komen op diens lijst. Onderaan verschijnt een
          overzicht met per persoon het te betalen bedrag.
        </p>
        <p className="mt-2">
          Achteraf kopieer je met één tik een Tikkie-bericht per persoon,
          inclusief de producten die je voor ze hebt meegenomen.
        </p>
      </>
    ),
  },
  {
    vraag: "Wat als een product niet in de lijst staat?",
    antwoord: (
      <>
        <p>
          Boven in het productgrid staat een gestippelde tegel &ldquo;+ Eigen
          product toevoegen&rdquo;. Klik daarop, vul de naam, de Nederlandse
          prijs en een categorie in. Wij schatten automatisch de prijs in
          Duitsland en België op basis van het gemiddelde prijsverschil van die
          categorie.
        </p>
        <p className="mt-2">
          Je eigen producten blijven bewaard en worden meegenomen in je totale
          besparing, net als de producten uit onze catalogus.
        </p>
      </>
    ),
  },
  {
    vraag: "Wordt mijn informatie opgeslagen of gedeeld?",
    antwoord: (
      <>
        <p>
          Je kenteken, postcode, boodschappenlijst en personen worden alleen
          lokaal op jouw apparaat bewaard. Ze worden <strong>niet</strong> naar
          onze servers gestuurd en <strong>niet</strong> gedeeld met derden.
        </p>
        <p className="mt-2">
          Als je inlogt met Google slaan we alleen een anonieme gebruikers-ID
          en je e-mailadres op, zodat we je lijstjes later kunnen synchroniseren
          over apparaten. Je kunt je account op elk moment verwijderen.
        </p>
      </>
    ),
  },
  {
    vraag: "Loont het echt altijd om over de grens te shoppen?",
    antwoord: (
      <>
        <p>
          Nee, dat hangt helemaal af van je situatie. Als je dicht bij de grens
          woont, met meerdere mensen reist of veel producten koopt die over de
          grens flink goedkoper zijn (zoals alcohol, drogisterij of tabak),
          dan is de besparing vaak tientallen euro&apos;s per rit.
        </p>
        <p className="mt-2">
          Woon je ver van de grens of neem je maar een paar producten mee? Dan
          wegen de reiskosten soms zwaarder dan de besparing. Grenspret geeft
          eerlijk aan wanneer het niet loont, ook al is dat niet wat je wilt
          horen.
        </p>
      </>
    ),
  },
  {
    vraag: "Werkt Grenspret ook voor elektrische auto&apos;s?",
    antwoord: (
      <>
        <p>
          Voor elektrische auto&apos;s is de tankbesparing niet relevant, want
          je laadt thuis of onderweg op. Grenspret herkent dat automatisch aan
          de hand van je kenteken en berekent alleen de boodschappenbesparing
          en reiskosten.
        </p>
        <p className="mt-2">
          Vergeet niet dat laadkosten onderweg ook reiskosten zijn. Als we
          elektrische laadkosten in de toekomst gaan meenemen in de berekening,
          zie je dat hier eerst.
        </p>
      </>
    ),
  },
  {
    vraag: "Hoe kan ik mijn besparing delen met vrienden?",
    antwoord: (
      <>
        <p>
          Op de resultaat-pagina staan drie deel-knoppen: WhatsApp, Afbeelding
          en Kopieer tekst. WhatsApp stuurt een bericht met je besparing en de
          opbouw. De afbeelding-knop maakt een mooie visuele kaart die je in
          Instagram stories of op sociale media kunt plaatsen.
        </p>
        <p className="mt-2">
          Hoe meer mensen de app gebruiken, hoe beter we de prijsdata kunnen
          maken. Dus bedankt alvast voor het delen.
        </p>
      </>
    ),
  },
];

export function FAQLijst() {
  const [open, setOpen] = useState<number | null>(0); // Eerste vraag default open

  return (
    <div className="space-y-2.5">
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
        <div className="animate-fade-in border-t border-gray-100 bg-gray-50/50 px-4 py-4 pl-14 text-sm leading-relaxed text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
          {antwoord}
        </div>
      )}
    </div>
  );
}
