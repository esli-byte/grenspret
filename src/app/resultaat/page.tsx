import { PageHeader } from "@/components/PageHeader";
import { ResultaatOverzicht } from "./resultaat-overzicht";

export default function ResultaatPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Totaaloverzicht"
        subtitle="Jouw complete besparing over de grens"
      />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <ResultaatOverzicht />
      </main>
    </div>
  );
}
