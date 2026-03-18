import { Metadata } from "next";

import { AnalyticsSectionCard } from "@/components/reports/analytics-section-card";
import { DomainPerformanceCard } from "@/components/reports/domain-performance-card";
import { EmergencyPerformanceCard } from "@/components/reports/emergency-performance-card";
import { EditorialCoverageCard } from "@/components/reports/editorial-coverage-card";
import { MetricCard } from "@/components/reports/metric-card";
import { ProcedureStatsCard } from "@/components/reports/procedure-stats-card";
import { ProgressSummaryCard } from "@/components/reports/progress-summary-card";
import { ValidationAlertCard } from "@/components/reports/validation-alert-card";
import { getScopeFromRole } from "@/lib/auth/profile";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchReportViewData } from "@/services/db/modules";
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
  const data = await fetchReportViewData(scope);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Analytics</p>
          <h1 className="text-3xl font-semibold">Relatórios - visão {scopeLabels[scope]}</h1>
          <p className="text-sm text-muted-foreground">
            Dados vinculados a provas, trilhas, logbook, emergências, conteúdo e editorial.
          </p>
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
