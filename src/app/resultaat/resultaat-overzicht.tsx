"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  leesTanken,
  leesBoodschappen,
  leesHuishoudens,
  type TankenOpslag,
  type BoodschappenOpslag,
} from "@/lib/opslag";
import { ShareCard } from "./share-card";

function euro(bedrag: number) {
  return `€${bedrag.toFixed(2)}`;
}

function formatRijtijd(minuten: number): string {
  if (minuten < 60) return `${minuten} min`;
  const uren = Math.floor(minuten / 60);
  const rest = minuten % 60;
  return rest > 0 ? `${uren}u ${rest}min` : `${uren}u`;
}

type Resultaat = {
  land: "Duitsland" | "België";
  vlag: string;
  route?: TankenOpslag["route"][number];
  besparingTanken: number;
  besparingBoodschappen: number;
  besparingBoodschappenPerHH: number;
  reiskostenTotaal: number;
  reiskostenPerHH: number;
  brutoBesparing: number;
  nettoBesparing: number;
  nettoPerPersoon: number;
  nettoPerHuishouden: number;
};

export function ResultaatOverzicht() {
  const [tanken, setTanken] = useState<TankenOpslag | null>(null);
  const [boodschappen, setBoodschappen] = useState<BoodschappenOpslag | null>(null);
  const [aantalPersonen, setAantalPersonen] = useState(1);
  const [aantalHuishoudens, setAantalHuishoudens] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage pas na hydration
    setTanken(leesTanken());
    setBoodschappen(leesBoodschappen());
    setAantalHuishoudens(leesHuishoudens());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  // Geen gegevens: vriendelijke placeholder
  if (!tanken && !boodschappen) {
    return <GeenGegevensPlaceholder />;
  }

  const landen = ["Duitsland", "België"] as const;

  const resultaten: Resultaat[] = landen.map((land) => {
    const vlag = land === "Duitsland" ? "🇩🇪" : "🇧🇪";
    const route = tanken?.route.find((r) => r.land === land);

    const besparingTanken =
      land === "Duitsland" ? tanken?.besparingDE ?? 0 : tanken?.besparingBE ?? 0;

    const besparingBoodschappenPerHH =
      land === "Duitsland"
        ? boodschappen?.besparingDE ?? 0
        : boodschappen?.besparingBE ?? 0;
    const besparingBoodschappen = besparingBoodschappenPerHH * aantalHuishoudens;

    const reiskostenTotaal = route?.reiskosten ?? 0;
    const reiskostenPerHH = reiskostenTotaal / aantalHuishoudens;

    const brutoBesparing = besparingTanken + besparingBoodschappen;
    const nettoBesparing = brutoBesparing - reiskostenTotaal;
    const nettoPerPersoon = nettoBesparing / aantalPersonen;

    const nettoPerHuishouden =
      besparingBoodschappenPerHH +
      besparingTanken / aantalHuishoudens -
      reiskostenPerHH;

    return {
      land,
      vlag,
      route,
      besparingTanken,
      besparingBoodschappen,
      besparingBoodschappenPerHH,
      reiskostenTotaal,
      reiskostenPerHH,
      brutoBesparing,
      nettoBesparing,
      nettoPerPersoon,
      nettoPerHuishouden,
    };
  });

  const beste = resultaten.reduce((a, b) =>
    a.nettoBesparing >= b.nettoBesparing ? a : b
  );

  return (
    <div className="space-y-5">
      {/* Stap indicator */}
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white ring-[1.5px] ring-white dark:ring-navy">
          3
        </div>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Jouw totale besparing
        </p>
        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
      </div>

      {/* Voertuig samenvatting */}
      {tanken && (
        <div className="card-bold flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-xl">
            🚗
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate font-extrabold text-navy dark:text-white">
              {tanken.voertuig.merk} {tanken.voertuig.handelsbenaming}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Chip>{tanken.voertuig.kenteken}</Chip>
              <Chip>{tanken.brandstofSoort}</Chip>
              <Chip>{tanken.tankGrootte} L</Chip>
            </div>
          </div>
        </div>
      )}

      {/* Groepsinfo */}
      {aantalHuishoudens > 1 && (
        <div className="card-bold flex items-center gap-3 p-4 border-accent/20 bg-accent/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-lg">
            🏠
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-extrabold text-accent">
              Groepsrit met {aantalHuishoudens} huishoudens
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Boodschappen ×{aantalHuishoudens}, reiskosten verdeeld over de groep
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-extrabold text-accent transition-colors hover:bg-accent/25"
          >
            Wijzig
          </Link>
        </div>
      )}

      {/* Aantal personen kiezer */}
      <div className="card-bold p-5">
        <label
          htmlFor="personen"
          className="block text-sm font-extrabold text-navy dark:text-white"
        >
          Met hoeveel personen reis je?
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Om de besparing per persoon te laten zien
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setAantalPersonen(Math.max(1, aantalPersonen - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-200 text-lg font-bold text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-400"
            aria-label="Minder personen"
          >
            −
          </button>
          <input
            id="personen"
            type="number"
            min={1}
            max={10}
            value={aantalPersonen}
            onChange={(e) =>
              setAantalPersonen(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
            }
            className="h-10 w-16 rounded-xl border-2 border-gray-200 text-center text-lg font-extrabold text-navy transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
          />
          <button
            onClick={() => setAantalPersonen(Math.min(10, aantalPersonen + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-200 text-lg font-bold text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-400"
            aria-label="Meer personen"
          >
            +
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {aantalPersonen === 1 ? "persoon" : "personen"}
          </span>
        </div>
      </div>

      {/* Conclusie banner — groot en duidelijk */}
      <ConclusieBanner
        beste={beste}
        aantalPersonen={aantalPersonen}
        aantalHuishoudens={aantalHuishoudens}
        heeftTanken={!!tanken}
        heeftBoodschappen={!!boodschappen}
      />

      {/* Resultaat per land */}
      <div className="grid gap-4 sm:grid-cols-2">
        {resultaten.map((r) => (
          <LandKaart
            key={r.land}
            resultaat={r}
            isBeste={r === beste}
            heeftTanken={!!tanken}
            heeftBoodschappen={!!boodschappen}
            aantalHuishoudens={aantalHuishoudens}
            aantalPersonen={aantalPersonen}
          />
        ))}
      </div>

      {/* Deel knoppen */}
      {beste.nettoBesparing > 0 && (
        <DeelKnoppen
          beste={beste}
          aantalHuishoudens={aantalHuishoudens}
        />
      )}

      {/* Ontbrekende gegevens */}
      {(!tanken || !boodschappen) && (
        <div className="card-bold p-5 border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/30">
          <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-200">
            Maak je berekening completer
          </h3>
          <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">
            Vul de ontbrekende stap in om een compleet beeld te krijgen.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {!tanken && (
              <Link
                href="/tanken"
                className="rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-extrabold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
              >
                + Tankbesparing
              </Link>
            )}
            {!boodschappen && (
              <Link
                href="/boodschappen"
                className="rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-extrabold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
              >
                + Boodschappen
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Shop banner */}
      <Link
        href="/shop"
        className="group card-bold flex items-center gap-4 border-accent/20 bg-gradient-to-br from-accent/5 to-emerald-50/50 p-4 dark:from-accent/10 dark:to-emerald-950/20 dark:border-accent/10"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-2xl transition-transform group-hover:scale-110">
          🛢️
        </div>
        <div className="flex-1">
          <div className="text-sm font-extrabold text-navy dark:text-white">
            Nog geen jerrycan?
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Neem extra brandstof mee en bespaar nog meer.
          </p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </Link>

      {/* Gekoppeld-met regel */}
      <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
        Gekoppeld met RDW, Google Maps, CBS, Tankerkoenig en FOD Economie
      </div>
    </div>
  );
}

// ==============================
// Sub-componenten
// ==============================

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      {children}
    </span>
  );
}

function GeenGegevensPlaceholder() {
  return (
    <div className="space-y-5">
      <div className="card-bold p-10 text-center border-dashed">
        <div className="text-5xl">📋</div>
        <h2 className="mt-4 text-lg font-extrabold text-navy dark:text-white">
          Nog geen gegevens
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Vul eerst de tanken- en boodschappen-stappen in en keer hier terug voor je totale besparing.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/tanken"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-xl active:scale-95"
          >
            Begin bij tanken
          </Link>
          <Link
            href="/boodschappen"
            className="rounded-full border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-extrabold text-navy transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
          >
            Of direct boodschappen
          </Link>
        </div>
      </div>
    </div>
  );
}

function LandKaart({
  resultaat: r,
  isBeste,
  heeftTanken,
  heeftBoodschappen,
  aantalHuishoudens,
  aantalPersonen,
}: {
  resultaat: Resultaat;
  isBeste: boolean;
  heeftTanken: boolean;
  heeftBoodschappen: boolean;
  aantalHuishoudens: number;
  aantalPersonen: number;
}) {
  const loont = r.nettoBesparing > 0;
  void heeftTanken;
  void heeftBoodschappen;

  return (
    <div
      className={`card-bold overflow-hidden ${
        loont
          ? isBeste
            ? "border-accent shadow-lg shadow-accent/15"
            : "border-green-200 dark:border-green-800"
          : "border-red-200 dark:border-red-800/50"
      }`}
    >
      {/* Header */}
      <div
        className={`relative px-5 py-5 ${
          loont
            ? isBeste
              ? "bg-gradient-to-br from-primary via-primary-light to-accent"
              : "bg-accent/10 dark:bg-accent/5"
            : "bg-red-50 dark:bg-red-950/30"
        }`}
      >
        {isBeste && loont && (
          <span className="mb-2 inline-block rounded-full bg-white/25 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-white backdrop-blur-sm">
            ⭐ Beste keuze
          </span>
        )}
        <div
          className={`text-xs font-extrabold uppercase tracking-widest ${
            isBeste && loont
              ? "text-white/80"
              : loont
                ? "text-accent/80"
                : "text-red-600 dark:text-red-400"
          }`}
        >
          {r.vlag} {r.land}
        </div>
        <div
          className={`mt-1 text-4xl font-extrabold tabular-nums tracking-tight ${
            isBeste && loont
              ? "text-white"
              : loont
                ? "text-accent"
                : "text-red-600 dark:text-red-400"
          }`}
        >
          {loont ? "+" : ""}
          {euro(r.nettoBesparing)}
        </div>
        <div
          className={`mt-1 text-[11px] font-bold ${
            isBeste && loont ? "text-white/70" : loont ? "text-accent/70" : "text-red-400"
          }`}
        >
          {aantalHuishoudens > 1 ? "totale groepsbesparing" : "netto na reiskosten"}
        </div>
      </div>

      {/* Body */}
      <div className="bg-surface p-5 dark:bg-navy/30">
        <div className="space-y-2.5 text-sm">
          {r.besparingTanken > 0 && (
            <BreakdownRow icon="⛽" label="Tanken" value={`+${euro(r.besparingTanken)}`} positive />
          )}
          {r.besparingBoodschappen > 0 && (
            <BreakdownRow
              icon="🛒"
              label={`Boodschappen${aantalHuishoudens > 1 ? ` (×${aantalHuishoudens})` : ""}`}
              value={`+${euro(r.besparingBoodschappen)}`}
              positive
            />
          )}
          {r.reiskostenTotaal > 0 && (
            <BreakdownRow
              icon="🚗"
              label="Reiskosten heen en terug"
              value={`−${euro(r.reiskostenTotaal)}`}
              negative
            />
          )}

          <div
            className={`flex items-center justify-between border-t-2 pt-2.5 ${
              loont ? "border-accent/20" : "border-red-200 dark:border-red-800/50"
            }`}
          >
            <span className="font-extrabold text-navy dark:text-white">Netto</span>
            <span
              className={`text-lg font-extrabold tabular-nums ${
                loont ? "text-accent" : "text-red-500"
              }`}
            >
              {loont ? "+" : ""}
              {euro(r.nettoBesparing)}
            </span>
          </div>
        </div>

        {/* Per huishouden */}
        {aantalHuishoudens > 1 && (
          <div
            className={`mt-4 rounded-2xl p-3 ${
              r.nettoPerHuishouden > 0 ? "bg-accent/5" : "bg-red-50 dark:bg-red-950/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  Per huishouden
                </div>
                <div
                  className={`mt-0.5 text-xl font-extrabold tabular-nums ${
                    r.nettoPerHuishouden > 0 ? "text-accent" : "text-red-500"
                  }`}
                >
                  {r.nettoPerHuishouden > 0 ? "+" : ""}
                  {euro(r.nettoPerHuishouden)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-gray-400">reiskosten p/hh</div>
                <div className="text-xs font-bold text-gray-600 dark:text-gray-400 tabular-nums">
                  {euro(r.reiskostenPerHH)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Per persoon */}
        {aantalPersonen > 1 && (
          <div
            className={`mt-3 rounded-2xl p-3 text-center ${
              r.nettoPerPersoon > 0 ? "bg-accent/5" : "bg-red-50 dark:bg-red-950/30"
            }`}
          >
            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              Per persoon ({aantalPersonen})
            </div>
            <div
              className={`mt-0.5 text-xl font-extrabold tabular-nums ${
                r.nettoPerPersoon > 0 ? "text-accent" : "text-red-500"
              }`}
            >
              {r.nettoPerPersoon > 0 ? "+" : ""}
              {euro(r.nettoPerPersoon)}
            </div>
          </div>
        )}

        {/* Route badges */}
        {r.route && (
          <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
            <Chip>{r.route.bestemming}</Chip>
            <Chip>{r.route.afstandRetour} km retour</Chip>
            <Chip>{formatRijtijd(r.route.rijtijdMinuten)}</Chip>
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownRow({
  icon,
  label,
  value,
  positive,
  negative,
}: {
  icon: string;
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
        <span className="w-5 text-center">{icon}</span> {label}
      </span>
      <span
        className={`tabular-nums font-extrabold ${
          positive ? "text-accent" : negative ? "text-red-500" : "text-navy dark:text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ConclusieBanner({
  beste,
  aantalPersonen,
  aantalHuishoudens,
  heeftTanken,
  heeftBoodschappen,
}: {
  beste: Resultaat;
  aantalPersonen: number;
  aantalHuishoudens: number;
  heeftTanken: boolean;
  heeftBoodschappen: boolean;
}) {
  const loont = beste.nettoBesparing > 0;

  if (loont) {
    const watTekst = heeftTanken && heeftBoodschappen
      ? "op tanken en boodschappen"
      : heeftTanken
        ? "op tanken"
        : "op boodschappen";

    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-light to-accent p-6 text-white shadow-xl shadow-accent/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-white/70">
            <span className="text-lg">✅</span>
            De rit loont
          </div>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight">
            Rijden naar {beste.vlag} {beste.land} bespaart jou {euro(beste.nettoBesparing)}
          </h2>
          <p className="mt-2 text-sm text-white/85">
            {aantalHuishoudens > 1 ? (
              <>
                Jullie besparen samen{" "}
                <span className="font-extrabold text-white">{euro(beste.nettoBesparing)}</span>
                , dat is {euro(beste.nettoPerHuishouden)} per huishouden {watTekst}, inclusief reiskosten.
              </>
            ) : (
              <>
                Je bespaart {euro(beste.nettoBesparing)}
                {aantalPersonen > 1 && ` (${euro(beste.nettoPerPersoon)} p.p.)`}{" "}
                {watTekst}, inclusief reiskosten heen en terug.
              </>
            )}
          </p>
          {beste.route && (
            <p className="mt-2 text-xs font-medium text-white/60">
              Rijtijd: {formatRijtijd(beste.route.rijtijdMinuten)} enkele reis
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white shadow-xl shadow-red-500/20">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-white/70">
          <span className="text-lg">💭</span>
          Blijf deze keer thuis
        </div>
        <h2 className="mt-2 text-2xl font-extrabold leading-tight">
          Voor deze rit loont het niet
        </h2>
        <p className="mt-2 text-sm text-white/85">
          Je zou {euro(Math.abs(beste.nettoBesparing))} verliezen op {beste.vlag} {beste.land}.
          De reiskosten wegen zwaarder dan de besparing.
        </p>
        <p className="mt-2 text-xs font-medium text-white/70">
          Tip: ga samen met meer huishoudens of maak een grotere boodschappenlijst.
        </p>
      </div>
    </div>
  );
}

function DeelKnoppen({
  beste,
  aantalHuishoudens,
}: {
  beste: Resultaat;
  aantalHuishoudens: number;
}) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [bezig, setBezig] = useState<"tekst" | "afbeelding" | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const bedrag = euro(beste.nettoBesparing);
  const url = typeof window !== "undefined" ? window.location.origin : "grenspret.nl";

  function bouwTekst(): string {
    const intro =
      aantalHuishoudens > 1
        ? `Wij besparen met ${aantalHuishoudens} huishoudens samen ${bedrag} door over de grens te shoppen in ${beste.land}`
        : `Ik bespaar ${bedrag} door over de grens te shoppen in ${beste.land}`;

    const regels: string[] = [intro, ""];
    if (beste.besparingTanken > 0) {
      regels.push(`${beste.vlag} Tanken: +${euro(beste.besparingTanken)}`);
    }
    if (beste.besparingBoodschappen > 0) {
      regels.push(`🛒 Boodschappen: +${euro(beste.besparingBoodschappen)}`);
    }
    if (beste.reiskostenTotaal > 0) {
      regels.push(`🚗 Reiskosten: −${euro(beste.reiskostenTotaal)}`);
    }
    regels.push(`💰 Netto besparing: ${bedrag}`);
    regels.push("");
    regels.push(`Bereken je eigen besparing op ${url}`);
    return regels.join("\n");
  }

  async function handleWhatsApp() {
    const tekst = bouwTekst();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(tekst)}`;
    window.open(whatsappUrl, "_blank");
  }

  async function handleKopieer() {
    setBezig("tekst");
    setStatus(null);
    try {
      await navigator.clipboard.writeText(bouwTekst());
      setStatus("Bericht gekopieerd");
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus("Kon niet kopiëren");
      setTimeout(() => setStatus(null), 2500);
    } finally {
      setBezig(null);
    }
  }

  async function handleAfbeelding() {
    if (!shareRef.current) return;
    setBezig("afbeelding");
    setStatus(null);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0A1628",
      });

      // Converteer naar Blob voor file-share
      const blob = await (await fetch(dataUrl)).blob();
      const bestandsnaam = `grenspret-besparing-${new Date().toISOString().slice(0, 10)}.png`;
      const file = new File([blob], bestandsnaam, { type: "image/png" });

      // Probeer eerst native share met afbeelding
      if (
        typeof navigator !== "undefined" &&
        "canShare" in navigator &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Grenspret besparing",
          text: bouwTekst(),
        });
        setStatus("Gedeeld");
      } else {
        // Fallback: download de afbeelding
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = bestandsnaam;
        link.click();
        setStatus("Afbeelding opgeslagen");
      }
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      console.error("Afbeelding delen mislukt:", err);
      setStatus("Kon afbeelding niet maken");
      setTimeout(() => setStatus(null), 2500);
    } finally {
      setBezig(null);
    }
  }

  return (
    <div className="card-bold p-5 space-y-3">
      <div>
        <h3 className="text-base font-extrabold text-navy dark:text-white">
          Deel je besparing
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Laat vrienden en familie zien dat samen shoppen loont
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#25D366] px-3 py-3.5 text-white shadow-md transition-all hover:bg-[#20bd5a] hover:shadow-lg active:scale-[0.98]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-[11px] font-extrabold">WhatsApp</span>
        </button>

        {/* Afbeelding */}
        <button
          onClick={handleAfbeelding}
          disabled={bezig === "afbeelding"}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-accent px-3 py-3.5 text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {bezig === "afbeelding" ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          )}
          <span className="text-[11px] font-extrabold">Afbeelding</span>
        </button>

        {/* Kopieer */}
        <button
          onClick={handleKopieer}
          disabled={bezig === "tekst"}
          className="col-span-2 flex items-center justify-center gap-1.5 rounded-2xl border-2 border-gray-200 bg-white px-3 py-3.5 text-navy shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-navy/50 dark:text-white sm:col-span-1"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          <span className="text-[11px] font-extrabold">Kopieer tekst</span>
        </button>
      </div>

      {status && (
        <div className="rounded-xl bg-accent/10 px-3 py-2 text-center text-xs font-extrabold text-accent animate-fade-in">
          ✓ {status}
        </div>
      )}

      {/* ShareCard off-screen maar wel volledig gerenderd zodat html-to-image
          het betrouwbaar kan vangen. left: -200vw zet 'm buiten het zicht
          zonder dat browser-optimisaties 'm overslaan. */}
      <div
        style={{
          position: "fixed",
          left: "-200vw",
          top: "0",
          pointerEvents: "none",
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        <ShareCard
          ref={shareRef}
          besparing={beste.nettoBesparing}
          land={beste.land}
          vlag={beste.vlag}
          besparingTanken={beste.besparingTanken}
          besparingBoodschappen={beste.besparingBoodschappen}
          reiskosten={beste.reiskostenTotaal}
          rijtijdMin={beste.route?.rijtijdMinuten}
          afstandKm={beste.route?.afstandRetour}
          aantalHuishoudens={aantalHuishoudens}
        />
      </div>
    </div>
  );
}
