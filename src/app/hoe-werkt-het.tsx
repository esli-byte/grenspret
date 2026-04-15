"use client";

import { useState } from "react";

export function HoeWerktHet() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Toggle knop — subtiel onderaan hero */}
      <button
        onClick={() => setOpen(!open)}
        className={`group mx-auto flex items-center gap-1.5 rounded-full border text-xs font-bold transition-all ${
          open
            ? "border-accent/30 bg-accent/10 px-3.5 py-1.5 text-accent"
            : "border-white/20 bg-white/10 px-3.5 py-1.5 text-white/80 hover:border-white/40 hover:bg-white/15 hover:text-white backdrop-blur-sm"
        }`}
        aria-expanded={open}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
        Hoe werkt het?
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Uitklapbare uitleg */}
      {open && (
        <div className="mt-5 animate-fade-in">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm sm:p-6">
            <p className="mb-4 text-center text-[11px] font-extrabold uppercase tracking-widest text-accent">
              In 3 stappen je besparing berekenen
            </p>

            <div className="space-y-4">
              <Stap
                nummer={1}
                titel="Voer je kenteken en postcode in"
                uitleg="We gebruiken officiële RDW-data voor je voertuiggegevens en OpenStreetMap voor de afstand naar de grens. Zo weten we precies hoeveel brandstof je auto verbruikt op weg naar Duitsland of België."
              />
              <Stap
                nummer={2}
                titel="Vink je boodschappen aan"
                uitleg="Kies uit 150+ veelgekochte producten of voeg je eigen producten toe. Per product zie je direct wat je bespaart over de grens. Ga je met meerdere mensen? Activeer dan samen boodschappen om na afloop makkelijk te verrekenen."
              />
              <Stap
                nummer={3}
                titel="Bekijk je totale netto besparing"
                uitleg="Grenspret trekt de brandstofkosten van heen en terug er al van af. Je ziet dus niet alleen wat je bespaart op boodschappen en tanken, maar ook of de rit het écht waard is."
                laatste
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-accent/10 px-4 py-3 text-center">
              <span className="text-base">💡</span>
              <p className="text-[11px] font-medium leading-snug text-gray-200">
                Altijd transparant: prijzen, afstanden en besparingen tonen we
                met hun bron. Geen verrassingen.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stap({
  nummer,
  titel,
  uitleg,
  laatste,
}: {
  nummer: number;
  titel: string;
  uitleg: string;
  laatste?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-emerald-500 text-xs font-black text-white shadow-lg shadow-accent/30">
          {nummer}
        </div>
        {!laatste && (
          <div className="mt-1 w-0.5 flex-1 bg-gradient-to-b from-accent/40 to-accent/5" />
        )}
      </div>
      <div className={laatste ? "" : "pb-2"}>
        <h3 className="text-sm font-extrabold text-white">{titel}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-300">{uitleg}</p>
      </div>
    </div>
  );
}
