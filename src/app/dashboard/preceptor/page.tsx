import { Badge } from "@/components/ui/badge";
import { AnalyticsSectionCard } from "@/components/reports/analytics-section-card";
import { CohortProgressCard } from "@/components/reports/cohort-progress-card";
import { MetricCard } from "@/components/reports/metric-card";
import { TraineeSnapshotCard } from "@/components/reports/trainee-snapshot-card";
import { ValidationAlertCard } from "@/components/reports/validation-alert-card";
import { requireDashboardProfile } from "@/services/auth/require-dashboard-profile";
import { getCompetencyMatrix } from "@/services/curriculum/competency-matrix";
import { fetchLongitudinalReportViewData } from "@/services/db/longitudinal-analytics";

export default async function PreceptorDashboardPage() {
  const profile = await requireDashboardProfile("preceptor");
  const data = await fetchLongitudinalReportViewData("preceptor");
  const matrix = getCompetencyMatrix();

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge>Preceptor</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Supervisão longitudinal dos trainees</h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                Visão por coorte e por trainee com progresso teórico, maturidade clínica, atividade recente e backlog
                de validações.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <PreceptorStat label="Perfil" value={profile.role.replaceAll("_", " ")} />
              <PreceptorStat label="Coortes" value={`${data.cohortProgress.length}`} />
              <PreceptorStat label="Trainees" value={`${data.traineeSnapshots.length}`} />
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm lg:max-w-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Foco de supervisão</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {matrix.map((yearBlock) => (
                <span key={yearBlock.year} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                  {yearBlock.year}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.overviewMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} />
        ))}
      </div>

      <AnalyticsSectionCard title="Comparação institucional por ano">
        <div className="grid gap-4 md:grid-cols-3">
          {data.cohortProgress.map((summary) => (
            <CohortProgressCard key={summary.year} {...summary} />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Trainees com acompanhamento ativo">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.traineeSnapshots.map((snapshot) => (
            <TraineeSnapshotCard key={snapshot.traineeId} {...snapshot} />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Alertas prioritários">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.validationAlerts.map((alert) => (
            <ValidationAlertCard key={`${alert.label}-${alert.detail}`} {...alert} />
          ))}
        </div>
      </AnalyticsSectionCard>
    </section>
  );
}

function PreceptorStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
