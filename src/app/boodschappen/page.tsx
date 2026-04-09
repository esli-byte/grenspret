import { PageHeader } from "@/components/PageHeader";
import { BoodschappenLijst } from "./boodschappen-lijst";

export default function BoodschappenPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Boodschappen vergelijken"
        subtitle="Vink producten aan en bekijk je besparing"
      />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <BoodschappenLijst />
      </main>
    </div>
  );
}
