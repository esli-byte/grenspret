import { FlowKiezer } from "./flow-kiezer";
import { HoeWerktHet } from "./hoe-werkt-het";

import { AccountKnop } from "@/components/AccountKnop";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero — fresh green-navy gradient with magical orbs */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0C2618] via-[#0F2D2A] to-[#0A1628] px-4 pb-14 pt-14">
        {/* Animated magical orbs — larger, more visible */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Grote groene orb rechtsboven */}
          <div className="hero-orb absolute -right-16 -top-16 h-80 w-80 rounded-full bg-gradient-to-br from-accent/25 to-emerald-500/10 blur-2xl" />
          {/* Groene orb linksonder */}
          <div className="hero-orb absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-600/20 to-accent/8 blur-3xl" style={{ animationDelay: "2s" }} />
          {/* Teal orb midden */}
          <div className="hero-orb absolute left-1/3 top-1/4 h-56 w-56 rounded-full bg-gradient-to-r from-teal-400/15 to-accent/10 blur-2xl" style={{ animationDelay: "4s" }} />
          {/* Subtiele accent ring */}
          <div className="hero-orb absolute -right-8 bottom-1/4 h-44 w-44 rounded-full bg-accent/8 blur-xl" style={{ animationDelay: "1s" }} />
          {/* Fijne lichtstrepen */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,210,106,0.06)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />
        </div>

        {/* Account knop rechtsboven */}
        <div className="absolute right-4 top-4 z-10">
          <AccountKnop />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Logo — statisch met glim-effect */}
          <div className="mb-4 flex justify-center">
            <div className="logo-shimmer relative">
              <img
                src="/icons/logo-transparant.png"
                alt="Grenspret logo"
                className="h-40 w-auto drop-shadow-[0_0_30px_rgba(0,210,106,0.15)]"
              />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Grens<span className="text-accent">pret</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-medium text-gray-300/90">
            Bereken in seconden of het loont om in Duitsland of België te tanken
            en boodschappen te doen.
          </p>

          {/* Subtiele 'Hoe werkt het' knop */}
          <div className="mt-5">
            <HoeWerktHet />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Wat wil je berekenen? */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-black text-accent">
            ?
          </div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Wat wil je berekenen?
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
        </div>

        <FlowKiezer />

        {/* Trust indicators — bolder, card-style */}
        <div className="mt-8">
          <p className="mb-3 text-center text-[11px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Betrouwbare bronnen
          </p>
          <div className="grid grid-cols-2 gap-2.5 text-center sm:grid-cols-4">
            <TrustBadge
              label="RDW"
              sublabel="Voertuigdata"
            />
            <TrustBadge
              label="Google Maps"
              sublabel="Route & navigatie"
            />
            <TrustBadge
              label="Marktprijzen"
              sublabel="NL, DE & BE"
            />
            <TrustBadge
              label="150+"
              sublabel="Producten"
              highlight
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function TrustBadge({
  label,
  sublabel,
  highlight,
}: {
  label: string;
  sublabel: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card-bold flex flex-col items-center justify-center p-3 sm:p-3.5 ${highlight ? "border-accent/30 bg-accent/5" : ""}`}>
      <div className={`text-sm font-extrabold ${highlight ? "text-accent" : "text-navy dark:text-white"}`}>
        {label}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
        {sublabel}
      </div>
    </div>
  );
}
