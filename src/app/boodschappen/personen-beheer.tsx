"use client";

import { useState } from "react";
import {
  MIJ_ID,
  MIJ_KLEUR,
  PERSOON_KLEUREN,
  type Persoon,
} from "@/lib/personen";

type Props = {
  personen: Persoon[];
  mijnNaam: string;
  actievePersoon: string;
  groepsmodus: boolean;
  onActiveerPersoon: (id: string) => void;
  onToevoegen: (persoon: Persoon) => void;
  onVerwijder: (id: string) => void;
  onGroepsmodusToggle: (aan: boolean) => void;
};

export function PersonenBeheer({
  personen,
  mijnNaam,
  actievePersoon,
  groepsmodus,
  onActiveerPersoon,
  onToevoegen,
  onVerwijder,
  onGroepsmodusToggle,
}: Props) {
  const [toevoegenOpen, setToevoegenOpen] = useState(false);
  const [nieuweNaam, setNieuweNaam] = useState("");

  function handleToevoegen() {
    const naam = nieuweNaam.trim();
    if (!naam) return;
    // Kies een kleur die nog niet gebruikt is
    const gebruikteKleuren = new Set(personen.map((p) => p.kleur));
    const kleur =
      PERSOON_KLEUREN.find((k) => !gebruikteKleuren.has(k)) ??
      PERSOON_KLEUREN[personen.length % PERSOON_KLEUREN.length];
    onToevoegen({
      id: `persoon-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      naam,
      kleur,
    });
    setNieuweNaam("");
    setToevoegenOpen(false);
  }

  // Samengestelde lijst met "mij" als eerste persoon
  const allePersonen: { id: string; naam: string; kleur: string; verwijderbaar: boolean }[] = [
    { id: MIJ_ID, naam: mijnNaam, kleur: MIJ_KLEUR, verwijderbaar: false },
    ...personen.map((p) => ({ ...p, verwijderbaar: true })),
  ];

  return (
    <div className="card-bold p-4 space-y-3">
      {/* Header met toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <h3 className="text-sm font-extrabold text-navy dark:text-white">
              Samen boodschappen
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Splitten over meerdere mensen, verrekenen na afloop
          </p>
        </div>
        <button
          role="switch"
          aria-checked={groepsmodus}
          onClick={() => onGroepsmodusToggle(!groepsmodus)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            groepsmodus ? "bg-accent" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
              groepsmodus ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Persoon chips + toevoegen */}
      {groepsmodus && (
        <>
          <div className="flex flex-wrap gap-2 pt-1">
            {allePersonen.map((p) => {
              const isActief = p.id === actievePersoon;
              return (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => onActiveerPersoon(p.id)}
                    className={`flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
                      isActief
                        ? "text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                    style={isActief ? { backgroundColor: p.kleur } : undefined}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white"
                      style={{ backgroundColor: p.kleur }}
                    >
                      {p.naam[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span>{p.id === MIJ_ID ? "Ik" : p.naam}</span>
                  </button>
                  {p.verwijderbaar && (
                    <button
                      onClick={() => {
                        if (confirm(`Persoon "${p.naam}" verwijderen?`)) onVerwijder(p.id);
                      }}
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 text-white opacity-60 hover:bg-red-500 hover:opacity-100 transition-all"
                      title="Verwijder persoon"
                    >
                      <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
            {!toevoegenOpen ? (
              <button
                onClick={() => setToevoegenOpen(true)}
                className="flex items-center gap-1.5 rounded-full border-2 border-dashed border-accent/40 px-3 py-1.5 text-xs font-extrabold text-accent hover:border-accent hover:bg-accent/5 active:scale-95"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Persoon
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border-2 border-accent bg-accent/5 pl-3 pr-1 py-0.5">
                <input
                  type="text"
                  value={nieuweNaam}
                  onChange={(e) => setNieuweNaam(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleToevoegen();
                    if (e.key === "Escape") {
                      setToevoegenOpen(false);
                      setNieuweNaam("");
                    }
                  }}
                  placeholder="Naam..."
                  maxLength={20}
                  autoFocus
                  className="w-24 bg-transparent text-xs font-bold text-navy placeholder:font-normal placeholder:text-gray-400 focus:outline-none dark:text-white"
                />
                <button
                  onClick={handleToevoegen}
                  disabled={!nieuweNaam.trim()}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white transition-all hover:bg-accent/90 active:scale-90 disabled:opacity-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setToevoegenOpen(false);
                    setNieuweNaam("");
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-white transition-all hover:bg-gray-400 active:scale-90"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            <span className="font-bold">Actief:</span>{" "}
            producten die je toevoegt komen op de lijst van{" "}
            <span className="font-extrabold" style={{ color: allePersonen.find(p => p.id === actievePersoon)?.kleur }}>
              {allePersonen.find((p) => p.id === actievePersoon)?.naam ?? "iemand"}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
