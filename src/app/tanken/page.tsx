import { PageHeader } from "@/components/PageHeader";
import { TankenForm } from "./tanken-form";

export default function TankenPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Tankbesparing berekenen"
        subtitle="Voer je kenteken en postcode in"
      />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <TankenForm />
      </main>
    </div>
  );
}
