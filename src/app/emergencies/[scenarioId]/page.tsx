import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmergencyScenarioCard } from "@/components/emergencies/emergency-scenario-card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchEmergencyScenarioById, fetchEmergencyScenarioSteps } from "@/services/db/modules";

export const metadata = {
  title: "Cenário de emergência"
};

interface ScenarioDetailPageProps {
  params: Promise<{
    scenarioId: string;
  }>;
}

export default async function ScenarioDetailPage({ params }: ScenarioDetailPageProps) {
  const profile = await requireModuleAccess("emergencies", { onDenied: "notFound" });
  const { scenarioId } = await params;
  const scenario = await fetchEmergencyScenarioById(scenarioId, profile.institution_id);
  if (!scenario) {
    notFound();
  }

  const steps = await fetchEmergencyScenarioSteps(scenario.id);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-4">
          <EmergencyScenarioCard scenario={scenario} attempts={steps.length} />
          <div className="flex flex-wrap gap-3">
            <Link href={`/emergencies/${scenario.id}/run`}>
              <Button>Executar cenário</Button>
            </Link>
            <Link href="/emergencies">
              <Button variant="outline">
                Voltar a emergências
              </Button>
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Etapas do cenário</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Fluxo guiado</span>
          </div>
          <div className="grid gap-3">
            {steps.map((step) => (
              <Card key={step.id} className="space-y-2">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Etapa {step.step_order}</CardTitle>
                  <p className="text-sm text-muted-foreground">{step.prompt_text}</p>
                </CardHeader>
                <CardContent className="p-4 text-xs text-muted-foreground">
                  {step.step_type.toUpperCase()} · Governança SBA aplicada
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
