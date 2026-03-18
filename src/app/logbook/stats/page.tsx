import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogbookStatsCard } from "@/components/logbook/logbook-stats-card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchLogbookStats } from "@/services/db/modules";

export const metadata = {
  title: "Estatísticas"
};

export default async function LogbookStatsPage() {
  const profile = await requireModuleAccess("logbook");
  const stats = await fetchLogbookStats({
    traineeId: profile.role.startsWith("trainee_") ? profile.id : undefined,
    institutionId: profile.institution_id,
    validatorUserId: profile.role === "preceptor" ? profile.id : undefined,
    trainingYear: profile.role.startsWith("trainee_") ? profile.training_year : undefined
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Logbook Analytics</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Estatísticas do logbook</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Acompanhe volume, cobertura curricular, dificuldade percebida e pendências de validação.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryPill label="Procedimentos" value={String(stats.totalProcedures)} />
                <SummaryPill label="Pendentes" value={String(stats.pendingValidations)} />
                <SummaryPill label="Perfil" value={profile.role.replaceAll("_", " ")} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
              <Link href="/logbook">
                <Button variant="outline" size="sm">
                  Voltar ao logbook
                </Button>
              </Link>
              {profile.role === "preceptor" || profile.role === "institution_admin" || profile.role === "coordinator" ? (
                <Link href="/logbook/validations">
                  <Button variant="secondary" size="sm">
                    Abrir validações
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Leitura rápida</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <InsightCard title="1. Volume" description="Confira se o trainee ou a instituição estão no ritmo esperado." />
              <InsightCard title="2. Cobertura" description="Veja quais categorias e procedimentos seguem sub-representados." />
              <InsightCard title="3. Ação" description="Priorize validações e redistribua prática quando houver atraso." />
            </div>
          </div>
          {stats.expectedProgress ? (
            <section className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Esperado por ano</p>
                  <h2 className="text-xl font-semibold">{stats.expectedProgress.label}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-semibold">{stats.expectedProgress.progressPercent}%</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.expectedProgress.actualTotal}/{stats.expectedProgress.expectedTotal} casos registrados
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <LogbookStatsCard title="Procedimentos totais" value={stats.totalProcedures} description="Registrados no sistema" />
          <LogbookStatsCard title="Validações pendentes" value={stats.pendingValidations} description="Agendadas para revisão" />
          <LogbookStatsCard
            title="Procedimento principal"
            value={stats.frequentProcedures[0]?.name ?? "Sem dados"}
            description="Mais frequente"
            accent={`${stats.frequentProcedures[0]?.count ?? 0} registros`}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contagem por procedimento</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Volume prático</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {stats.procedureTypeDistribution.map((item) => (
              <LogbookStatsCard key={item.name} title={item.name} value={item.count} description="Registros acumulados" />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Distribuição por categoria</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">currículo SBA</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {stats.categoryDistribution.map((item) => (
              <LogbookStatsCard key={item.category} title={item.label} value={item.count} description="Procedimentos registrados" />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Distribuição por dificuldade</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Percepção subjetiva</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.difficultyDistribution.map((item) => (
              <div key={item.difficulty} className="rounded-2xl border border-border/70 bg-card/90 p-4">
                <p className="text-sm font-semibold">{item.difficulty}</p>
                <p className="text-3xl font-semibold">{item.count}</p>
                <p className="text-xs text-muted-foreground">Relatórios com essa percepção</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Evolução temporal</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Últimos meses</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.monthlyTrend.map((month) => (
              <div key={month.label} className="rounded-2xl border border-border/70 bg-card/90 p-4">
                <p className="text-sm font-semibold">{month.label}</p>
                <p className="text-3xl font-semibold">{month.count}</p>
                <p className="text-xs text-muted-foreground">Procedimentos registrados</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Procedimentos mais frequentes</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Top 3</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {stats.frequentProcedures.map((item) => (
              <div key={item.name} className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4">
                <p className="text-base font-semibold">{item.name}</p>
                <p className="text-3xl font-semibold">{item.count}</p>
                <p className="text-xs text-muted-foreground">Registros nos últimos 30 dias</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function InsightCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
