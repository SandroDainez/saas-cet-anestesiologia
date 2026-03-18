import { DashboardShortcutsCard } from "@/components/dashboard/dashboard-shortcuts-card";
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
import { getCompetencyYearSummary } from "@/services/curriculum/competency-matrix";
import { fetchLongitudinalReportViewData } from "@/services/db/longitudinal-analytics";

export default async function TraineeDashboardPage() {
  const profile = await requireDashboardProfile("trainee");
  const data = await fetchLongitudinalReportViewData("trainee");
  const ownSnapshot = data.traineeSnapshots.find((snapshot) => snapshot.traineeId === profile.id);
  const yearSummary = profile.training_year ? getCompetencyYearSummary(profile.training_year) : null;

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge>Trainee</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Progresso longitudinal {profile.training_year ?? "ME1"}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                Painel conectado a trilhas, provas, logbook, emergências e caderno de erros para mostrar o atual vs.
                esperado dentro do seu ano.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <DashboardScopeStat label="Ano" value={profile.training_year ?? "ME1"} />
              <DashboardScopeStat label="Snapshot" value={ownSnapshot ? "Disponível" : "Pendente"} />
              <DashboardScopeStat label="Domínios" value={`${yearSummary?.coverageDomains.length ?? 0}`} />
            </div>
          </div>
          {yearSummary ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm lg:max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Foco do ano</p>
              <div className="mt-3 space-y-3">
                <p className="text-sm text-muted-foreground">{yearSummary.focus}</p>
                <div className="flex flex-wrap gap-2">
                  {yearSummary.coverageDomains.slice(0, 4).map((domain) => (
                    <span key={domain.id} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                      {domain.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.overviewMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} />
        ))}
      </div>

      <DashboardShortcutsCard
        title="Ações e módulos"
        description="Atalhos diretos para estudo, prática clínica, autoavaliação, logbook e guias anestésicos."
        items={[
          {
            id: "tracks",
            href: "/trilhas",
            title: "Trilhas interativas",
            description: "Retomar lições, checkpoints e metas de estudo."
          },
          {
            id: "questions",
            href: "/question-bank",
            title: "Banco de questões",
            description: "Treinar questões por tema, ano e formato."
          },
          {
            id: "exams",
            href: "/exams",
            title: "Provas SBA",
            description: "Abrir trimestrais, anuais e treinos curtos."
          },
          {
            id: "logbook",
            href: "/logbook",
            title: "Logbook",
            description: "Registrar procedimentos e acompanhar validações."
          },
          {
            id: "self-assessment",
            href: "/emergencies/self-assessment",
            title: "Autoavaliação",
            description: "Revisar confiança, debrief e desempenho em emergências."
          },
          {
            id: "guides",
            href: "/surgery-guides",
            title: "Guias por cirurgia",
            description: "Consultar técnica, monitorização e adjuvantes por procedimento."
          }
        ]}
      />

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

function DashboardScopeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
