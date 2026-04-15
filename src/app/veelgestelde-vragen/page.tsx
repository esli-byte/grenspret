import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { FAQLijst } from "./faq-lijst";

export const metadata = {
  title: "Veelgestelde vragen | Grenspret",
  description:
    "Antwoorden op de belangrijkste vragen over grens-boodschappen, tanken en de Grenspret-app.",
};

export default function VeelgesteldeVragenPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Veelgestelde vragen"
        subtitle="De vragen die mensen ons het meest stellen"
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <FAQLijst />

        {/* Navigatie terug */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full border-2 border-gray-200 bg-white px-5 py-2.5 text-center text-sm font-extrabold text-navy transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-navy/50 dark:text-white"
          >
            Terug naar home
          </Link>
          <Link
            href="/tanken"
            className="rounded-full bg-accent px-5 py-2.5 text-center text-sm font-extrabold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-xl active:scale-95"
          >
            Begin een berekening
          </Link>
        </div>
      </main>
    </div>
  );
}
