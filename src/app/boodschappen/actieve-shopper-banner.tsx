"use client";

import { MIJ_ID, MIJ_KLEUR, type Persoon } from "@/lib/personen";

type Props = {
  actievePersoon: string;
  personen: Persoon[];
  mijnNaam: string;
};

/**
 * Prominente banner die laat zien voor wie de gebruiker nu shopt.
 * Verschijnt boven de productgrid in groepsmodus.
 */
export function ActieveShopperBanner({ actievePersoon, personen, mijnNaam }: Props) {
  const isIk = actievePersoon === MIJ_ID;
  const persoon = isIk
    ? { naam: mijnNaam, kleur: MIJ_KLEUR }
    : personen.find((p) => p.id === actievePersoon);

  if (!persoon) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-3.5 transition-all"
      style={{
        backgroundColor: `${persoon.kleur}15`,
        borderLeft: `4px solid ${persoon.kleur}`,
      }}
    >
      {/* Subtiele gradient accent */}
      <div
        className="absolute inset-y-0 right-0 w-24 opacity-20 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${persoon.kleur}, transparent)`,
        }}
      />

      <div className="relative flex items-center gap-3">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-md"
          style={{ backgroundColor: persoon.kleur }}
        >
          {persoon.naam[0]?.toUpperCase() ?? "?"}
        </div>

        {/* Tekst */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-60" style={{ color: persoon.kleur }}>
            Je shopt nu voor
          </p>
          <p className="text-base font-extrabold text-navy dark:text-white">
            {isIk ? `${persoon.naam} (ik)` : persoon.naam}
          </p>
        </div>

        {/* Visueel hint */}
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
