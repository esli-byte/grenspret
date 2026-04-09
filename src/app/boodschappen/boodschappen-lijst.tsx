"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PRODUCTEN,
  CATEGORIE_LABELS,
  type Categorie,
  type Product,
} from "./producten";
import { slaaBoodschappenOp } from "@/lib/opslag";
import { LocatieKaartjes } from "@/components/LocatieKaartjes";

function euro(bedrag: number) {
  return `€${bedrag.toFixed(2)}`;
}

const CATEGORIEEN = Object.keys(CATEGORIE_LABELS) as Categorie[];

export function BoodschappenLijst() {
  const [geselecteerd, setGeselecteerd] = useState<Set<string>>(new Set());
  const [postcode, setPostcode] = useState("");

  function toggle(id: string) {
    setGeselecteerd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selecteerAlles() {
    if (geselecteerd.size === PRODUCTEN.length) {
      setGeselecteerd(new Set());
    } else {
      setGeselecteerd(new Set(PRODUCTEN.map((p) => p.id)));
    }
  }

  const totalen = useMemo(() => {
    let nl = 0;
    let de = 0;
    let be = 0;

    for (const product of PRODUCTEN) {
      if (geselecteerd.has(product.id)) {
        nl += product.prijsNL;
        de += product.prijsDE;
        be += product.prijsBE;
      }
    }

    return {
      nl,
      de,
      be,
      besparingDE: nl - de,
      besparingBE: nl - be,
    };
  }, [geselecteerd]);

  useEffect(() => {
    if (geselecteerd.size === 0) return;
    slaaBoodschappenOp({
      aantalProducten: geselecteerd.size,
      totaalNL: totalen.nl,
      totaalDE: totalen.de,
      totaalBE: totalen.be,
      besparingDE: totalen.besparingDE,
      besparingBE: totalen.besparingBE,
    });
  }, [totalen, geselecteerd.size]);

  const allesGeselecteerd = geselecteerd.size === PRODUCTEN.length;

  return (
    <div className="space-y-5">
      {/* Selecteer alles */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-primary dark:text-accent">
            {geselecteerd.size}
          </span>{" "}
          van {PRODUCTEN.length} producten
        </p>
        <button
          onClick={selecteerAlles}
          className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-accent/20 dark:text-accent"
        >
          {allesGeselecteerd ? "Deselecteer alles" : "Selecteer alles"}
        </button>
      </div>

      {/* Productlijst per categorie */}
      {CATEGORIEEN.map((cat) => {
        const { label, icoon } = CATEGORIE_LABELS[cat];
        const producten = PRODUCTEN.filter((p) => p.categorie === cat);

        return (
          <div
            key={cat}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-surface shadow-sm dark:border-gray-800"
          >
            <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/30">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {icoon} {label}
              </h2>
            </div>

            <div className="hidden px-5 pt-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:grid sm:grid-cols-[1fr_4.5rem_4.5rem_4.5rem] sm:gap-2 dark:text-gray-500">
              <div>Product</div>
              <div className="text-right">NL</div>
              <div className="text-right">DE</div>
              <div className="text-right">BE</div>
            </div>

            <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {producten.map((product) => (
                <ProductRij
                  key={product.id}
                  product={product}
                  aangevinkt={geselecteerd.has(product.id)}
                  onToggle={() => toggle(product.id)}
                />
              ))}
            </ul>
          </div>
        );
      })}

      {/* Postcode voor supermarkten */}
      <div className="rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm dark:border-gray-800">
        <label
          htmlFor="postcode-boodschappen"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Jouw postcode
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Toon dichtstbijzijnde supermarkten over de grens
        </p>
        <input
          id="postcode-boodschappen"
          type="text"
          placeholder="1234 AB"
          value={postcode}
          onChange={(e) =>
            setPostcode(
              e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9 ]/g, "")
                .slice(0, 7)
            )
          }
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-48"
          autoComplete="postal-code"
        />
      </div>

      {/* Dichtstbijzijnde supermarkten */}
      {postcode && (
        <LocatieKaartjes
          postcode={postcode}
          type="supermarkt"
          titel="Dichtstbijzijnde supermarkten"
        />
      )}

      {/* Totaal overzicht */}
      <TotaalOverzicht totalen={totalen} aantalProducten={geselecteerd.size} />
    </div>
  );
}

function ProductRij({
  product,
  aangevinkt,
  onToggle,
}: {
  product: Product;
  aangevinkt: boolean;
  onToggle: () => void;
}) {
  const verschilDE = product.prijsNL - product.prijsDE;
  const verschilBE = product.prijsNL - product.prijsBE;

  return (
    <li>
      <label
        className={`flex cursor-pointer items-start gap-3 px-5 py-3 transition-all sm:grid sm:grid-cols-[1fr_4.5rem_4.5rem_4.5rem] sm:items-center sm:gap-2 ${
          aangevinkt
            ? "bg-accent/5 dark:bg-accent/10"
            : "hover:bg-surface-hover dark:hover:bg-gray-800/30"
        }`}
      >
        <input
          type="checkbox"
          checked={aangevinkt}
          onChange={onToggle}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-accent focus:ring-accent/30 sm:mt-0"
        />

        <div className="flex-1 sm:flex sm:items-baseline sm:gap-2">
          <span
            className={`text-sm font-medium ${
              aangevinkt
                ? "text-gray-900 dark:text-white"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {product.naam}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {product.eenheid}
          </span>

          <div className="mt-1.5 flex gap-3 text-xs sm:hidden">
            <span className="text-gray-400">NL {euro(product.prijsNL)}</span>
            <PrijsVerschilBadge verschil={verschilDE} land="DE" />
            <PrijsVerschilBadge verschil={verschilBE} land="BE" />
          </div>
        </div>

        <div className="hidden text-right text-sm tabular-nums text-gray-500 sm:block dark:text-gray-400">
          {euro(product.prijsNL)}
        </div>
        <div className="hidden text-right sm:block">
          <PrijsKolom prijs={product.prijsDE} verschil={verschilDE} />
        </div>
        <div className="hidden text-right sm:block">
          <PrijsKolom prijs={product.prijsBE} verschil={verschilBE} />
        </div>
      </label>
    </li>
  );
}

function PrijsKolom({ prijs, verschil }: { prijs: number; verschil: number }) {
  return (
    <div>
      <div className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
        {euro(prijs)}
      </div>
      {verschil > 0.005 && (
        <div className="text-xs tabular-nums font-semibold text-accent">
          -{euro(verschil)}
        </div>
      )}
    </div>
  );
}

function PrijsVerschilBadge({
  verschil,
  land,
}: {
  verschil: number;
  land: string;
}) {
  if (verschil <= 0.005) {
    return (
      <span className="text-gray-400 dark:text-gray-500">
        {land} gelijk
      </span>
    );
  }

  return (
    <span className="font-semibold text-accent">
      {land} -{euro(verschil)}
    </span>
  );
}

function TotaalOverzicht({
  totalen,
  aantalProducten,
}: {
  totalen: {
    nl: number;
    de: number;
    be: number;
    besparingDE: number;
    besparingBE: number;
  };
  aantalProducten: number;
}) {
  if (aantalProducten === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
        <div className="text-3xl">🛒</div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Vink producten aan om je besparing te berekenen
        </p>
      </div>
    );
  }

  const besteLand =
    totalen.besparingDE >= totalen.besparingBE ? "Duitsland" : "België";
  const besteBesparing = Math.max(totalen.besparingDE, totalen.besparingBE);

  return (
    <div className="sticky bottom-20 z-10 -mx-4 border-t border-gray-200/50 bg-white/90 px-4 pb-4 pt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-gray-800/50 dark:bg-[#131a16]/90 sm:static sm:mx-0 sm:rounded-2xl sm:border sm:shadow-sm">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">
        Totaaloverzicht
      </h2>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        {aantalProducten} product{aantalProducten !== 1 && "en"}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
          <div className="text-[11px] font-medium text-gray-400">
            🇳🇱 Nederland
          </div>
          <div className="mt-1 text-base font-extrabold tabular-nums text-gray-900 dark:text-white">
            {euro(totalen.nl)}
          </div>
        </div>

        <div
          className={`rounded-xl p-3 ${
            totalen.besparingDE >= totalen.besparingBE
              ? "bg-accent/10 ring-2 ring-accent/30"
              : "bg-accent/5"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-400">
            🇩🇪 Duitsland
          </div>
          <div className="mt-1 text-base font-extrabold tabular-nums text-gray-900 dark:text-white">
            {euro(totalen.de)}
          </div>
          <div className="mt-0.5 text-xs font-bold tabular-nums text-accent">
            -{euro(totalen.besparingDE)}
          </div>
        </div>

        <div
          className={`rounded-xl p-3 ${
            totalen.besparingBE > totalen.besparingDE
              ? "bg-accent/10 ring-2 ring-accent/30"
              : "bg-accent/5"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-400">
            🇧🇪 België
          </div>
          <div className="mt-1 text-base font-extrabold tabular-nums text-gray-900 dark:text-white">
            {euro(totalen.be)}
          </div>
          <div className="mt-0.5 text-xs font-bold tabular-nums text-accent">
            -{euro(totalen.besparingBE)}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-gradient-to-r from-accent to-emerald-500 p-3.5 text-white">
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <div>
            <div className="text-sm font-bold">
              {besteLand} bespaart je {euro(besteBesparing)}
            </div>
            <div className="text-xs text-white/80">
              {Math.round((besteBesparing / totalen.nl) * 100)}% goedkoper
              (excl. reiskosten)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
