import { Badge } from "@/components/ui/badge";
import { AnalyticsSectionCard } from "@/components/reports/analytics-section-card";
import { DomainPerformanceCard } from "@/components/reports/domain-performance-card";
import { EmergencyPerformanceCard } from "@/components/reports/emergency-performance-card";
import { MetricCard } from "@/components/reports/metric-card";
import { ProcedureStatsCard } from "@/components/reports/procedure-stats-card";
import { ProgressSummaryCard } from "@/components/reports/progress-summary-card";
import { TraineeSnapshotCard } from "@/components/reports/trainee-snapshot-card";
import { ValidationAlertCard } from "@/components/reports/validation-alert-card";
import { requireDashboardProfile } from "@/services/auth/require-dashboard-profile";
import { fetchLongitudinalReportViewData } from "@/services/db/longitudinal-analytics";

export default async function TraineeDashboardPage() {
  const profile = await requireDashboardProfile("trainee");
  const data = await fetchLongitudinalReportViewData("trainee");
  const ownSnapshot = data.traineeSnapshots[0];

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Badge>Trainee</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Progresso longitudinal {profile.training_year ?? "ME1"}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Painel conectado a trilhas, provas, logbook, emergências e caderno de erros para mostrar o atual vs. esperado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.overviewMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} />
        ))}
      </div>

      {ownSnapshot ? (
        <AnalyticsSectionCard title="Seu retrato atual">
          <TraineeSnapshotCard {...ownSnapshot} />
        </AnalyticsSectionCard>
      ) : null}

      <AnalyticsSectionCard title="Progresso do ano">
        <div className="grid gap-4 md:grid-cols-3">
          {data.progressSummaries.map((summary) => (
            <ProgressSummaryCard key={summary.title} {...summary} />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Desempenho recente">
        <div className="grid gap-4 md:grid-cols-3">
          {data.procedureStats.map((stat) => (
            <ProcedureStatsCard key={stat.title} {...stat} />
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data.domainPerformance.map((domain) => (
            <DomainPerformanceCard key={domain.domain} {...domain} />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Emergências e autopercepção">
        <div className="grid gap-4 md:grid-cols-2">
          {data.emergencyPerformance.map((item) => (
            <EmergencyPerformanceCard key={item.scenario} {...item} />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Alertas de acompanhamento">
        <div className="grid gap-4 md:grid-cols-2">
          {data.validationAlerts.map((alert) => (
            <ValidationAlertCard key={`${alert.label}-${alert.detail}`} {...alert} />
          ))}
        </div>
      </AnalyticsSectionCard>
    </section>
  );
}
