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
        <header className="space-y-3">
          <Badge>Admin</Badge>
          <h1 className="text-3xl font-semibold">Estatísticas do logbook</h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento de volume, complexidade e validações para cada instituição.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/logbook">
              <Button variant="outline" size="sm">
                Voltar ao logbook
              </Button>
            </Link>
            {profile.role === "preceptor" || profile.role === "institution_admin" || profile.role === "coordinator" ? (
              <Link href="/logbook/validations">
                <Button variant="ghost" size="sm">
                  Ver validações
                </Button>
              </Link>
            ) : null}
          </div>
        </header>

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
