import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "Privacybeleid | Grenspret",
  description:
    "Hoe Grenspret omgaat met je gegevens. Alles blijft lokaal op jouw apparaat.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Privacybeleid"
        subtitle="Laatst bijgewerkt: april 2026"
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="space-y-6">

          {/* Intro */}
          <section className="card-bold p-5">
            <div className="flex items-start gap-3">
              <span className="text-lg">🔒</span>
              <div>
                <h2 className="text-sm font-extrabold text-navy dark:text-white">
                  Jouw privacy is belangrijk
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  Grenspret is ontworpen met privacy als uitgangspunt. We verzamelen zo min mogelijk gegevens en alles wat je invoert blijft op jouw apparaat.
                </p>
              </div>
            </div>
          </section>

          {/* Welke gegevens */}
          <section className="card-bold p-5 space-y-3">
            <h2 className="text-sm font-extrabold text-navy dark:text-white">
              Welke gegevens verwerken we?
            </h2>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">1</span>
                <div>
                  <p className="text-xs font-bold text-navy dark:text-white">Kenteken</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Wordt alleen gebruikt om je voertuiggegevens op te halen via de openbare RDW-database. Wordt lokaal op je apparaat opgeslagen, niet op onze servers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">2</span>
                <div>
                  <p className="text-xs font-bold text-navy dark:text-white">Postcode</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Wordt gebruikt om de dichtstbijzijnde grenslocaties te berekenen. Wordt lokaal opgeslagen en niet naar externe servers gestuurd.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">3</span>
                <div>
                  <p className="text-xs font-bold text-navy dark:text-white">Boodschappenlijst</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Je geselecteerde producten en aantallen worden lokaal bewaard zodat je ze bij een volgend bezoek terugvindt. Niets verlaat je apparaat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Wat we NIET doen */}
          <section className="card-bold border-accent/20 bg-accent/5 p-5 space-y-2 dark:bg-accent/10 dark:border-accent/10">
            <h2 className="text-sm font-extrabold text-navy dark:text-white">
              Wat we NIET doen
            </h2>
            <ul className="space-y-1.5">
              {[
                "We verkopen geen persoonlijke gegevens aan derden",
                "We plaatsen geen tracking cookies of advertentie-pixels",
                "We maken geen gebruikersprofielen voor marketing",
                "We delen geen gegevens met adverteerders",
                "We slaan geen kentekens of postcodes op onze servers op",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                  <span className="mt-0.5 text-accent">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Lokale opslag */}
          <section className="card-bold p-5 space-y-2">
            <h2 className="text-sm font-extrabold text-navy dark:text-white">
              Lokale opslag (localStorage)
            </h2>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              Grenspret slaat je voorkeuren op via localStorage in je browser. Dit is vergelijkbaar met een notitieblokje op je eigen telefoon — alleen jij hebt er toegang toe. Je kunt deze gegevens op elk moment wissen door je browsergegevens te verwijderen of de app te deïnstalleren.
            </p>
          </section>

          {/* Externe diensten */}
          <section className="card-bold p-5 space-y-2">
            <h2 className="text-sm font-extrabold text-navy dark:text-white">
              Externe diensten
            </h2>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              Om actuele prijzen te tonen, maakt Grenspret verbinding met de volgende openbare bronnen:
            </p>
            <ul className="space-y-1 text-[11px] text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span><strong className="text-navy dark:text-white">RDW Open Data</strong> — voertuiggegevens op basis van kenteken</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span><strong className="text-navy dark:text-white">CBS</strong> — Nederlandse brandstofprijzen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span><strong className="text-navy dark:text-white">Tankerkoenig</strong> — Duitse brandstofprijzen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span><strong className="text-navy dark:text-white">FOD Economie</strong> — Belgische brandstofprijzen</span>
              </li>
            </ul>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              Bij deze verzoeken wordt geen persoonlijke informatie meegestuurd.
            </p>
          </section>

          {/* Hosting */}
          <section className="card-bold p-5 space-y-2">
            <h2 className="text-sm font-extrabold text-navy dark:text-white">
              Hosting
            </h2>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              Grenspret wordt gehost op Vercel. Vercel verwerkt standaard serverlogboeken (IP-adres, browser, tijdstip) voor het functioneren van de dienst. Wij hebben geen toegang tot deze logboeken en gebruiken ze niet voor tracking of analyse.
            </p>
          </section>

          {/* Kinderen */}
          <section className="card-bold p-5 space-y-2">
            <h2 className="text-sm font-extrabold text-navy dark:text-white">
              Kinderen
            </h2>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              Grenspret is geschikt voor alle leeftijden en verzamelt bewust geen gegevens van kinderen onder de 16 jaar.
            </p>
          </section>

          {/* Wijzigingen */}
          <section className="card-bold p-5 space-y-2">
            <h2 className="text-sm font-extrabold text-navy dark:text-white">
              Wijzigingen
            </h2>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              Als dit privacybeleid wijzigt, plaatsen we de bijgewerkte versie op deze pagina met een nieuwe datum. Bij grote wijzigingen geven we dit aan in de app.
            </p>
          </section>

          {/* Contact */}
          <section className="card-bold p-5 space-y-2">
            <h2 className="text-sm font-extrabold text-navy dark:text-white">
              Contact
            </h2>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              Vragen over je privacy? Neem contact op via{" "}
              <a href="mailto:info@grenspret.nl" className="font-bold text-accent hover:underline">
                info@grenspret.nl
              </a>
            </p>
          </section>
        </div>

        {/* Navigatie terug */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full border-2 border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-extrabold text-navy transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
          >
            Terug naar home
          </Link>
        </div>
      </main>
    </div>
  );
}
