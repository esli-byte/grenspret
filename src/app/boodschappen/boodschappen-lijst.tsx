"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRODUCTEN,
  CATEGORIE_LABELS,
  type Categorie,
  type MerkType,
  type Product,
  type EigenProduct,
} from "./producten";
import {
  slaaBoodschappenOp,
  slaaBoodschappenSelectieOp,
  leesBoodschappenSelectie,
  leesVoorkeuren,
  slaaEigenProductenOp,
  leesEigenProducten,
} from "@/lib/opslag";
import {
  MIJ_ID,
  MIJ_KLEUR,
  leesPersonen,
  slaaPersonenOp,
  leesToewijzingen,
  slaaToewijzingenOp,
  leesGroepsmodus,
  slaaGroepsmodusOp,
  leesActievePersoon,
  slaaActievePersoonOp,
  voegToeVoorPersoon,
  haalWegVoorPersoon,
  verwijderProductToewijzing,
  type Persoon,
  type Toewijzingen,
} from "@/lib/personen";
import { useAuth } from "@/lib/AuthContext";
import { LocatieKaartjes } from "@/components/LocatieKaartjes";
import { EigenProductModal } from "./eigen-product-modal";
import { PersonenBeheer } from "./personen-beheer";
import { VerdelingDashboard } from "./verdeling-dashboard";
import { ActieveShopperBanner } from "./actieve-shopper-banner";

// Union type for products in the list (regular or user-added)
type ProductOfEigen = Product | EigenProduct;

function euro(bedrag: number) {
  return `€${bedrag.toFixed(2)}`;
}

// Live prijs data types
type LivePrijzen = Record<string, {
  prijsNL: number;
  prijsDE: number;
  prijsBE: number;
  bronNL: string;
  bronDE: string;
  bronBE: string;
}>;

type PrijsStatus = {
  laden: boolean;
  bijgewerkt: string | null;
  bron: "live" | "cache" | "fallback" | null;
  fout: string | null;
  aantalLive: number;
  aantalFallback: number;
};

const CATEGORIEEN = Object.keys(CATEGORIE_LABELS) as Categorie[];

export function BoodschappenLijst() {
  const { user } = useAuth();
  const mijnNaam = user?.displayName?.split(" ")[0] || "Ik";

  const [geselecteerd, setGeselecteerd] = useState<Map<string, number>>(new Map());
  const [postcode, setPostcode] = useState("");
  const [zoekterm, setZoekterm] = useState("");
  const [actieveCategorie, setActieveCategorie] = useState<Categorie | "alle">("alle");
  const [merkFilter, setMerkFilter] = useState<MerkType | "alle">("alle");
  const [eigenProducten, setEigenProducten] = useState<EigenProduct[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Samen boodschappen state
  const [groepsmodus, setGroepsmodus] = useState(false);
  const [personen, setPersonen] = useState<Persoon[]>([]);
  const [toewijzingen, setToewijzingen] = useState<Toewijzingen>({});
  const [actievePersoon, setActievePersoon] = useState<string>(MIJ_ID);

  // Live prijzen state
  const [livePrijzen, setLivePrijzen] = useState<LivePrijzen>({});
  const [prijsStatus, setPrijsStatus] = useState<PrijsStatus>({
    laden: true,
    bijgewerkt: null,
    bron: null,
    fout: null,
    aantalLive: 0,
    aantalFallback: 0,
  });

  // Haal live prijzen op van de API
  const laadPrijzen = useCallback(async () => {
    setPrijsStatus((s) => ({ ...s, laden: true, fout: null }));
    try {
      const res = await fetch("/api/product-prices");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const map: LivePrijzen = {};
      let live = 0;
      let fallback = 0;

      for (const p of data.prijzen || []) {
        map[p.id] = {
          prijsNL: p.prijsNL,
          prijsDE: p.prijsDE,
          prijsBE: p.prijsBE,
          bronNL: p.bronNL,
          bronDE: p.bronDE,
          bronBE: p.bronBE,
        };
        if (p.bronNL !== "fallback" || p.bronDE !== "fallback" || p.bronBE !== "fallback") live++;
        else fallback++;
      }

      setLivePrijzen(map);
      setPrijsStatus({
        laden: false,
        bijgewerkt: data.bijgewerkt || null,
        bron: data.bron || "fallback",
        fout: data.fout || null,
        aantalLive: live,
        aantalFallback: fallback,
      });
    } catch (err) {
      setPrijsStatus((s) => ({
        ...s,
        laden: false,
        fout: err instanceof Error ? err.message : "Kon prijzen niet laden",
      }));
    }
  }, []);

  useEffect(() => {
    laadPrijzen();
  }, [laadPrijzen]);

  // Laad opgeslagen state bij mount
  useEffect(() => {
    const selectie = leesBoodschappenSelectie();
    if (selectie?.producten) {
      const map = new Map<string, number>();
      for (const [id, qty] of Object.entries(selectie.producten)) {
        if (qty > 0) map.set(id, qty);
      }
      if (map.size > 0) setGeselecteerd(map);
    }
    const voorkeuren = leesVoorkeuren();
    if (voorkeuren.postcode) setPostcode(voorkeuren.postcode);
    const opgeslagenEigen = leesEigenProducten();
    if (opgeslagenEigen.length > 0) {
      setEigenProducten(opgeslagenEigen as EigenProduct[]);
    }

    // Samen-boodschappen state
    setGroepsmodus(leesGroepsmodus());
    setPersonen(leesPersonen());
    setToewijzingen(leesToewijzingen());
    setActievePersoon(leesActievePersoon());
  }, []);

  // Sla eigen producten op bij wijziging
  useEffect(() => {
    slaaEigenProductenOp(eigenProducten);
  }, [eigenProducten]);

  // Sla samen-boodschappen state op
  useEffect(() => { slaaGroepsmodusOp(groepsmodus); }, [groepsmodus]);
  useEffect(() => { slaaPersonenOp(personen); }, [personen]);
  useEffect(() => { slaaToewijzingenOp(toewijzingen); }, [toewijzingen]);
  useEffect(() => { slaaActievePersoonOp(actievePersoon); }, [actievePersoon]);

  function voegEigenProductToe(product: EigenProduct) {
    setEigenProducten((prev) => [...prev, product]);
    // Direct 1 toevoegen aan selectie
    setGeselecteerd((prev) => {
      const next = new Map(prev);
      next.set(product.id, 1);
      return next;
    });
  }

  function verwijderEigenProduct(id: string) {
    setEigenProducten((prev) => prev.filter((p) => p.id !== id));
    setGeselecteerd((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  // Producten met (eventueel) live prijzen + eigen producten erbij
  const productenMetPrijzen = useMemo<ProductOfEigen[]>(() => {
    const regulier = PRODUCTEN.map((p) => {
      const live = livePrijzen[p.id];
      if (!live) return p;
      return {
        ...p,
        prijsNL: live.prijsNL ?? p.prijsNL,
        prijsDE: live.prijsDE ?? p.prijsDE,
        prijsBE: live.prijsBE ?? p.prijsBE,
      };
    });
    return [...eigenProducten, ...regulier];
  }, [livePrijzen, eigenProducten]);

  function incrementQuantity(id: string) {
    if (groepsmodus) {
      // Toewijzing aan actieve persoon
      setToewijzingen((prev) => voegToeVoorPersoon(prev, id, actievePersoon));
    } else {
      // Oude logica: directe quantity
      setGeselecteerd((prev) => {
        const next = new Map(prev);
        const current = next.get(id) ?? 0;
        next.set(id, current + 1);
        return next;
      });
    }
  }

  function decrementQuantity(id: string) {
    if (groepsmodus) {
      setToewijzingen((prev) => haalWegVoorPersoon(prev, id, actievePersoon));
    } else {
      setGeselecteerd((prev) => {
        const next = new Map(prev);
        const current = next.get(id) ?? 0;
        if (current > 1) {
          next.set(id, current - 1);
        } else {
          next.delete(id);
        }
        return next;
      });
    }
  }

  // Als groepsmodus wisselt, synchroniseer de twee modellen
  useEffect(() => {
    if (groepsmodus) {
      // Zet `geselecteerd` om naar toewijzingen voor "mij" (als er nog niks is)
      if (Object.keys(toewijzingen).length === 0 && geselecteerd.size > 0) {
        const nieuw: Toewijzingen = {};
        geselecteerd.forEach((qty, id) => {
          nieuw[id] = { [MIJ_ID]: qty };
        });
        setToewijzingen(nieuw);
      }
    } else {
      // Terug naar simpele modus: neem totale quantities mee
      if (Object.keys(toewijzingen).length > 0) {
        const map = new Map<string, number>();
        for (const [id, perPersoon] of Object.entries(toewijzingen)) {
          const totaal = Object.values(perPersoon).reduce((s, n) => s + n, 0);
          if (totaal > 0) map.set(id, totaal);
        }
        setGeselecteerd(map);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groepsmodus]);

  // In groepsmodus: `geselecteerd` is afgeleide van `toewijzingen` (voor totalen)
  const effectieveSelectie = useMemo(() => {
    if (!groepsmodus) return geselecteerd;
    const map = new Map<string, number>();
    for (const [id, perPersoon] of Object.entries(toewijzingen)) {
      const totaal = Object.values(perPersoon).reduce((s, n) => s + n, 0);
      if (totaal > 0) map.set(id, totaal);
    }
    return map;
  }, [groepsmodus, geselecteerd, toewijzingen]);

  // Sla selectie op bij wijziging
  useEffect(() => {
    if (effectieveSelectie.size > 0) {
      const obj: Record<string, number> = {};
      effectieveSelectie.forEach((qty, id) => { obj[id] = qty; });
      slaaBoodschappenSelectieOp(obj);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectieveSelectie.size]);

  const gefilterd = useMemo(() => {
    return productenMetPrijzen.filter((p) => {
      const matchCategorie = actieveCategorie === "alle" || p.categorie === actieveCategorie;
      const matchMerk = merkFilter === "alle" || p.merkType === merkFilter;
      const matchZoek =
        zoekterm === "" ||
        p.naam.toLowerCase().includes(zoekterm.toLowerCase()) ||
        (p.merk && p.merk.toLowerCase().includes(zoekterm.toLowerCase()));
      return matchCategorie && matchMerk && matchZoek;
    });
  }, [productenMetPrijzen, actieveCategorie, merkFilter, zoekterm]);

  const totalen = useMemo(() => {
    let nl = 0;
    let de = 0;
    let be = 0;

    for (const product of productenMetPrijzen) {
      const quantity = effectieveSelectie.get(product.id) ?? 0;
      if (quantity > 0) {
        nl += product.prijsNL * quantity;
        de += product.prijsDE * quantity;
        be += product.prijsBE * quantity;
      }
    }

    return {
      nl,
      de,
      be,
      besparingDE: nl - de,
      besparingBE: nl - be,
    };
  }, [productenMetPrijzen, effectieveSelectie]);

  // Bereken A-merk vs huismerk besparing
  const merkVergelijking = useMemo(() => {
    const selected = productenMetPrijzen.filter((p) => effectieveSelectie.has(p.id));
    const aMerken = selected.filter((p) => p.merkType === "a-merk");
    const huisMerken = selected.filter((p) => p.merkType === "huismerk");
    return {
      aantalAMerk: aMerken.reduce((s, p) => s + (effectieveSelectie.get(p.id) ?? 0), 0),
      aantalHuismerk: huisMerken.reduce((s, p) => s + (effectieveSelectie.get(p.id) ?? 0), 0),
      totaalAMerkNL: aMerken.reduce((s, p) => s + p.prijsNL * (effectieveSelectie.get(p.id) ?? 0), 0),
      totaalHuismerkNL: huisMerken.reduce((s, p) => s + p.prijsNL * (effectieveSelectie.get(p.id) ?? 0), 0),
    };
  }, [productenMetPrijzen, effectieveSelectie]);

  const totalAantalItems = useMemo(() => {
    let total = 0;
    for (const quantity of effectieveSelectie.values()) {
      total += quantity;
    }
    return total;
  }, [effectieveSelectie]);

  useEffect(() => {
    if (totalAantalItems === 0) return;
    slaaBoodschappenOp({
      aantalProducten: totalAantalItems,
      totaalNL: totalen.nl,
      totaalDE: totalen.de,
      totaalBE: totalen.be,
      besparingDE: totalen.besparingDE,
      besparingBE: totalen.besparingBE,
    });
  }, [totalen, totalAantalItems]);

  const aantalAMerk = productenMetPrijzen.filter((p) => p.merkType === "a-merk").length;
  const aantalHuismerk = productenMetPrijzen.filter((p) => p.merkType === "huismerk").length;

  function voegPersoonToe(p: Persoon) {
    setPersonen((prev) => [...prev, p]);
    setActievePersoon(p.id);
  }

  function verwijderPersoon(id: string) {
    setPersonen((prev) => prev.filter((p) => p.id !== id));
    // Haal alle toewijzingen van deze persoon weg
    setToewijzingen((prev) => {
      const nieuw: Toewijzingen = {};
      for (const [productId, perPersoon] of Object.entries(prev)) {
        const { [id]: _verwijderd, ...rest } = perPersoon;
        void _verwijderd;
        if (Object.keys(rest).length > 0) nieuw[productId] = rest;
      }
      return nieuw;
    });
    // Als actieve persoon verwijderd, val terug op "mij"
    if (actievePersoon === id) setActievePersoon(MIJ_ID);
  }

  return (
    <div className="space-y-5">
      {/* Samen boodschappen beheer */}
      <PersonenBeheer
        personen={personen}
        mijnNaam={mijnNaam}
        actievePersoon={actievePersoon}
        groepsmodus={groepsmodus}
        onActiveerPersoon={setActievePersoon}
        onToevoegen={voegPersoonToe}
        onVerwijder={verwijderPersoon}
        onGroepsmodusToggle={setGroepsmodus}
      />

      {/* Prijsstatus indicator */}
      <PrijsStatusBalk status={prijsStatus} onHerlaad={laadPrijzen} />

      {/* Zoekbalk */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Zoek product of merk..."
          value={zoekterm}
          onChange={(e) => setZoekterm(e.target.value)}
          className="w-full rounded-2xl border-2 border-gray-200 bg-surface py-3.5 pl-12 pr-4 text-sm font-medium text-navy placeholder:text-gray-400 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
        />
        {zoekterm && (
          <button
            onClick={() => setZoekterm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition-all hover:bg-gray-100 active:scale-90 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Merk filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setMerkFilter("alle")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-extrabold transition-all active:scale-95 ${
            merkFilter === "alle"
              ? "bg-accent text-white shadow-lg shadow-accent/25"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400"
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
          </svg>
          Alles ({PRODUCTEN.length})
        </button>
        <button
          onClick={() => setMerkFilter("a-merk")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-extrabold transition-all active:scale-95 ${
            merkFilter === "a-merk"
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
          }`}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[8px] font-black text-white">A</span>
          A-merken ({aantalAMerk})
        </button>
        <button
          onClick={() => setMerkFilter("huismerk")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-extrabold transition-all active:scale-95 ${
            merkFilter === "huismerk"
              ? "bg-gray-600 text-white shadow-lg shadow-gray-600/25"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-[8px] font-black text-white">H</span>
          Huismerken ({aantalHuismerk})
        </button>
      </div>

      {/* Categorie tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActieveCategorie("alle")}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-all active:scale-95 ${
            actieveCategorie === "alle"
              ? "bg-accent/15 text-accent ring-2 ring-accent/30"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400"
          }`}
        >
          Alles
        </button>
        {CATEGORIEEN.map((cat) => {
          const { label, icoon } = CATEGORIE_LABELS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActieveCategorie(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-all active:scale-95 ${
                actieveCategorie === cat
                  ? "bg-accent/15 text-accent ring-2 ring-accent/30"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400"
              }`}
            >
              {icoon} {label}
            </button>
          );
        })}
      </div>

      {/* Selectie teller */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-extrabold text-accent">
            {totalAantalItems}
          </span>{" "}
          product{totalAantalItems !== 1 && "en"} geselecteerd
          {merkVergelijking.aantalAMerk > 0 && merkVergelijking.aantalHuismerk > 0 && (
            <span className="ml-1 text-xs text-gray-400">
              ({merkVergelijking.aantalAMerk} A-merk, {merkVergelijking.aantalHuismerk} huismerk)
            </span>
          )}
        </p>
        {totalAantalItems > 0 && (
          <button
            onClick={() => {
              setGeselecteerd(new Map());
              setToewijzingen({});
            }}
            className="rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-extrabold text-red-500 transition-all hover:bg-red-100 active:scale-95 dark:bg-red-900/20 dark:text-red-400"
          >
            Wis selectie
          </button>
        )}
      </div>

      {/* Actieve shopper banner (alleen in groepsmodus) */}
      {groepsmodus && (
        <ActieveShopperBanner
          actievePersoon={actievePersoon}
          personen={personen}
          mijnNaam={mijnNaam}
        />
      )}

      {/* Product tegels grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {/* Eigen-product toevoegen knop (altijd zichtbaar) */}
        <EigenProductTegel onKlik={() => setModalOpen(true)} />
        {gefilterd.map((product) => (
          <ProductTegel
            key={product.id}
            product={product}
            quantity={effectieveSelectie.get(product.id) ?? 0}
            onIncrement={() => incrementQuantity(product.id)}
            onDecrement={() => decrementQuantity(product.id)}
            onVerwijder={
              "isEigen" in product && product.isEigen
                ? () => {
                    verwijderEigenProduct(product.id);
                    if (groepsmodus) {
                      setToewijzingen((prev) => verwijderProductToewijzing(prev, product.id));
                    }
                  }
                : undefined
            }
            personenDotsInfo={
              groepsmodus
                ? buildPersoonDots(toewijzingen[product.id] ?? {}, personen, mijnNaam)
                : null
            }
          />
        ))}
      </div>

      {/* Modal — alleen renderen als open, zodat state reset bij heropenen */}
      {modalOpen && (
        <EigenProductModal
          onSluiten={() => setModalOpen(false)}
          onToevoegen={voegEigenProductToe}
        />
      )}

      {gefilterd.length === 0 && (
        <div className="card-bold border-dashed p-8 text-center">
          <div className="text-3xl">🔍</div>
          <p className="mt-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            Geen producten gevonden
          </p>
          <button
            onClick={() => { setZoekterm(""); setMerkFilter("alle"); setActieveCategorie("alle"); }}
            className="mt-2 text-xs font-extrabold text-accent"
          >
            Filters wissen
          </button>
        </div>
      )}

      {/* Postcode voor supermarkten */}
      <div className="card-bold p-5">
        <label
          htmlFor="postcode-boodschappen"
          className="block text-sm font-extrabold text-navy dark:text-white"
        >
          Jouw postcode
        </label>
        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
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
          className="mt-2.5 w-full rounded-2xl border-2 border-gray-200 px-4 py-3.5 font-bold text-navy placeholder:font-normal placeholder:text-gray-400 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-gray-700 dark:bg-navy/50 dark:text-white sm:w-48"
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

      {/* Compacte sticky besparing balk */}
      <CompactBesparingBar totalen={totalen} aantalProducten={totalAantalItems} />

      {/* Verdeling dashboard (alleen als groepsmodus actief en items) */}
      {groepsmodus && totalAantalItems > 0 && (
        <VerdelingDashboard
          personen={personen}
          mijnNaam={mijnNaam}
          toewijzingen={toewijzingen}
          producten={productenMetPrijzen}
        />
      )}

      {/* Volledig overzicht onderaan */}
      <TotaalOverzicht totalen={totalen} aantalProducten={totalAantalItems} merkInfo={merkVergelijking} prijsStatus={prijsStatus} />

      {/* Volgende stap knop naar resultaat */}
      {totalAantalItems > 0 && (
        <Link
          href="/resultaat"
          className="group flex items-center justify-between rounded-3xl bg-gradient-to-br from-navy to-slate-800 p-5 shadow-lg shadow-navy/25 transition-all hover:shadow-xl active:scale-[0.98] dark:from-white dark:to-gray-100 dark:shadow-white/10"
        >
          <div className="text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 dark:text-navy/70">
              Stap 3 van 3
            </p>
            <p className="mt-0.5 text-base font-extrabold text-white dark:text-navy">
              Bekijk je totale besparing
            </p>
            <p className="mt-0.5 text-xs text-white/80 dark:text-navy/80">
              Tanken en boodschappen bij elkaar
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-transform group-hover:translate-x-1 dark:bg-navy/10 dark:text-navy">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </Link>
      )}
    </div>
  );
}

// Maak een lijstje met gekleurde dots per persoon op basis van hun aantal
type PersoonDot = { id: string; kleur: string; aantal: number; naam: string };

function buildPersoonDots(
  perPersoon: Record<string, number>,
  personen: Persoon[],
  mijnNaam: string,
): PersoonDot[] {
  const naamMap = new Map(personen.map((p) => [p.id, p.naam]));
  const kleurMap = new Map(personen.map((p) => [p.id, p.kleur]));
  return Object.entries(perPersoon)
    .filter(([, n]) => n > 0)
    .map(([id, aantal]) => ({
      id,
      aantal,
      kleur: id === MIJ_ID ? MIJ_KLEUR : kleurMap.get(id) ?? "#94a3b8",
      naam: id === MIJ_ID ? mijnNaam : naamMap.get(id) ?? "?",
    }));
}

function EigenProductTegel({ onKlik }: { onKlik: () => void }) {
  return (
    <button
      onClick={onKlik}
      className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-3 pb-2.5 transition-all duration-200 hover:border-accent hover:bg-accent/10 active:scale-95"
    >
      <div className="mb-1.5 mt-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-md transition-transform duration-200 group-hover:scale-110">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <span className="text-center text-[11px] font-extrabold leading-tight text-accent">
        Eigen product
      </span>
      <span className="mt-0.5 text-[9px] font-medium text-accent/70">
        toevoegen
      </span>
    </button>
  );
}

function ProductTegel({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onVerwijder,
  personenDotsInfo,
}: {
  product: ProductOfEigen;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onVerwijder?: () => void;
  personenDotsInfo: PersoonDot[] | null;
}) {
  const besparing = Math.max(product.prijsNL - product.prijsDE, product.prijsNL - product.prijsBE);
  const { kleur } = CATEGORIE_LABELS[product.categorie];
  const isAMerk = product.merkType === "a-merk";
  const isSelected = quantity > 0;
  const isEigen = "isEigen" in product && product.isEigen;

  return (
    <button
      onClick={onIncrement}
      className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border-2 p-3 pb-2.5 transition-all duration-200 active:scale-95 ${
        isSelected
          ? "border-accent bg-accent/10 shadow-lg shadow-accent/15 dark:bg-accent/20"
          : "border-gray-100 bg-surface hover:border-gray-200 hover:shadow-md dark:border-gray-800 dark:hover:border-gray-700"
      }`}
    >
      {/* Quantity badge */}
      {isSelected && (
        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white font-extrabold text-xs animate-bounce-in">
          {quantity}
        </div>
      )}

      {/* Minus button */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDecrement();
          }}
          className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-90 transition-all"
          title="Hoeveelheid verminderen"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
      )}

      {/* Merk badge */}
      {isEigen ? (
        <div className="absolute left-1 top-1 rounded-full bg-accent px-1.5 py-0.5 text-[7px] font-black text-white shadow-sm">
          Eigen
        </div>
      ) : isAMerk ? (
        <div className="absolute left-1 top-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-[7px] font-black text-white shadow-sm">
          A-merk
        </div>
      ) : (
        <div className="absolute left-1 top-1 rounded-full bg-gray-400 px-1.5 py-0.5 text-[7px] font-black text-white shadow-sm">
          Huismerk
        </div>
      )}

      {/* Verwijder knop (alleen voor eigen producten) */}
      {isEigen && onVerwijder && !isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`"${product.naam}" verwijderen?`)) onVerwijder();
          }}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-white transition-all hover:bg-red-500 active:scale-90"
          title="Verwijder eigen product"
        >
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Product icoon */}
      <div className={`mb-1.5 mt-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${kleur} text-2xl shadow-md transition-transform duration-200 group-hover:scale-110`}>
        {product.icoon}
      </div>

      {/* Product naam */}
      <span className={`text-center text-[11px] leading-tight ${
        isSelected ? "font-extrabold text-navy dark:text-white" : "font-bold text-gray-700 dark:text-gray-300"
      }`}>
        {product.merk || product.naam}
      </span>

      {/* Subnaam als merk anders is dan naam */}
      {product.merk && product.merk !== product.naam && (
        <span className="text-center text-[9px] font-medium text-gray-400 dark:text-gray-500">
          {product.naam}
        </span>
      )}

      {/* Eenheid */}
      <span className="mt-0.5 text-[9px] font-medium text-gray-400 dark:text-gray-500">
        {product.eenheid}
      </span>

      {/* Prijs */}
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-[10px] tabular-nums font-medium text-gray-400 line-through dark:text-gray-500">
          {euro(product.prijsNL)}
        </span>
        <span className="text-xs font-extrabold tabular-nums text-accent">
          {euro(Math.min(product.prijsDE, product.prijsBE))}
        </span>
      </div>

      {/* Besparing badge */}
      {besparing > 0.05 && (
        <div className="mt-0.5 rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-extrabold text-accent">
          -{euro(besparing)}
        </div>
      )}

      {/* Persoon dots (alleen in groepsmodus) */}
      {personenDotsInfo && personenDotsInfo.length > 0 && (
        <div className="mt-1 flex items-center justify-center gap-0.5" title={personenDotsInfo.map(d => `${d.naam}: ${d.aantal}`).join(" • ")}>
          {personenDotsInfo.slice(0, 4).map((d) => (
            <div
              key={d.id}
              className="flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-black text-white"
              style={{ backgroundColor: d.kleur }}
            >
              {d.aantal}
            </div>
          ))}
          {personenDotsInfo.length > 4 && (
            <span className="text-[8px] font-bold text-gray-400">+{personenDotsInfo.length - 4}</span>
          )}
        </div>
      )}
    </button>
  );
}

// ===== Prijsstatus balk =====
function PrijsStatusBalk({ status, onHerlaad }: { status: PrijsStatus; onHerlaad: () => void }) {
  if (status.laden) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
        <div className="h-4 w-4 animate-spin-slow rounded-full border-2 border-blue-400 border-t-transparent" />
        <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
          Actuele prijzen laden...
        </span>
      </div>
    );
  }

  const isLive = status.bron === "live" || status.bron === "cache";
  const tijdLabel = status.bijgewerkt ? formatTijd(status.bijgewerkt) : null;

  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
      isLive
        ? "bg-accent/5 border border-accent/10"
        : "bg-amber-50 border border-amber-200/50 dark:bg-amber-900/20 dark:border-amber-800/30"
    }`}>
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${isLive ? "bg-accent animate-glow" : "bg-amber-500"}`} />
        <span className={`text-xs font-bold ${
          isLive ? "text-accent" : "text-amber-700 dark:text-amber-300"
        }`}>
          {isLive ? (
            <>Actuele prijzen</>
          ) : (
            "Referentieprijzen"
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {tijdLabel && (
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{tijdLabel}</span>
        )}
        <button
          onClick={onHerlaad}
          className="rounded-full p-1.5 text-gray-400 transition-all hover:bg-white/50 hover:text-gray-600 active:scale-90 dark:hover:bg-gray-800/50"
          title="Prijzen vernieuwen"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function formatTijd(iso: string): string {
  try {
    const d = new Date(iso);
    const nu = new Date();
    const diffMs = nu.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "zojuist";
    if (diffMin < 60) return `${diffMin} min geleden`;
    const diffUur = Math.floor(diffMin / 60);
    if (diffUur < 24) return `${diffUur} uur geleden`;
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function CompactBesparingBar({
  totalen,
  aantalProducten,
}: {
  totalen: {
    nl: number;
    besparingDE: number;
    besparingBE: number;
  };
  aantalProducten: number;
}) {
  if (aantalProducten === 0) return null;

  const besteBesparing = Math.max(totalen.besparingDE, totalen.besparingBE);
  const besteLand =
    totalen.besparingDE >= totalen.besparingBE ? "🇩🇪" : "🇧🇪";

  return (
    <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-10 -mx-4 -mt-5 bg-gradient-to-r from-accent to-emerald-500 px-4 py-3.5 shadow-[0_-4px_20px_rgba(0,210,106,0.2)] sm:static sm:mx-0 sm:mt-0 sm:rounded-2xl sm:shadow-lg sm:shadow-accent/15 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">💰</span>
          <div>
            <div className="text-[11px] font-bold text-white/80">
              {aantalProducten} product{aantalProducten !== 1 && "en"} &middot; Beste besparing {besteLand}
            </div>
            <div className="text-lg font-extrabold tabular-nums text-white">
              Bespaar {euro(besteBesparing)}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-bold text-white/60">NL totaal</div>
          <div className="text-sm font-extrabold tabular-nums text-white/90">
            {euro(totalen.nl)}
          </div>
        </div>
      </div>
    </div>
  );
}

function TotaalOverzicht({
  totalen,
  aantalProducten,
  merkInfo,
  prijsStatus,
}: {
  totalen: {
    nl: number;
    de: number;
    be: number;
    besparingDE: number;
    besparingBE: number;
  };
  aantalProducten: number;
  merkInfo: {
    aantalAMerk: number;
    aantalHuismerk: number;
    totaalAMerkNL: number;
    totaalHuismerkNL: number;
  };
  prijsStatus: PrijsStatus;
}) {
  if (aantalProducten === 0) {
    return (
      <div className="card-bold border-dashed p-8 text-center">
        <div className="text-4xl">🛒</div>
        <p className="mt-3 text-sm font-bold text-gray-500 dark:text-gray-400">
          Tik op producten om ze toe te voegen
        </p>
        <p className="mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
          Vergelijk A-merken en huismerken over de grens
        </p>
      </div>
    );
  }

  const besteLand =
    totalen.besparingDE >= totalen.besparingBE ? "Duitsland" : "België";
  const besteBesparing = Math.max(totalen.besparingDE, totalen.besparingBE);

  return (
    <div className="card-bold p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-navy dark:text-white">
            Jouw besparing
          </h2>
          <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {aantalProducten} product{aantalProducten !== 1 && "en"}
            {merkInfo.aantalAMerk > 0 && merkInfo.aantalHuismerk > 0 && (
              <span> &middot; {merkInfo.aantalAMerk}x A-merk, {merkInfo.aantalHuismerk}x huismerk</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-gray-400">NL totaal</div>
          <div className="text-sm font-extrabold tabular-nums text-navy dark:text-gray-300">
            {euro(totalen.nl)}
          </div>
        </div>
      </div>

      {/* A-merk vs Huismerk inzicht */}
      {merkInfo.aantalAMerk > 0 && merkInfo.aantalHuismerk > 0 && (
        <div className="mt-2.5 flex gap-2">
          <div className="flex-1 rounded-2xl bg-blue-50 px-3.5 py-2.5 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30">
            <div className="flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[7px] font-black text-white">A</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300">A-merken</span>
            </div>
            <div className="mt-0.5 text-xs font-extrabold tabular-nums text-blue-700 dark:text-blue-200">
              {euro(merkInfo.totaalAMerkNL)}
            </div>
          </div>
          <div className="flex-1 rounded-2xl bg-gray-50 px-3.5 py-2.5 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-[7px] font-black text-white">H</span>
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Huismerken</span>
            </div>
            <div className="mt-0.5 text-xs font-extrabold tabular-nums text-gray-700 dark:text-gray-200">
              {euro(merkInfo.totaalHuismerkNL)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <div
          className={`rounded-2xl p-3.5 ${
            totalen.besparingDE >= totalen.besparingBE
              ? "bg-accent/10 ring-2 ring-accent/30"
              : "bg-gray-50 dark:bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🇩🇪</span>
            <span className="text-[11px] font-bold text-gray-500">Duitsland</span>
          </div>
          <div className="mt-1 text-lg font-extrabold tabular-nums text-navy dark:text-white">
            {euro(totalen.de)}
          </div>
          <div className="text-xs font-extrabold tabular-nums text-accent">
            Bespaar {euro(totalen.besparingDE)}
          </div>
        </div>

        <div
          className={`rounded-2xl p-3.5 ${
            totalen.besparingBE > totalen.besparingDE
              ? "bg-accent/10 ring-2 ring-accent/30"
              : "bg-gray-50 dark:bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🇧🇪</span>
            <span className="text-[11px] font-bold text-gray-500">België</span>
          </div>
          <div className="mt-1 text-lg font-extrabold tabular-nums text-navy dark:text-white">
            {euro(totalen.be)}
          </div>
          <div className="text-xs font-extrabold tabular-nums text-accent">
            Bespaar {euro(totalen.besparingBE)}
          </div>
        </div>
      </div>

      {besteBesparing > 0 && (
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-accent to-emerald-500 p-4 text-white shadow-lg shadow-accent/20 animate-celebrate">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-sm font-extrabold">
                {besteLand} bespaart je {euro(besteBesparing)}
              </div>
              <div className="text-xs font-bold text-white/80">
                {Math.round((besteBesparing / totalen.nl) * 100)}% goedkoper
                (excl. reiskosten)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Databron indicator */}
      {!prijsStatus.laden && (
        <p className="mt-2 text-center text-[10px] font-medium text-gray-400 dark:text-gray-500">
          Prijzen via Albert Heijn (NL) &middot; Lidl (DE/BE)
          {prijsStatus.bijgewerkt && ` &middot; ${formatTijd(prijsStatus.bijgewerkt)}`}
        </p>
      )}
    </div>
  );
}
