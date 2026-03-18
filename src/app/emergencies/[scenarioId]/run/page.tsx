import { Badge } from "@/components/ui/badge";
import { EmergencyScenarioRunner } from "@/components/emergencies/emergency-scenario-runner";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchEmergencyScenarioById, fetchEmergencyScenarioSteps } from "@/services/db/modules";

interface EmergencyRunPageProps {
  params: Promise<{
    scenarioId: string;
  }>;
}

export default async function EmergencyRunPage({ params }: EmergencyRunPageProps) {
  const profile = await requireModuleAccess("emergencies-run", { onDenied: "notFound" });
  const { scenarioId } = await params;
  const scenario = await fetchEmergencyScenarioById(scenarioId, profile.institution_id);
  if (!scenario) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-10">
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Cenário não encontrado.
          </div>
        </main>
      </div>
    );
  }

  const steps = await fetchEmergencyScenarioSteps(scenario.id);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-3">
          <Badge>Simulação guiada</Badge>
          <h1 className="text-3xl font-semibold">{scenario.title}</h1>
          <p className="text-sm text-muted-foreground">{scenario.description}</p>
        </section>

        <EmergencyScenarioRunner steps={steps} scenario={{ id: scenario.id, title: scenario.title }} />
      </main>
    </div>
  );
}
