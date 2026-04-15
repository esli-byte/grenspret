import Link from "next/link";
import { HuishoudensKiezer } from "./huishoudens-kiezer";
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
          {/* Floating emoji with bounce */}
          <div className="mb-6 flex items-center justify-center gap-5">
            <span className="animate-float text-4xl drop-shadow-lg">⛽</span>
            <span className="animate-float-delayed text-5xl drop-shadow-lg">💰</span>
            <span className="animate-float-delayed-2 text-4xl drop-shadow-lg">🛒</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Grens<span className="text-accent">pret</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-medium text-gray-300">
            Bereken in seconden of het loont om in Duitsland of België te tanken
            en boodschappen te doen.
          </p>

          <Link
            href="/tanken"
            className="btn-pill btn-pill-cta mt-7 text-base"
          >
            Start berekening
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          {/* Subtiele 'Hoe werkt het' knop */}
          <div className="mt-5">
            <HoeWerktHet />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Huishoudens kiezer */}
        <HuishoudensKiezer />

        {/* Stappen header */}
        <div className="mt-8 mb-4 flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-[10px] font-black text-accent">
            3
          </div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Stappen naar je besparing
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
        </div>

        {/* Feature cards — nu met stap-nummers en timeline */}
        <div className="relative grid gap-4">
          {/* Subtiele verticale lijn tussen cards */}
          <div
            className="pointer-events-none absolute left-[44px] top-[60px] bottom-[60px] w-0.5 bg-gradient-to-b from-accent/30 via-teal-400/30 to-blue-400/30"
            aria-hidden="true"
          />

          <FeatureCard
            href="/tanken"
            icon="⛽"
            stap={1}
            title="Tankbesparing"
            description="Voer je kenteken in en ontdek hoeveel je bespaart op een volle tank over de grens."
            gradient="from-emerald-500 to-green-600"
            delay="stagger-1"
          />
          <FeatureCard
            href="/boodschappen"
            icon="🛒"
            stap={2}
            title="Boodschappen"
            description="Vergelijk 150+ producten en bereken je besparing op de wekelijkse boodschappen."
            gradient="from-teal-500 to-cyan-600"
            delay="stagger-2"
          />
          <FeatureCard
            href="/resultaat"
            icon="📊"
            stap={3}
            title="Totaaloverzicht"
            description="Bekijk je totale netto besparing inclusief reiskosten. Loont de rit?"
            gradient="from-blue-500 to-indigo-600"
            delay="stagger-3"
          />
        </div>

        {/* Trust indicators — bolder, card-style */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <TrustBadge label="RDW" sublabel="Officiële voertuigdata" />
          <TrustBadge label="3" sublabel="Landen vergeleken" />
          <TrustBadge label="150+" sublabel="Producten" />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  stap,
  title,
  description,
  gradient,
  delay,
}: {
  href: string;
  icon: string;
  stap: number;
  title: string;
  description: string;
  gradient: string;
  delay: string;
}) {
  return (
    <Link
      href={href}
      className={`animate-slide-in-bottom ${delay} card-bold group relative flex items-start gap-4 p-5`}
    >
      {/* Icon met stap badge */}
      <div className="relative shrink-0">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-95`}>
          {icon}
        </div>
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-black text-navy shadow-md ring-2 ring-white dark:bg-navy dark:text-white dark:ring-navy">
          {stap}
        </div>
      </div>

      <div className="flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Stap {stap}
        </p>
        <h2 className="text-base font-extrabold text-navy dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 transition-all duration-200 group-hover:bg-accent/20 group-hover:translate-x-1">
        <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}

function TrustBadge({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <div className="card-bold p-4">
      <div className="text-2xl font-extrabold text-accent">{label}</div>
      <div className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">{sublabel}</div>
    </div>
  );
}
