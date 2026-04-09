"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  leesTanken,
  leesBoodschappen,
  leesHuishoudens,
  type TankenOpslag,
  type BoodschappenOpslag,
} from "@/lib/opslag";

function euro(bedrag: number) {
  return `€${bedrag.toFixed(2)}`;
}

function formatRijtijd(minuten: number): string {
  if (minuten < 60) return `${minuten} min`;
  const uren = Math.floor(minuten / 60);
  const rest = minuten % 60;
  return rest > 0 ? `${uren}u ${rest}min` : `${uren}u`;
}

export function ResultaatOverzicht() {
  const [tanken, setTanken] = useState<TankenOpslag | null>(null);
  const [boodschappen, setBoodschappen] = useState<BoodschappenOpslag | null>(
    null
  );
  const [aantalPersonen, setAantalPersonen] = useState(1);
  const [aantalHuishoudens, setAantalHuishoudens] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTanken(leesTanken());
    setBoodschappen(leesBoodschappen());
    setAantalHuishoudens(leesHuishoudens());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!tanken && !boodschappen) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-surface p-10 text-center dark:border-gray-700">
          <div className="text-5xl">📋</div>
          <h2 className="mt-4 text-lg font-extrabold text-gray-900 dark:text-white">
            Nog geen gegevens
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Vul eerst je gegevens in op de tanken- en boodschappenpagina.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/tanken"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              Naar tanken
            </Link>
            <Link
              href="/boodschappen"
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Naar boodschappen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const landen = ["Duitsland", "België"] as const;

  const resultaten = landen.map((land) => {
    const vlag = land === "Duitsland" ? "🇩🇪" : "🇧🇪";
    const route = tanken?.route.find((r) => r.land === land);

    const besparingTanken =
      land === "Duitsland"
        ? tanken?.besparingDE ?? 0
        : tanken?.besparingBE ?? 0;

    // Boodschappenbesparing × aantal huishoudens
    const besparingBoodschappenPerHH =
      land === "Duitsland"
        ? boodschappen?.besparingDE ?? 0
        : boodschappen?.besparingBE ?? 0;
    const besparingBoodschappen =
      besparingBoodschappenPerHH * aantalHuishoudens;

    // Reiskosten gedeeld door huishoudens
    const reiskostenTotaal = route?.reiskosten ?? 0;
    const reiskostenPerHH = reiskostenTotaal / aantalHuishoudens;

    const brutoBesparing = besparingTanken + besparingBoodschappen;
    const nettoBesparing = brutoBesparing - reiskostenTotaal;
    const nettoPerPersoon = nettoBesparing / aantalPersonen;

    // Per huishouden: eigen boodschappen + gedeelde tankbesparing + gedeelde reiskosten
    const nettoPerHuishouden =
      besparingBoodschappenPerHH +
      besparingTanken / aantalHuishoudens -
      reiskostenPerHH;

    // Totale groepsbesparing
    const totaleGroepsbesparing = nettoBesparing;

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
      totaleGroepsbesparing,
    };
  });

  const beste = resultaten.reduce((a, b) =>
    a.nettoBesparing >= b.nettoBesparing ? a : b
  );

  return (
    <div className="space-y-5">
      {/* Voertuig samenvatting */}
      {tanken && (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-surface p-4 shadow-sm dark:border-gray-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-xl">
            🚗
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 dark:text-white">
              {tanken.voertuig.merk} {tanken.voertuig.handelsbenaming}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {tanken.voertuig.kenteken}
              </span>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {tanken.brandstofSoort}
              </span>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {tanken.tankGrootte}L
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Groepsinfo badge */}
      {aantalHuishoudens > 1 && (
        <div className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4 dark:border-accent/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-lg">
            🏠
          </div>
          <div>
            <div className="text-sm font-bold text-primary dark:text-accent">
              Groepsrit: {aantalHuishoudens} huishoudens
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Boodschappen ×{aantalHuishoudens}, reiskosten ÷
              {aantalHuishoudens}
            </div>
          </div>
          <Link
            href="/"
            className="ml-auto rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-accent/20 dark:text-accent"
          >
            Wijzig
          </Link>
        </div>
      )}

      {/* Aantal personen */}
      <div className="rounded-2xl border border-gray-100 bg-surface p-5 shadow-sm dark:border-gray-800">
        <label
          htmlFor="personen"
          className="block text-sm font-bold text-gray-900 dark:text-white"
        >
          Aantal personen in de auto
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Om de besparing per persoon te berekenen
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setAantalPersonen(Math.max(1, aantalPersonen - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-lg font-bold text-gray-500 transition-all hover:bg-surface-hover active:scale-95 dark:border-gray-700 dark:text-gray-400"
          >
            -
          </button>
          <input
            id="personen"
            type="number"
            min={1}
            max={10}
            value={aantalPersonen}
            onChange={(e) =>
              setAantalPersonen(
                Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
              )
            }
            className="h-10 w-16 rounded-xl border border-gray-200 text-center text-lg font-extrabold text-gray-900 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={() => setAantalPersonen(Math.min(10, aantalPersonen + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-lg font-bold text-gray-500 transition-all hover:bg-surface-hover active:scale-95 dark:border-gray-700 dark:text-gray-400"
          >
            +
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {aantalPersonen === 1 ? "persoon" : "personen"}
          </span>
        </div>
      </div>

      {/* Resultaat per land */}
      <div className="grid gap-4 sm:grid-cols-2">
        {resultaten.map((r) => {
          const loont = r.nettoBesparing > 0;
          const isBeste = r === beste;

          return (
            <div
              key={r.land}
              className={`relative overflow-hidden rounded-2xl border-2 shadow-sm transition-all hover:shadow-md ${
                loont
                  ? isBeste
                    ? "border-accent"
                    : "border-green-200 dark:border-green-800"
                  : "border-red-200 dark:border-red-800"
              }`}
            >
              {/* Header */}
              <div
                className={`px-5 py-5 ${
                  loont
                    ? isBeste
                      ? "bg-gradient-to-br from-primary to-accent"
                      : "bg-accent/10 dark:bg-accent/5"
                    : "bg-red-50 dark:bg-red-950/30"
                }`}
              >
                {isBeste && loont && (
                  <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                    Beste keuze
                  </span>
                )}
                <div
                  className={`text-sm font-semibold ${
                    isBeste && loont
                      ? "text-white/80"
                      : loont
                        ? "text-primary dark:text-accent"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {r.vlag} {r.land}
                </div>
                <div
                  className={`mt-1 text-4xl font-extrabold tracking-tight ${
                    isBeste && loont
                      ? "text-white"
                      : loont
                        ? "text-primary dark:text-accent"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {loont ? "+" : ""}
                  {euro(r.nettoBesparing)}
                </div>
                <div
                  className={`mt-1 text-xs font-bold ${
                    isBeste && loont
                      ? "text-white/70"
                      : loont
                        ? "text-accent/70"
                        : "text-red-400"
                  }`}
                >
                  {aantalHuishoudens > 1
                    ? "totale groepsbesparing"
                    : "netto besparing"}
                </div>
              </div>

              {/* Body */}
              <div className="bg-surface p-5">
                <div className="space-y-2 text-sm">
                  {tanken && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span>⛽</span> Tanken
                      </span>
                      <span className="tabular-nums font-bold text-accent">
                        +{euro(r.besparingTanken)}
                      </span>
                    </div>
                  )}

                  {boodschappen && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span>🛒</span> Boodschappen
                        {aantalHuishoudens > 1 && (
                          <span className="text-[11px] text-gray-400">
                            (×{aantalHuishoudens})
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums font-bold text-accent">
                        +{euro(r.besparingBoodschappen)}
                      </span>
                    </div>
                  )}

                  {r.route && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span>🚗</span> Reiskosten
                      </span>
                      <span className="tabular-nums font-bold text-red-500">
                        -{euro(r.reiskostenTotaal)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-between border-t-2 pt-2 ${
                      loont
                        ? "border-accent/20"
                        : "border-red-200 dark:border-red-800"
                    }`}
                  >
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      Netto totaal
                    </span>
                    <span
                      className={`tabular-nums text-lg font-extrabold ${
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
                    className={`mt-4 rounded-xl p-3 ${
                      r.nettoPerHuishouden > 0
                        ? "bg-accent/5"
                        : "bg-red-50 dark:bg-red-950/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Per huishouden
                        </div>
                        <div
                          className={`mt-0.5 text-xl font-extrabold tabular-nums ${
                            r.nettoPerHuishouden > 0
                              ? "text-accent"
                              : "text-red-500"
                          }`}
                        >
                          {r.nettoPerHuishouden > 0 ? "+" : ""}
                          {euro(r.nettoPerHuishouden)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-gray-400">
                          reiskosten p/hh
                        </div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {euro(r.reiskostenPerHH)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Per persoon */}
                {aantalPersonen > 1 && (
                  <div
                    className={`mt-3 rounded-xl p-3 text-center ${
                      r.nettoPerPersoon > 0
                        ? "bg-accent/5"
                        : "bg-red-50 dark:bg-red-950/30"
                    }`}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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

                {r.route && (
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                      {r.route.bestemming}
                    </span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                      {r.route.afstandRetour} km
                    </span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                      {formatRijtijd(r.route.rijtijdMinuten)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conclusie banner */}
      <ConclusieBanner
        beste={beste}
        aantalPersonen={aantalPersonen}
        aantalHuishoudens={aantalHuishoudens}
        heeftTanken={!!tanken}
        heeftBoodschappen={!!boodschappen}
      />

      {/* WhatsApp deel knop */}
      {beste.nettoBesparing > 0 && (
        <DeelKnop
          besparing={beste.nettoBesparing}
          land={beste.land}
          aantalHuishoudens={aantalHuishoudens}
        />
      )}

      {/* Ontbrekende gegevens */}
      {(!tanken || !boodschappen) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
            Maak je berekening completer
          </h3>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {!tanken && (
              <Link
                href="/tanken"
                className="rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
              >
                + Tankbesparing
              </Link>
            )}
            {!boodschappen && (
              <Link
                href="/boodschappen"
                className="rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
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
        className="group flex items-center gap-4 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 to-emerald-50 p-4 transition-all hover:shadow-md dark:from-accent/10 dark:to-emerald-950/20 dark:border-accent/10"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-2xl transition-transform group-hover:scale-110">
          🛢️
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            Nog geen jerrycan?
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Neem extra brandstof mee en bespaar nog meer. Bekijk onze
            aanbevolen producten.
          </p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </Link>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Alle bedragen zijn schattingen. Werkelijke besparing kan afwijken.
      </p>
    </div>
  );
}

function DeelKnop({
  besparing,
  land,
  aantalHuishoudens,
}: {
  besparing: number;
  land: string;
  aantalHuishoudens: number;
}) {
  function handleDeel() {
    const bedrag = euro(besparing);
    const tekst =
      aantalHuishoudens > 1
        ? `Wij besparen ${bedrag} met ${aantalHuishoudens} huishoudens door samen over de grens te shoppen in ${land}! Check het zelf op`
        : `Ik bespaar ${bedrag} door over de grens te shoppen in ${land}! Check het zelf op`;

    const url = typeof window !== "undefined" ? window.location.origin : "";
    const volledigeTekst = `${tekst} ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(volledigeTekst)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <button
      onClick={handleDeel}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-white shadow-md transition-all hover:bg-[#20bd5a] hover:shadow-lg active:scale-[0.98]"
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <div className="text-left">
        <div className="text-sm font-bold">Deel via WhatsApp</div>
        <div className="text-xs text-white/80">
          Laat je vrienden weten hoeveel je bespaart
        </div>
      </div>
    </button>
  );
}

function ConclusieBanner({
  beste,
  aantalPersonen,
  aantalHuishoudens,
  heeftTanken,
  heeftBoodschappen,
}: {
  beste: {
    land: string;
    vlag: string;
    nettoBesparing: number;
    nettoPerPersoon: number;
    nettoPerHuishouden: number;
    route?: { rijtijdMinuten: number } | null;
  };
  aantalPersonen: number;
  aantalHuishoudens: number;
  heeftTanken: boolean;
  heeftBoodschappen: boolean;
}) {
  const loont = beste.nettoBesparing > 0;

  if (loont) {
    return (
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-light to-accent p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="text-4xl">✅</div>
          <div>
            <h2 className="text-xl font-extrabold">
              Het loont om naar {beste.vlag} {beste.land} te rijden!
            </h2>
            <p className="mt-2 text-accent-light/90">
              {aantalHuishoudens > 1 ? (
                <>
                  Jullie besparen samen{" "}
                  <span className="font-extrabold text-white">
                    {euro(beste.nettoBesparing)}
                  </span>
                  {" "}({euro(beste.nettoPerHuishouden)} per huishouden)
                </>
              ) : (
                <>
                  Je bespaart{" "}
                  <span className="font-extrabold text-white">
                    {euro(beste.nettoBesparing)}
                  </span>
                  {aantalPersonen > 1 && (
                    <> ({euro(beste.nettoPerPersoon)} p.p.)</>
                  )}
                </>
              )}
              {heeftTanken && heeftBoodschappen
                ? " op tanken en boodschappen"
                : heeftTanken
                  ? " op tanken"
                  : " op boodschappen"}
              , inclusief reiskosten.
            </p>
            {beste.route && (
              <p className="mt-1 text-sm text-white/60">
                Rijtijd: {formatRijtijd(beste.route.rijtijdMinuten)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white shadow-lg">
      <div className="flex items-start gap-4">
        <div className="text-4xl">❌</div>
        <div>
          <h2 className="text-xl font-extrabold">
            Het loont niet voor deze rit
          </h2>
          <p className="mt-2 text-red-100">
            Je verliest{" "}
            <span className="font-extrabold text-white">
              {euro(Math.abs(beste.nettoBesparing))}
            </span>{" "}
            op {beste.vlag} {beste.land}.
          </p>
          <p className="mt-2 text-sm text-red-200/80">
            Tip: ga met meer huishoudens of maak een grotere boodschappenlijst.
          </p>
        </div>
      </div>
    </div>
  );
}
