import Link from "next/link";

import { LocalInsightPanel } from "@/components/content-management/local-insight-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmergencyCoverageCard } from "@/components/emergencies/emergency-coverage-card";
import { EmergencyScenarioCard } from "@/components/emergencies/emergency-scenario-card";
import { getScopeFromRole } from "@/lib/auth/profile";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { buildLocalEditorialInsights } from "@/services/content-library/library-editorial-insights";
import { getEmergencyCoverageByYear } from "@/services/emergencies/emergency-coverage";
import { fetchEmergencyAttemptsByTrainee, fetchEmergencyScenarios, fetchEmergencySummary } from "@/services/db/modules";

export const metadata = {
  title: "Emergências"
};

export default async function EmergenciesPage() {
  const profile = await requireModuleAccess("emergencies");
  const scope = getScopeFromRole(profile.role);
  const [scenarios, summary] = await Promise.all([
    fetchEmergencyScenarios(profile.institution_id),
    fetchEmergencySummary({
      traineeUserId: scope === "trainee" ? profile.id : undefined,
      institutionId: profile.institution_id
    })
  ]);
  const coverage = getEmergencyCoverageByYear(scope === "trainee" ? profile.training_year : undefined);
  const recentAttempts = scope === "trainee" ? await fetchEmergencyAttemptsByTrainee(profile.id, 5) : [];
  const localContext = await getRecommendedLocalContext({
    usage: "emergencies",
    preferredYears: scope === "trainee" && profile.training_year ? [profile.training_year] : [],
    keywords: ["emergencia", "crise", "via aerea", "hemodinamica", "anafilaxia", "last"],
    limit: 4
  });
  const localInsights = buildLocalEditorialInsights(localContext.previews, 3);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <Badge>Emergências</Badge>
          <h1 className="text-3xl font-semibold">Complicações críticas em anestesiologia</h1>
          <p className="text-sm text-muted-foreground">
            Cenários baseados em guidelines SBA/IA governada. Navegue pelos casos mais relevantes e execute simulações.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/logbook">
              <Button variant="outline" size="sm">
                Ver logbook
              </Button>
            </Link>
            <Link href="/emergencies/self-assessment">
              <Button variant="ghost" size="sm">
                Autoavaliação
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4 text-sm">
            <p>Total de tentativas</p>
            <p className="text-3xl font-semibold">{summary.totalAttempts}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4 text-sm">
            <p>Debriefings pendentes</p>
            <p className="text-3xl font-semibold">{summary.pendingDebriefs}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4 text-sm">
            <p>Prontidão percebida</p>
            <p className="text-3xl font-semibold">{Object.keys(summary.readinessLevels).length}</p>
          </div>
        </section>

        {recentAttempts.length ? (
          <section className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Últimas tentativas</p>
                <h2 className="text-xl font-semibold">Seu histórico recente</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Média das últimas {recentAttempts.length}:{" "}
                {Math.round(
                  recentAttempts.reduce((acc, attempt) => acc + Number(attempt.score_percent ?? 0), 0) / recentAttempts.length
                )}
                %
              </p>
            </div>
          </section>
        ) : null}

        <LocalInsightPanel
          title="Destaques da biblioteca local"
          description="Trechos do acervo local para reforçar algoritmos e revisão de crise."
          insights={localInsights}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Cobertura de complicações críticas</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Grade mínima obrigatória</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {coverage.map((item) => (
              <EmergencyCoverageCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Cenários disponíveis</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Documentados conforme SBA</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {scenarios.map((scenario) => (
              <EmergencyScenarioCard key={scenario.id} scenario={scenario} attempts={summary.categoryBreakdown[scenario.category] ?? 0} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
