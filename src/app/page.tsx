import Link from "next/link";
import { HuishoudensKiezer } from "./huishoudens-kiezer";
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
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Huishoudens kiezer */}
        <HuishoudensKiezer />

        {/* Feature cards — Duolingo-style bold cards */}
        <div className="mt-6 grid gap-4">
          <FeatureCard
            href="/tanken"
            icon="⛽"
            title="Tankbesparing"
            description="Voer je kenteken in en ontdek hoeveel je bespaart op een volle tank over de grens."
            gradient="from-emerald-500 to-green-600"
            delay="stagger-1"
          />
          <FeatureCard
            href="/boodschappen"
            icon="🛒"
            title="Boodschappen"
            description="Vergelijk 20+ producten en bereken je besparing op de wekelijkse boodschappen."
            gradient="from-teal-500 to-cyan-600"
            delay="stagger-2"
          />
          <FeatureCard
            href="/resultaat"
            icon="📊"
            title="Totaaloverzicht"
            description="Bekijk je totale netto besparing inclusief reiskosten. Loont de rit?"
            gradient="from-blue-500 to-indigo-600"
            delay="stagger-3"
          />
        </div>

        {/* Trust indicators — bolder, card-style */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <TrustBadge label="RDW" sublabel="Officiele voertuigdata" />
          <TrustBadge label="3" sublabel="Landen vergeleken" />
          <TrustBadge label="20+" sublabel="Producten" />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
  gradient,
  delay,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  delay: string;
}) {
  return (
    <Link
      href={href}
      className={`animate-slide-in-bottom ${delay} card-bold group flex items-start gap-4 p-5`}
    >
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-95`}>
        {icon}
      </div>
      <div className="flex-1">
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
