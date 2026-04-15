"use client";

import Link from "next/link";
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
            <p className="mb-5 text-center text-[11px] font-extrabold uppercase tracking-widest text-accent">
              Zo bespaar je in 3 stappen
            </p>

            <div className="space-y-5">
              <Stap
                nummer={1}
                titel="Vertel ons over je auto"
                uitleg="Vul je kenteken in en je postcode. Geen zin om te typen? Tik op Huidige locatie, dan haalt je telefoon de postcode zelf op. Je ziet meteen hoeveel je bespaart op een volle tank over de grens, en de tankstations die het dichtste bij liggen."
                tip="Heb je een lease-auto? Vink dat vakje aan en we rekenen geen brandstof mee, alleen je boodschappen."
              />
              <Stap
                nummer={2}
                titel="Zet je boodschappenlijst in elkaar"
                uitleg="Tik op een product om het toe te voegen. Nog een keer tikken voegt er meer van toe. Staat iets er niet bij? Voeg je eigen product toe en wij schatten wat je bespaart."
                tip="Ga je ook voor familie of buren shoppen? Zet Samen boodschappen aan, verdeel per persoon, en stuur achteraf met één tik een Tikkie-bericht."
              />
              <Stap
                nummer={3}
                titel="Zie of de rit het waard is"
                uitleg="Alles op een rij: wat je bespaart op boodschappen, op tanken, en wat de reiskosten van heen en terug je kosten. In één oogopslag zie je of het echt loont om te gaan."
                tip="Eerlijk antwoord, ook als het tegenvalt. Soms is thuisblijven gewoon goedkoper."
                laatste
              />
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-accent/10 px-4 py-3">
              <span className="shrink-0 text-base leading-none">✨</span>
              <p className="text-[11px] font-medium leading-relaxed text-gray-200">
                Je voortgang wordt automatisch opgeslagen. Je kunt altijd terug
                naar een eerdere stap via het menu onderaan het scherm.
              </p>
            </div>

            {/* Subtiele link naar volledige FAQ */}
            <div className="mt-4 text-center">
              <Link
                href="/veelgestelde-vragen"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 transition-colors hover:text-accent"
              >
                Meest gestelde vragen
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
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
  tip,
  laatste,
}: {
  nummer: number;
  titel: string;
  uitleg: string;
  tip?: string;
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
      <div className={`flex-1 ${laatste ? "" : "pb-3"}`}>
        <h3 className="text-sm font-extrabold text-white">{titel}</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-300">{uitleg}</p>
        {tip && (
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-accent/90">
            <span className="shrink-0 leading-none">💡</span>
            <span>{tip}</span>
          </p>
        )}
      </div>
    </div>
  );
}
