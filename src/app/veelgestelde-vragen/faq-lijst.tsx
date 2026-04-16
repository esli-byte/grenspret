"use client";

import { useState, FormEvent } from "react";

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

/* ─── Feedback formulier ─── */
function FeedbackFormulier() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({ naam: "", email: "", telefoon: "", bericht: "" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.naam.trim() || !form.bericht.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.mailto) {
        // Open mailto als fallback
        window.location.href = data.mailto;
      }
      setStatus("sent");
      setForm({ naam: "", email: "", telefoon: "", bericht: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-center">
        <p className="text-sm font-bold text-accent">Bedankt voor je feedback! 🎉</p>
        <p className="mt-1 text-xs text-gray-500">We nemen zo snel mogelijk contact op.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-3 text-xs font-bold text-accent underline"
        >
          Nog een bericht sturen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
          Naam <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={form.naam}
          onChange={(e) => setForm({ ...form, naam: e.target.value })}
          placeholder="Je naam"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-navy outline-none focus:border-accent focus:ring-1 focus:ring-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
          E-mail
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="je@email.nl"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-navy outline-none focus:border-accent focus:ring-1 focus:ring-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
          Telefoonnummer
        </label>
        <input
          type="tel"
          value={form.telefoon}
          onChange={(e) => setForm({ ...form, telefoon: e.target.value })}
          placeholder="06-12345678"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-navy outline-none focus:border-accent focus:ring-1 focus:ring-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
          Bericht / Feedback <span className="text-red-400">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={form.bericht}
          onChange={(e) => setForm({ ...form, bericht: e.target.value })}
          placeholder="Wat wil je ons laten weten?"
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-navy outline-none focus:border-accent focus:ring-1 focus:ring-accent dark:border-white/10 dark:bg-white/5 dark:text-white resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-accent py-2.5 text-xs font-extrabold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {status === "sending" ? "Verzenden..." : "Verzenden"}
      </button>
      {status === "error" && (
        <p className="text-[11px] text-red-500 text-center">
          Er ging iets mis. Probeer het opnieuw.
        </p>
      )}
    </form>
  );
}

/* ─── FAQ vragen — kort en bondig ─── */
const VRAGEN: Vraag[] = [
  {
    vraag: "Wat kost Grenspret?",
    antwoord: "Helemaal gratis!",
  },
  {
    vraag: "Hoeveel brandstof mag ik meenemen?",
    antwoord: "Je volle tank is altijd belastingvrij. Daarnaast mag je 10 liter extra per voertuig meenemen in een goedgekeurde jerrycan zonder accijns te betalen. Meer meenemen mag (tot 240 liter volgens EU-vervoersregels), maar dan ben je verplicht Nederlandse accijns af te dragen.",
  },
  {
    vraag: "Welke jerrycan moet ik kopen?",
    antwoord: "Een UN-goedgekeurde metalen jerrycan. Groen = diesel, rood = benzine. Plastic is niet toegestaan voor benzine.",
  },
  {
    vraag: "Mijn kenteken wordt niet gevonden",
    antwoord: "Voer het in zonder streepjes (bv. AB123C). Alle Nederlandse kentekens worden automatisch herkend via de RDW-database.",
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
  {
    vraag: "Hoe nauwkeurig zijn de berekeningen?",
    antwoord: "We gebruiken echte rijafstanden, actuele brandstofprijzen en officiële RDW-gegevens van je auto. Ons team werkt elke dag aan verbeteringen om de berekeningen nog nauwkeuriger te maken. Grenspret wordt steeds beter!",
  },
  {
    vraag: "Kan ik feedback geven?",
    antwoord: (
      <div className="space-y-3">
        <p>Jazeker! We horen graag wat je vindt van Grenspret.</p>
        <FeedbackFormulier />
      </div>
    ),
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
