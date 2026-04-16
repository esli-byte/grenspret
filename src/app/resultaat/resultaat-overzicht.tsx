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

export function ResultaatOverzicht() {
  const [tanken, setTanken] = useState<TankenOpslag | null>(null);
  const [boodschappen, setBoodschappen] = useState<BoodschappenOpslag | null>(null);
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
    return <GeenGegevensPlaceholder />;
  }

  // Bereken de beste optie over alle beschikbare data
  const route = tanken?.route[0]; // Geselecteerd station
  const land = route?.land ?? (boodschappen?.besparingDE ?? 0) >= (boodschappen?.besparingBE ?? 0) ? "Duitsland" : "België";
  const vlag = land === "Duitsland" ? "\u{1F1E9}\u{1F1EA}" : "\u{1F1E7}\u{1F1EA}";

  const besparingTanken = land === "Duitsland" ? tanken?.besparingDE ?? 0 : tanken?.besparingBE ?? 0;
  const besparingBoodschappenPerHH = land === "Duitsland" ? boodschappen?.besparingDE ?? 0 : boodschappen?.besparingBE ?? 0;
  const besparingBoodschappen = besparingBoodschappenPerHH * aantalHuishoudens;
  const reiskosten = route?.reiskosten ?? 0;
  const netto = besparingTanken + besparingBoodschappen - reiskosten;
  const loont = netto > 0;

  const heeftTanken = !!tanken;
  const heeftBoodschappen = !!boodschappen;

  return (
    <div className="space-y-5">
      {/* Conclusie banner — altijd bovenaan */}
      <ConclusieBanner
        netto={netto}
        land={land}
        vlag={vlag}
        heeftTanken={heeftTanken}
        heeftBoodschappen={heeftBoodschappen}
        route={route}
      />

      {/* Breakdown kaart */}
      <div className={`card-bold overflow-hidden ${loont ? "border-accent/30" : "border-red-200 dark:border-red-800/50"}`}>
        <div className="p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-navy dark:text-white">
            Zo is je besparing opgebouwd
          </h3>

          <div className="space-y-2.5 text-sm">
            {/* Tanken */}
            {heeftTanken && besparingTanken > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="w-5 text-center">⛽</span>
                  Volle tank ({tanken!.tankGrootte}L {tanken!.brandstofSoort})
                </span>
                <span className="tabular-nums font-extrabold text-accent">+{euro(besparingTanken)}</span>
              </div>
            )}

            {/* Boodschappen */}
            {heeftBoodschappen && besparingBoodschappen > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="w-5 text-center">🛒</span>
                  {boodschappen!.aantalProducten} product{boodschappen!.aantalProducten !== 1 ? "en" : ""}
                  {aantalHuishoudens > 1 ? ` (×${aantalHuishoudens} hh)` : ""}
                </span>
                <span className="tabular-nums font-extrabold text-accent">+{euro(besparingBoodschappen)}</span>
              </div>
            )}

            {/* Reiskosten */}
            {reiskosten > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="w-5 text-center">🚗</span>
                  Reiskosten retour
                </span>
                <span className="tabular-nums font-extrabold text-red-500">{"\u2212"}{euro(reiskosten)}</span>
              </div>
            )}

            {/* Netto */}
            <div className={`flex items-center justify-between border-t-2 pt-3 ${loont ? "border-accent/20" : "border-red-200 dark:border-red-800/50"}`}>
              <span className="font-extrabold text-navy dark:text-white">Netto besparing</span>
              <span className={`text-xl font-extrabold tabular-nums ${loont ? "text-accent" : "text-red-500"}`}>
                {loont ? "+" : ""}{euro(netto)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Jouw keuzes — compact overzicht */}
      <div className="card-bold p-5 space-y-3">
        <h3 className="text-sm font-extrabold text-navy dark:text-white">
          Jouw keuzes
        </h3>

        {/* Auto */}
        {tanken && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-base">
              🚗
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-navy dark:text-white">
                {tanken.voertuig.merk} {tanken.voertuig.handelsbenaming}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                <Chip>{tanken.voertuig.kenteken}</Chip>
                <Chip>{tanken.brandstofSoort}</Chip>
                <Chip>{tanken.tankGrootte}L tank</Chip>
                <Chip>{tanken.verbruik} l/100km</Chip>
              </div>
            </div>
          </div>
        )}

        {/* Route */}
        {route && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-base">
              📍
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-navy dark:text-white">
                {route.bestemming}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                <Chip>{route.afstandRetour} km retour</Chip>
                <Chip>{formatRijtijd(route.rijtijdMinuten)}</Chip>
              </div>
            </div>
          </div>
        )}

        {/* Boodschappen */}
        {boodschappen && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-base">
              🛒
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-navy dark:text-white">
                {boodschappen.aantalProducten} product{boodschappen.aantalProducten !== 1 ? "en" : ""} geselecteerd
              </div>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                <Chip>NL {euro(boodschappen.totaalNL)}</Chip>
                {land === "Duitsland" && <Chip>DE {euro(boodschappen.totaalDE)}</Chip>}
                {land === "België" && <Chip>BE {euro(boodschappen.totaalBE)}</Chip>}
              </div>
            </div>
          </div>
        )}

        {/* Groep */}
        {aantalHuishoudens > 1 && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-base">
              🏠
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-navy dark:text-white">
                Groepsrit met {aantalHuishoudens} huishoudens
              </div>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                <Chip>Boodschappen ×{aantalHuishoudens}</Chip>
                <Chip>Reiskosten gedeeld</Chip>
              </div>
            </div>
          </div>
        )}

        {/* Wijzig knoppen */}
        <div className="flex flex-wrap gap-2 pt-1">
          {heeftTanken && (
            <Link href="/tanken" className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-extrabold text-gray-500 transition-all hover:border-accent hover:text-accent active:scale-95 dark:border-gray-700 dark:text-gray-400">
              Tanken wijzigen
            </Link>
          )}
          {heeftBoodschappen && (
            <Link href="/boodschappen" className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-extrabold text-gray-500 transition-all hover:border-accent hover:text-accent active:scale-95 dark:border-gray-700 dark:text-gray-400">
              Boodschappen wijzigen
            </Link>
          )}
        </div>
      </div>

      {/* Ontbrekende stap */}
      {(!heeftTanken || !heeftBoodschappen) && (
        <div className="card-bold p-5 border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-200">
                Bespaar nog meer
              </h3>
              <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/80">
                {!heeftTanken
                  ? "Voeg je tankbesparing toe voor een completer beeld."
                  : "Voeg boodschappen toe om je totale besparing te zien."}
              </p>
              <Link
                href={!heeftTanken ? "/tanken" : "/boodschappen"}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {!heeftTanken ? "Tankbesparing berekenen" : "Boodschappen toevoegen"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Deel je besparing */}
      {netto > 0 && (
        <DeelKnoppen
          netto={netto}
          land={land}
          vlag={vlag}
          besparingTanken={besparingTanken}
          besparingBoodschappen={besparingBoodschappen}
          reiskosten={reiskosten}
          route={route}
          aantalHuishoudens={aantalHuishoudens}
        />
      )}

      {/* Jerrycan banner */}
      <Link
        href="/shop"
        className="group card-bold flex items-center gap-4 border-accent/20 bg-gradient-to-br from-accent/5 to-emerald-50/50 p-4 dark:from-accent/10 dark:to-emerald-950/20 dark:border-accent/10"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xl transition-transform group-hover:scale-110">
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
        <svg className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </Link>

      {/* Hanova werkkleding banner */}
      <a
        href="https://www.hanova.nl"
        target="_blank"
        rel="noopener noreferrer"
        className="group card-bold flex items-center gap-4 border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800/20"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl transition-transform group-hover:scale-110 dark:bg-blue-900/40">
          👷
        </div>
        <div className="flex-1">
          <div className="text-sm font-extrabold text-navy dark:text-white">
            Werkkleding nodig?
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Bekijk hier exclusieve acties!
          </p>
        </div>
        <svg className="h-5 w-5 shrink-0 text-blue-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </a>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
        Gekoppeld met RDW, OpenStreetMap, CBS, Tankerkoenig en FOD Economie
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
          Vul eerst de tanken- of boodschappen-stap in en keer hier terug voor je besparing.
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

function ConclusieBanner({
  netto,
  land,
  vlag,
  heeftTanken,
  heeftBoodschappen,
  route,
}: {
  netto: number;
  land: string;
  vlag: string;
  heeftTanken: boolean;
  heeftBoodschappen: boolean;
  route?: TankenOpslag["route"][number];
}) {
  const loont = netto > 0;

  const watTekst = heeftTanken && heeftBoodschappen
    ? "op tanken en boodschappen"
    : heeftTanken
      ? "op tanken"
      : "op boodschappen";

  if (loont) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-light to-accent p-6 text-white shadow-xl shadow-accent/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-white/70">
            <span className="text-lg">✅</span>
            De rit loont
          </div>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight">
            Rijden naar {vlag} {land} bespaart jou {euro(netto)}
          </h2>
          <p className="mt-2 text-sm text-white/85">
            Je bespaart {euro(netto)} {watTekst}, inclusief reiskosten heen en terug.
          </p>
          {route && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                {route.bestemming}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                {route.afstandRetour} km retour · {formatRijtijd(route.rijtijdMinuten)}
              </span>
            </div>
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
          Je zou {euro(Math.abs(netto))} verliezen {watTekst}.
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
  netto,
  land,
  vlag,
  besparingTanken,
  besparingBoodschappen,
  reiskosten,
  route,
  aantalHuishoudens,
}: {
  netto: number;
  land: string;
  vlag: string;
  besparingTanken: number;
  besparingBoodschappen: number;
  reiskosten: number;
  route?: TankenOpslag["route"][number];
  aantalHuishoudens: number;
}) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [bezig, setBezig] = useState<"tekst" | "afbeelding" | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const bedrag = euro(netto);
  const url = typeof window !== "undefined" ? window.location.origin : "grenspret.nl";

  function bouwTekst(): string {
    const intro = `Ik bespaar ${bedrag} door over de grens te shoppen in ${land}`;
    const regels: string[] = [intro, ""];
    if (besparingTanken > 0) {
      regels.push(`${vlag} Tanken: +${euro(besparingTanken)}`);
    }
    if (besparingBoodschappen > 0) {
      regels.push(`🛒 Boodschappen: +${euro(besparingBoodschappen)}`);
    }
    if (reiskosten > 0) {
      regels.push(`🚗 Reiskosten: \u2212${euro(reiskosten)}`);
    }
    regels.push(`💰 Netto besparing: ${bedrag}`);
    regels.push("");
    regels.push(`Bereken je eigen besparing op ${url}`);
    return regels.join("\n");
  }

  async function handleWhatsApp() {
    const tekst = bouwTekst();
    window.open(`https://wa.me/?text=${encodeURIComponent(tekst)}`, "_blank");
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

      const blob = await (await fetch(dataUrl)).blob();
      const bestandsnaam = `grenspret-besparing-${new Date().toISOString().slice(0, 10)}.png`;
      const file = new File([blob], bestandsnaam, { type: "image/png" });

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
        <h3 className="text-sm font-extrabold text-navy dark:text-white">
          Deel je besparing
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Laat vrienden en familie zien hoeveel je bespaart
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#25D366] px-3 py-3 text-white shadow-md transition-all hover:bg-[#20bd5a] hover:shadow-lg active:scale-[0.98]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-[10px] font-extrabold">WhatsApp</span>
        </button>

        {/* Afbeelding */}
        <button
          onClick={handleAfbeelding}
          disabled={bezig === "afbeelding"}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-accent px-3 py-3 text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
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
          <span className="text-[10px] font-extrabold">Afbeelding</span>
        </button>

        {/* Kopieer */}
        <button
          onClick={handleKopieer}
          disabled={bezig === "tekst"}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-gray-200 bg-white px-3 py-3 text-navy shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-navy/50 dark:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          <span className="text-[10px] font-extrabold">Kopieer</span>
        </button>
      </div>

      {status && (
        <div className="rounded-xl bg-accent/10 px-3 py-2 text-center text-xs font-extrabold text-accent animate-fade-in">
          ✓ {status}
        </div>
      )}

      {/* Off-screen ShareCard voor afbeelding export */}
      <div
        style={{ position: "fixed", left: "-200vw", top: "0", pointerEvents: "none", zIndex: -1 }}
        aria-hidden="true"
      >
        <ShareCard
          ref={shareRef}
          besparing={netto}
          land={land}
          vlag={vlag}
          besparingTanken={besparingTanken}
          besparingBoodschappen={besparingBoodschappen}
          reiskosten={reiskosten}
          rijtijdMin={route?.rijtijdMinuten}
          afstandKm={route?.afstandRetour}
          aantalHuishoudens={aantalHuishoudens}
        />
      </div>
    </div>
  );
}
