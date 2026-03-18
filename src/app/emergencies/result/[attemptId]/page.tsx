import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmergencyDebriefCard } from "@/components/emergencies/emergency-debrief-card";
import { EmergencyConfidenceCard } from "@/components/emergencies/emergency-confidence-card";
import { getScopeFromRole } from "@/lib/auth/profile";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchEmergencyAttemptActions, fetchEmergencyAttemptById, fetchEmergencyScenarioById, fetchEmergencyScenarioSteps, fetchEmergencySelfAssessmentByAttempt } from "@/services/db/modules";

export const metadata = {
  title: "Resultado de emergência"
};

interface EmergencyResultPageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export default async function EmergencyResultPage({ params }: EmergencyResultPageProps) {
  const profile = await requireModuleAccess("emergencies", { onDenied: "notFound" });
  const scope = getScopeFromRole(profile.role);
  const { attemptId } = await params;
  const attempt = await fetchEmergencyAttemptById(attemptId, profile.id, scope, profile.institution_id);
  if (!attempt) {
    notFound();
  }

  const [scenario, actions, steps, selfAssessment] = await Promise.all([
    fetchEmergencyScenarioById(attempt.scenario_id, profile.institution_id),
    fetchEmergencyAttemptActions(attempt.id),
    fetchEmergencyScenarioSteps(attempt.scenario_id),
    fetchEmergencySelfAssessmentByAttempt(attempt.id)
  ]);
  const stepMap = new Map(steps.map((step) => [step.id, step]));
  const expectedActions = actions.filter((action) => action.is_expected_action).length;
  const unexpectedActions = actions.length - expectedActions;

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Debriefing</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">{scenario?.title ?? "Cenário"}</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">{scenario?.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ResultMetric label="Pontuação" value={`${attempt.score_percent ?? 0}%`} />
                <ResultMetric label="Condutas esperadas" value={String(expectedActions)} />
                <ResultMetric label="Desvios" value={String(unexpectedActions)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
              {scenario ? (
                <Link href={`/emergencies/${scenario.id}/run`}>
                  <Button size="sm">Repetir cenário</Button>
                </Link>
              ) : null}
              <Link href="/emergencies">
                <Button variant="outline" size="sm">
                  Voltar aos cenários
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <EmergencyDebriefCard
          score={attempt.score_percent ?? 0}
          summary={attempt.debrief_summary ?? "Nenhum resumo disponível."}
          recommend="Reveja o feedback e compartilhe com sua equipe."
        />

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <Card className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Leitura recomendada do debrief</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use esta ordem para transformar o cenário em melhoria prática.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <ResultStep label="1. Entender o resumo" description="Leia o debrief antes de revisar ação por ação." />
              <ResultStep label="2. Rever condutas" description="Compare suas escolhas com a sequência esperada." />
              <ResultStep label="3. Repetir o caso" description="Refaça o cenário para consolidar o algoritmo." />
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Resumo operacional</CardTitle>
              <p className="text-sm text-muted-foreground">Indicadores rápidos deste cenário.</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <ResultRow label="Status" value={attempt.completion_status} />
              <ResultRow label="Ações registradas" value={String(actions.length)} />
              <ResultRow label="Autoavaliação" value={selfAssessment ? "Registrada" : "Pendente"} />
            </CardContent>
          </Card>
        </section>

        {selfAssessment ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Autoavaliação pós-cenário</h2>
              <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Reflexão do trainee</span>
            </div>
            <EmergencyConfidenceCard assessment={selfAssessment} />
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ações registradas</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Registro automático</span>
          </div>
          {actions.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhuma ação registrada neste cenário.
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <Card key={action.id} className="space-y-3">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base">{stepMap.get(action.scenario_step_id)?.prompt_text ?? action.scenario_step_id}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {action.is_expected_action ? "Conduta esperada" : "Desvio da conduta oficial"}
                    </p>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Escolha registrada: {String(action.action_payload.selected_label ?? action.action_payload.selected_key ?? "Sem dado")}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Registrada em {new Date(action.action_timestamp).toLocaleString("pt-BR")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Compartilhe com o preceptor</h2>
            {scenario ? (
              <Link href={`/emergencies/${scenario.id}`}>
                <Button variant="outline" size="sm">
                  Rever cenário
                </Button>
              </Link>
            ) : null}
          </div>
          <Card className="space-y-3 border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Resumo clínico</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Pontuação registrada: {attempt.score_percent ?? "N/A"}%. Status: {attempt.completion_status}.
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ResultStep({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
