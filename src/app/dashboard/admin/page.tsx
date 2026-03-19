import { AdminActivityFeedCard } from "@/components/admin/admin-activity-feed-card";
import { ContentLibraryUploadPanel } from "@/components/admin/content-library-upload-panel";
import { ModuleNavigationStrip } from "@/components/layout/module-navigation-strip";
import { AdminWorkspace } from "@/features/admin/components/admin-workspace";
import { AnalyticsSectionCard } from "@/components/reports/analytics-section-card";
import { CohortProgressCard } from "@/components/reports/cohort-progress-card";
import { MetricCard } from "@/components/reports/metric-card";
import { TraineeSnapshotCard } from "@/components/reports/trainee-snapshot-card";
import { ValidationAlertCard } from "@/components/reports/validation-alert-card";
import { fetchAdminActivityFeed } from "@/services/admin/fetch-admin-activity-feed";
import { Button } from "@/components/ui/button";
import { discoverContentLibraryFiles } from "@/services/content-library/library-discovery";
import { getContentLibrarySnapshot } from "@/services/content-library/library-index";
import { isSupabaseAdminConfigured } from "@/lib/env";
import { fetchInstitutionUsers } from "@/services/admin/fetch-institution-users";
import { requireDashboardProfile } from "@/services/auth/require-dashboard-profile";
import { fetchLongitudinalReportViewData } from "@/services/db/longitudinal-analytics";
import { uploadContentLibrarySource } from "@/app/dashboard/admin/upload-content-action";
import { publishContentLibrarySource } from "@/app/dashboard/admin/publish-content-action";
import { CommandQuickActions } from "@/components/admin/command-quick-actions";

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
  const [librarySnapshot, libraryDiscovery] = await Promise.all([
    getContentLibrarySnapshot(),
    discoverContentLibraryFiles()
  ]);
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
  const traineeUsers = users.filter((user) => user.role === "trainee_me1" || user.role === "trainee_me2" || user.role === "trainee_me3");
  const traineesByYear = {
    ME1: traineeUsers.filter((user) => user.trainingYear === "ME1").length,
    ME2: traineeUsers.filter((user) => user.trainingYear === "ME2").length,
    ME3: traineeUsers.filter((user) => user.trainingYear === "ME3").length
  };

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
      <ModuleNavigationStrip activeHref="/dashboard/admin" />

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

      <AnalyticsSectionCard title="Equipe acompanhada">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Trainees" value={`${traineeUsers.length}`} helper="Usuários em formação com ano definido." />
          <MetricCard label="ME1" value={`${traineesByYear.ME1}`} helper="Base e fundamentos em acompanhamento." />
          <MetricCard label="ME2" value={`${traineesByYear.ME2}`} helper="Ano intermediário com prática consolidando." />
          <MetricCard label="ME3" value={`${traineesByYear.ME3}`} helper="Ano avançado e cenários complexos." />
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Biblioteca de conteúdo local">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Fontes colocadas em `content-library/` e já registradas no índice. Faça upload direto e atualize a Supabase.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Fontes indexadas" value={`${librarySnapshot.stats.totalIndexedSources}`} helper="Entradas registradas" />
              <MetricCard label="Arquivos existentes" value={`${librarySnapshot.stats.existingFiles}`} helper="Disponíveis no disco" />
              <MetricCard label="Ausentes" value={`${librarySnapshot.stats.missingFiles}`} helper="Precisando restaurar" />
            </div>
            <ContentLibraryUploadPanel action={uploadContentLibrarySource} />
          </div>
          <div className="space-y-3">
            <CommandQuickActions />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Últimas fontes carregadas</p>
            <div className="space-y-2">
              {librarySnapshot.index.sources.slice(-3).map((source) => (
                <article key={source.id} className="rounded-[1.25rem] border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{source.title}</p>
                  <p>{source.filePath}</p>
                  <p className="text-xs uppercase tracking-[0.3em]">Uso: {source.usage.join(", ")}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </AnalyticsSectionCard>

      <AnalyticsSectionCard title="Sugestões de ingestão">
        {libraryDiscovery.suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma sugestão pendente. O upload já ficou pronto.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {libraryDiscovery.suggestions.map((suggestion) => (
              <form
                key={suggestion.id}
                action={publishContentLibrarySource}
                className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/80 p-4"
              >
                <input type="hidden" name="suggestionId" value={suggestion.id} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {suggestion.filePath}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-primary px-2 py-1 text-primary-foreground">
                    {suggestion.sourceType}
                  </span>
                  <span className="rounded-full border border-secondary px-2 py-1 text-secondary-foreground">
                    {suggestion.priority}
                  </span>
                </div>
                <Button type="submit" variant="secondary">
                  Publicar no Supabase
                </Button>
              </form>
            ))}
          </div>
        )}
      </AnalyticsSectionCard>

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
