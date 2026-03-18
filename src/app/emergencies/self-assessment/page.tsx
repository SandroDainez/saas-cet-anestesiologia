import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmergencyConfidenceCard } from "@/components/emergencies/emergency-confidence-card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchEmergencyAttemptsByTrainee, fetchEmergencySelfAssessments } from "@/services/db/modules";

export const metadata = {
  title: "Autoavaliação de emergências"
};

export default async function EmergencySelfAssessmentPage() {
  const profile = await requireModuleAccess("emergencies-run");
  const [assessments, attempts] = await Promise.all([
    fetchEmergencySelfAssessments(profile.id, profile.id, "trainee"),
    fetchEmergencyAttemptsByTrainee(profile.id, 1)
  ]);
  const latestAttempt = attempts[0];
  const repeatScenarioHref = latestAttempt
    ? (`/emergencies/${latestAttempt.scenario_id}/run` as const)
    : ("/emergencies" as const);
  const latestResultHref = latestAttempt
    ? (`/emergencies/result/${latestAttempt.id}` as const)
    : ("/emergencies" as const);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-4">
          <div className="space-y-2">
            <Badge>Autoavaliação</Badge>
            <h1 className="text-3xl font-semibold">Confiança em emergências</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Compare a confiança antes e depois das simulações, revise debriefs e identifique cenários que precisam
              de repetição.
            </p>
          </div>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/95 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Próxima ação
              </p>
              <h2 className="mt-2 text-xl font-semibold">Revisar resultado ou voltar à prática</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A leitura útil aqui é sempre operacional: revisar o último desempenho e decidir qual cenário repetir.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={latestResultHref}>
                  <Button size="sm">Ver último resultado</Button>
                </Link>
                <Link href={repeatScenarioHref}>
                  <Button variant="outline" size="sm">Repetir cenário</Button>
                </Link>
                <Link href="/emergencies">
                  <Button variant="ghost" size="sm">Voltar aos cenários</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Resumo
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <SelfMetric label="Autoavaliações" value={`${assessments.length}`} />
                <SelfMetric label="Última tentativa" value={latestAttempt ? "Disponível" : "Sem tentativa"} />
              </div>
            </div>
          </section>
        </header>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Histórico de autoavaliações</h2>
              <p className="text-sm text-muted-foreground">Confiança antes e depois para leitura longitudinal.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Confiança antes e depois</span>
          </div>

          {assessments.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhuma autoavaliação registrada ainda. Resolve uma simulação para gerar o relatório.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assessments.map((assessment) => (
                <EmergencyConfidenceCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SelfMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
