import { FlowKiezer } from "./flow-kiezer";
import { HoeWerktHet } from "./hoe-werkt-het";
import { AccountKnop } from "@/components/AccountKnop";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero — bold navy gradient with electric green accents */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-[#0F1F35] to-primary px-4 pb-14 pt-14">
        {/* Animated background shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-pulse-ring absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/10" />
          <div className="animate-pulse-ring absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cta/8" style={{ animationDelay: "1.5s" }} />
          <div className="animate-pulse-ring absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-accent/5" style={{ animationDelay: "3s" }} />
        </div>

        {/* Account knop rechtsboven */}
        <div className="absolute right-4 top-4 z-10">
          <AccountKnop />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <img
              src="/icons/icon-512x512.png"
              alt="Grenspret logo"
              width={140}
              height={140}
              className="animate-float drop-shadow-2xl"
            />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Grens<span className="text-accent">pret</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-medium text-gray-300">
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
              icon="🚗"
              label="RDW"
              sublabel="Voertuigdata"
            />
            <TrustBadge
              icon="🗺️"
              label="Google Maps"
              sublabel="Route & navigatie"
            />
            <TrustBadge
              icon="🛒"
              label="Marktprijzen"
              sublabel="NL, DE & BE"
            />
            <TrustBadge
              icon="📦"
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
  icon,
  label,
  sublabel,
  highlight,
}: {
  icon: string;
  label: string;
  sublabel: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card-bold flex flex-col items-center justify-center p-3 sm:p-3.5 ${highlight ? "border-accent/30 bg-accent/5" : ""}`}>
      <span className="text-xl leading-none">{icon}</span>
      <div className={`mt-1.5 text-sm font-extrabold ${highlight ? "text-accent" : "text-navy dark:text-white"}`}>
        {label}
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
        {sublabel}
      </div>
    </div>
  );
}
