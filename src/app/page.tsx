import Link from "next/link";
import { HuishoudensKiezer } from "./huishoudens-kiezer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-accent px-4 pb-12 pt-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-pulse-ring absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/10" />
          <div className="animate-pulse-ring absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="animate-float text-4xl">⛽</span>
            <span className="animate-float-delayed text-5xl">💰</span>
            <span className="animate-float-delayed-2 text-4xl">🛒</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Grensbesparing
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-accent-light/90">
            Bereken in seconden of het loont om in Duitsland of België te tanken
            en boodschappen te doen.
          </p>

          <Link
            href="/tanken"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          >
            Start berekening
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Huishoudens kiezer */}
        <HuishoudensKiezer />

        {/* Feature cards */}
        <div className="mt-6 grid gap-4">
          <FeatureCard
            href="/tanken"
            icon="⛽"
            title="Tankbesparing"
            description="Voer je kenteken in en ontdek hoeveel je bespaart op een volle tank over de grens."
            accent="bg-emerald-50 dark:bg-emerald-950/30"
            iconBg="bg-emerald-100 dark:bg-emerald-900"
          />
          <FeatureCard
            href="/boodschappen"
            icon="🛒"
            title="Boodschappen"
            description="Vergelijk 20 populaire producten en bereken je besparing op de wekelijkse boodschappen."
            accent="bg-teal-50 dark:bg-teal-950/30"
            iconBg="bg-teal-100 dark:bg-teal-900"
          />
          <FeatureCard
            href="/resultaat"
            icon="📊"
            title="Totaaloverzicht"
            description="Bekijk je totale netto besparing inclusief reiskosten. Loont de rit?"
            accent="bg-green-50 dark:bg-green-950/30"
            iconBg="bg-green-100 dark:bg-green-900"
          />
        </div>

        {/* Trust indicators */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-surface p-3 shadow-sm">
            <div className="text-2xl font-extrabold text-primary dark:text-accent">RDW</div>
            <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Officiele voertuigdata</div>
          </div>
          <div className="rounded-xl bg-surface p-3 shadow-sm">
            <div className="text-2xl font-extrabold text-primary dark:text-accent">3</div>
            <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Landen vergeleken</div>
          </div>
          <div className="rounded-xl bg-surface p-3 shadow-sm">
            <div className="text-2xl font-extrabold text-primary dark:text-accent">20+</div>
            <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Producten</div>
          </div>
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
  accent,
  iconBg,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 rounded-2xl border border-gray-100 ${accent} p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] dark:border-gray-800`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} text-2xl transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div className="flex-1">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <svg className="mt-1 h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
