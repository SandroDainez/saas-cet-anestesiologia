import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorialSynthesisPanel } from "@/components/content-management/editorial-synthesis-panel";
import { LocalSourceInlineCallout } from "@/components/content-management/local-source-inline-callout";
import { LocalSourceExcerptPanel } from "@/components/content-management/local-source-excerpt-panel";
import { LocalSourceList } from "@/components/content-management/local-source-list";
import { EmergencyScenarioCard } from "@/components/emergencies/emergency-scenario-card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { buildEditorialSynthesis } from "@/services/content-library/editorial-synthesis";
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
  const localContext = await getRecommendedLocalContext({
    usage: "emergencies",
    preferredYears: profile.training_year ? [profile.training_year] : [],
    keywords: [scenario.title, scenario.category, ...(scenario.description ? [scenario.description] : [])],
    limit: 4
  });
  const synthesis = buildEditorialSynthesis({
    primaryText: `${scenario.title}\n${scenario.description ?? ""}\n${steps.map((step) => step.prompt_text).join("\n")}`,
    localPreviews: localContext.previews
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Emergências</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">{scenario.title}</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">{scenario.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ScenarioFact label="Categoria" value={scenario.category} />
                <ScenarioFact label="Etapas" value={String(steps.length)} />
                <ScenarioFact label="Acesso" value={scenario.universal_access ? "Universal" : "Institucional"} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
              <Link href={`/emergencies/${scenario.id}/run`}>
                <Button size="sm">Executar cenário</Button>
              </Link>
              <Link href="/emergencies">
                <Button variant="outline" size="sm">
                  Voltar a emergências
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <EmergencyScenarioCard scenario={scenario} attempts={steps.length} />
          <Card className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Como usar este cenário</CardTitle>
              <p className="text-sm text-muted-foreground">
                Estruture a prática para revisar algoritmo, tomada de decisão e debrief.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScenarioStep label="1. Ler o contexto" description="Revise objetivo, gravidade e foco clínico do caso." />
              <ScenarioStep label="2. Executar o fluxo" description="Resolva as etapas na ordem e registre a conduta escolhida." />
              <ScenarioStep label="3. Revisar resultado" description="Use o debrief para comparar sua resposta com a conduta esperada." />
            </CardContent>
          </Card>
        </section>

        <LocalSourceInlineCallout title="Apoio local para esta emergência" previews={localContext.previews} />
        <EditorialSynthesisPanel title="Síntese clínica do cenário" synthesis={synthesis} />

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

        <LocalSourceList
          title="Biblioteca local relacionada"
          description="Fontes complementares da content-library ligadas a esta emergência."
          sources={localContext.recommendedSources}
        />

        <LocalSourceExcerptPanel
          title="Trechos locais recomendados"
          description="Excertos da biblioteca local para revisar algoritmo e contexto clínico."
          previews={localContext.previews}
        />
      </main>
    </div>
  );
}

function ScenarioFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ScenarioStep({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
