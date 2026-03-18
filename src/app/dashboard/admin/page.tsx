import { AdminActivityFeedCard } from "@/components/admin/admin-activity-feed-card";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { AnalyticsSectionCard } from "@/components/reports/analytics-section-card";
import { CohortProgressCard } from "@/components/reports/cohort-progress-card";
import { MetricCard } from "@/components/reports/metric-card";
import { TraineeSnapshotCard } from "@/components/reports/trainee-snapshot-card";
import { ValidationAlertCard } from "@/components/reports/validation-alert-card";
import { fetchAdminActivityFeed } from "@/services/admin/fetch-admin-activity-feed";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { fetchInstitutionUsers } from "@/services/admin/fetch-institution-users";
import { requireDashboardProfile } from "@/services/auth/require-dashboard-profile";
import { fetchLongitudinalReportViewData } from "@/services/db/longitudinal-analytics";

const adminSections = [
  {
    href: "#equipe",
    label: "Equipe",
    description: "Centro da pagina com a lista institucional."
  },
  {
    href: "#novo-usuario",
    label: "Novo usuario",
    description: "Criacao e convite por modal."
  },
  {
    href: "#permissoes",
    label: "Regras",
    description: "Papel, ano e progressao natural."
  },
  {
    href: "#contexto",
    label: "Contexto",
    description: "Tenant atual e indicadores essenciais."
  },
  {
    href: "#analytics",
    label: "Analytics",
    description: "Comparativos por ano, alertas e gaps."
  }
] as const;

export default async function AdminDashboardPage() {
  const profile = await requireDashboardProfile("admin");
  const [users, activityFeed] = await Promise.all([
    fetchInstitutionUsers(profile.institution_id),
    fetchAdminActivityFeed(profile.institution_id, 12)
  ]);
  const data = await fetchLongitudinalReportViewData("admin");
  const stats = [
    {
      title: "Instituição",
      value: profile.institution_name,
      description: `Tenant ativo: ${profile.institution_id}`
    },
    {
      title: "Provas planejadas",
      value: data.overviewMetrics[1]?.value ?? "—",
      description: data.overviewMetrics[1]?.helper ?? "Desempenho recente institucional."
    },
    {
      title: "Conteúdo SBA",
      value: `${data.editorialCoverage.itemsPublished}`,
      description: `${data.editorialCoverage.inReview} itens em revisão editorial.`
    }
  ];

  return (
    <AdminWorkspace
      heading="Operação institucional longitudinal"
      intro="Coordenação com visão combinada de trilhas, provas, logbook, emergências, lacunas e governança de usuários."
      institutionName={profile.institution_name}
      institutionId={profile.institution_id}
      currentUserId={profile.id}
      users={users}
      stats={stats}
      isAdminConfigured={isSupabaseAdminConfigured()}
      sections={adminSections}
    >
      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Prioridades do admin</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <AdminStep title="1. Cobertura" description="Verifique gaps de conteúdo por ano e domínio." />
            <AdminStep title="2. Operação" description="Acompanhe atividade, refresh e validações pendentes." />
            <AdminStep title="3. Intervenção" description="Corrija baixa atividade e risco longitudinal." />
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Leitura rápida</p>
          <div className="mt-4 space-y-3">
            <AdminRow label="Usuários" value={`${users.length}`} />
            <AdminRow label="Eventos recentes" value={`${activityFeed.length}`} />
            <AdminRow label="Snapshots em risco" value={`${data.traineeSnapshots.slice(0, 6).length}`} />
          </div>
        </div>
      </div>

      <div id="analytics" className="grid gap-4 md:grid-cols-3">
        {data.overviewMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} helper={metric.helper} />
        ))}
      </div>

      <AnalyticsSectionCard title="Comparação por ano">
        <div className="grid gap-4 md:grid-cols-3">
          {data.cohortProgress.map((summary) => (
            <CohortProgressCard key={summary.year} {...summary} />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Trainees com maior risco">
        <div className="grid gap-4 md:grid-cols-2">
          {data.traineeSnapshots.slice(0, 6).map((snapshot) => (
            <TraineeSnapshotCard key={snapshot.traineeId} {...snapshot} />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Alertas institucionais">
        <div className="grid gap-4 md:grid-cols-2">
          {data.validationAlerts.map((alert) => (
            <ValidationAlertCard key={`${alert.label}-${alert.detail}`} {...alert} />
          ))}
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Acompanhamento operacional">
        <AdminActivityFeedCard items={activityFeed} />
      </AnalyticsSectionCard>
    </AdminWorkspace>
  );
}

function AdminStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function AdminRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
