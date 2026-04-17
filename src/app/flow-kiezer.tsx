"use client";

import { useRouter } from "next/navigation";
import { slaaFlowOp, wisResultaatData, type BerekeningsFlow } from "@/lib/opslag";
import { wisSamenBoodschappenData } from "@/lib/personen";
import Image from "next/image";

const OPTIES: { flow: BerekeningsFlow; iconSrc: string; titel: string; beschrijving: string; href: string }[] = [
  {
    flow: "beide",
    iconSrc: "/icons/icon-beide.png",
    titel: "Tanken + boodschappen",
    beschrijving: "Bereken je totale besparing op één trip",
    href: "/tanken",
  },
  {
    flow: "tanken",
    iconSrc: "/icons/icon-tanken.png",
    titel: "Alleen tanken",
    beschrijving: "Bereken je besparing op brandstof over de grens",
    href: "/tanken",
  },
  {
    flow: "boodschappen",
    iconSrc: "/icons/icon-boodschappen.png",
    titel: "Alleen boodschappen",
    beschrijving: "Vergelijk 150+ producten in NL, DE en BE",
    href: "/boodschappen",
  },
];

export function FlowKiezer() {
  const router = useRouter();

  function kies(optie: (typeof OPTIES)[number]) {
    wisResultaatData();
    wisSamenBoodschappenData();
    slaaFlowOp(optie.flow);
    window.dispatchEvent(new Event("flowChanged"));
    router.push(optie.href);
  }

  return (
    <div className="grid gap-3">
      {OPTIES.map((optie) => (
        <button
          key={optie.flow}
          onClick={() => kies(optie)}
          className="card-bold group flex items-center gap-4 p-5 text-left"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            <Image
              src={optie.iconSrc}
              alt={optie.titel}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-navy dark:text-white">
              {optie.titel}
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {optie.beschrijving}
            </p>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 transition-all duration-200 group-hover:bg-accent/20 group-hover:translate-x-1">
            <svg
              className="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}
