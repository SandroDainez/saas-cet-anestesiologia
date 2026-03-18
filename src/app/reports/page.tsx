import { Metadata } from "next";

import { AnalyticsSectionCard } from "@/components/reports/analytics-section-card";
import { CohortProgressCard } from "@/components/reports/cohort-progress-card";
import { DomainPerformanceCard } from "@/components/reports/domain-performance-card";
import { EmergencyPerformanceCard } from "@/components/reports/emergency-performance-card";
import { EditorialCoverageCard } from "@/components/reports/editorial-coverage-card";
import { MetricCard } from "@/components/reports/metric-card";
import { ProcedureStatsCard } from "@/components/reports/procedure-stats-card";
import { ProgressSummaryCard } from "@/components/reports/progress-summary-card";
import { TraineeSnapshotCard } from "@/components/reports/trainee-snapshot-card";
import { ValidationAlertCard } from "@/components/reports/validation-alert-card";
import { getScopeFromRole } from "@/lib/auth/profile";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { getCompetencyMatrix } from "@/services/curriculum/competency-matrix";
import { fetchLongitudinalReportViewData } from "@/services/db/longitudinal-analytics";
import type { ReportScope } from "@/types/database";

export const metadata: Metadata = {
  title: "Analytics e relatórios"
};

const scopeLabels: Record<ReportScope, string> = {
  trainee: "Trainee",
  preceptor: "Preceptor",
  admin: "Admin / Coordinator"
};

interface ReportsPageProps {
  searchParams?: Promise<{
    scope?: string | string[];
  }>;
}

const resolveScope = (value?: string | string[]): ReportScope => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && (candidate === "trainee" || candidate === "preceptor" || candidate === "admin")) {
    return candidate;
  }
  return "trainee";
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const profile = await requireModuleAccess("reports");
  const resolvedSearchParams = (await (searchParams ?? Promise.resolve({}))) as {
    scope?: string | string[];
  };
  const requestedScope = resolveScope(resolvedSearchParams.scope);
  const scope = getScopeFromRole(profile.role) === "admin"
    ? "admin"
    : getScopeFromRole(profile.role) === "preceptor"
    ? "preceptor"
    : "trainee";
  const data = await fetchLongitudinalReportViewData(scope);
  const matrix = getCompetencyMatrix();

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Analytics</p>
              <h1 className="text-3xl font-semibold">Relatórios - visão {scopeLabels[scope]}</h1>
              <p className="text-sm text-muted-foreground">
                Dados vinculados a provas, trilhas, logbook, emergências, conteúdo e editorial.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm lg:max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Uso recomendado</p>
              <div className="mt-3 space-y-3">
                <ReportStep label="1. Ver visão geral" description="Leia panorama, risco e atividade antes de aprofundar." />
                <ReportStep label="2. Abrir coortes" description="Compare anos para localizar atrasos e desequilíbrios." />
                <ReportStep label="3. Agir no detalhe" description="Desça para trainee, alerta ou cobertura editorial." />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(scopeLabels) as ReportScope[]).map((item) => (
              <a
                key={item}
                href={`/reports?scope=${requestedScope === item ? requestedScope : item}`}
                className={`rounded-full border px-4 py-1 text-xs uppercase tracking-[0.3em] ${
                  item === scope
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/70 text-muted-foreground"
                }`}
              >
                {scopeLabels[item]}
              </a>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {matrix.map((yearBlock) => (
            <div key={yearBlock.year} className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{yearBlock.year}</p>
              <h2 className="mt-2 text-lg font-semibold">{yearBlock.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{yearBlock.focus}</p>
            </div>
          ))}
        </section>

        <AnalyticsSectionCard title="Visão geral">
          <div className="grid gap-4 md:grid-cols-3">
            {data.overviewMetrics.map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} />
            ))}
          </div>
        </AnalyticsSectionCard>

        <AnalyticsSectionCard title="Domínios e desempenho" description="Baseado em exames, trilhas e questionário">
          <div className="grid gap-4 md:grid-cols-2">
            {data.domainPerformance.map((domain) => (
              <DomainPerformanceCard
                key={domain.domain}
                domain={domain.domain}
                scorePercent={domain.scorePercent}
                improvement={domain.improvement}
                bestTopic={domain.bestTopic}
                worstTopic={domain.worstTopic}
              />
            ))}
          </div>
        </AnalyticsSectionCard>

        <AnalyticsSectionCard title="Progresso e trilhas">
          <div className="grid gap-4 md:grid-cols-2">
            {data.progressSummaries.map((summary) => (
              <ProgressSummaryCard
                key={summary.title}
                title={summary.title}
                detail={summary.detail}
                progressPercent={summary.progressPercent}
              />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {data.procedureStats.map((stat) => (
              <ProcedureStatsCard key={stat.title} title={stat.title} value={stat.value} trend={stat.trend} />
            ))}
          </div>
        </AnalyticsSectionCard>

        <AnalyticsSectionCard title="Comparação por ano">
          <div className="grid gap-4 md:grid-cols-3">
            {data.cohortProgress.map((summary) => (
              <CohortProgressCard key={summary.year} {...summary} />
            ))}
          </div>
        </AnalyticsSectionCard>

        <AnalyticsSectionCard title="Snapshots dos trainees" description="Atual vs. esperado, atividade recente e pendências">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.traineeSnapshots.map((snapshot) => (
              <TraineeSnapshotCard key={snapshot.traineeId} {...snapshot} />
            ))}
          </div>
        </AnalyticsSectionCard>

        <AnalyticsSectionCard title="Validations & alerts">
          <div className="grid gap-4 md:grid-cols-3">
            {data.validationAlerts.map((alert) => (
              <ValidationAlertCard
                key={alert.label}
                label={alert.label}
                detail={alert.detail}
                severity={alert.severity}
              />
            ))}
          </div>
        </AnalyticsSectionCard>

        <AnalyticsSectionCard title="Emergências e autopercepção">
          <div className="grid gap-4 md:grid-cols-2">
            {data.emergencyPerformance.map((performance) => (
              <EmergencyPerformanceCard key={performance.scenario} {...performance} />
            ))}
          </div>
        </AnalyticsSectionCard>

        <AnalyticsSectionCard title="Cobertura editorial">
          <EditorialCoverageCard {...data.editorialCoverage} />
          <div className="text-sm text-muted-foreground">
            Uso de conteúdo: {data.usageInsights.join(" · ")}
          </div>
        </AnalyticsSectionCard>
      </main>
    </div>
  );
}

function ReportStep({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
