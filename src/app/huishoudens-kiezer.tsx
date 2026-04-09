"use client";

import { useEffect, useState } from "react";
import { leesHuishoudens, slaaHuishoudensOp } from "@/lib/opslag";

const OPTIES = [1, 2, 3, 4, 5];

export function HuishoudensKiezer() {
  const [aantal, setAantal] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAantal(leesHuishoudens());
    setLoaded(true);
  }, []);

  function kies(n: number) {
    setAantal(n);
    slaaHuishoudensOp(n);
  }

  if (!loaded) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm dark:border-gray-800">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xl">
          🏠
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Met hoeveel huishoudens ga je?
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Boodschappen worden vermenigvuldigd, reiskosten gedeeld
          </p>

          <div className="mt-3 flex gap-2">
            {OPTIES.map((n) => (
              <button
                key={n}
                onClick={() => kies(n)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-90 ${
                  n === aantal
                    ? "bg-accent text-white shadow-md shadow-accent/30"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-accent/50 hover:text-accent dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {aantal > 1 && (
            <p className="mt-2 text-xs text-accent font-semibold">
              {aantal} huishoudens — boodschappenbesparing ×{aantal},
              reiskosten ÷{aantal}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
