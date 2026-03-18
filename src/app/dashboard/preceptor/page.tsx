import { Badge } from "@/components/ui/badge";
import { AnalyticsSectionCard } from "@/components/reports/analytics-section-card";
import { CohortProgressCard } from "@/components/reports/cohort-progress-card";
import { MetricCard } from "@/components/reports/metric-card";
import { TraineeSnapshotCard } from "@/components/reports/trainee-snapshot-card";
import { ValidationAlertCard } from "@/components/reports/validation-alert-card";
import { requireDashboardProfile } from "@/services/auth/require-dashboard-profile";
import { fetchLongitudinalReportViewData } from "@/services/db/longitudinal-analytics";

export default async function PreceptorDashboardPage() {
  await requireDashboardProfile("preceptor");
  const data = await fetchLongitudinalReportViewData("preceptor");

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Badge>Preceptor</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Supervisão longitudinal dos trainees</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Visão por coorte e por trainee com progresso teórico, maturidade clínica, atividade recente e backlog de validações.
        </p>
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
