import Link from "next/link";

import { ModuleNavigationStrip } from "@/components/layout/module-navigation-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProcedureLogCard } from "@/components/logbook/procedure-log-card";
import { LogbookStatsCard } from "@/components/logbook/logbook-stats-card";
import { LogbookYearSummary } from "@/components/logbook/logbook-year-summary";
import { getScopeFromRole } from "@/lib/auth/profile";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchInstitutionUnits, fetchLogbookStats, fetchProcedureCatalogEntries, fetchProcedureLogs, fetchProcedureSelfAssessment, fetchProcedureValidations, fetchSurgeryCatalogEntries } from "@/services/db/modules";

export const metadata = {
  title: "Logbook"
};

export default async function LogbookPage() {
  const profile = await requireModuleAccess("logbook");
  const scope = getScopeFromRole(profile.role);
  const traineeId = scope === "trainee" ? profile.id : undefined;
  const validatorUserId = scope === "preceptor" ? profile.id : undefined;

  const [logs, stats, procedures, surgeries, units] = await Promise.all([
    fetchProcedureLogs(traineeId, profile.institution_id),
    fetchLogbookStats({
      traineeId,
      institutionId: profile.institution_id,
      validatorUserId,
      trainingYear: scope === "trainee" ? profile.training_year : undefined
    }),
    fetchProcedureCatalogEntries(),
    fetchSurgeryCatalogEntries(),
    fetchInstitutionUnits(profile.institution_id)
  ]);
  const [assessments, validations] = await Promise.all([
    Promise.all(logs.map((log) => fetchProcedureSelfAssessment(log.id))),
    fetchProcedureValidations(undefined, { procedureLogIds: logs.map((log) => log.id) })
  ]);

  const proceduresMap = new Map(procedures.map((procedure) => [procedure.id, procedure]));
  const surgeriesMap = new Map(surgeries.map((surgery) => [surgery.id, surgery]));
  const unitsMap = new Map(units.map((unit) => [unit.id, unit]));
  const validationMap = new Map(validations.map((validation) => [validation.procedure_log_id, validation]));

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <ModuleNavigationStrip activeHref="/logbook" />

        <header className="space-y-4">
          <div className="space-y-2">
            <Badge>Logbook</Badge>
            <h1 className="text-3xl font-semibold">Procedimentos registrados</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Registre procedimentos, acompanhe validações, compare o realizado com a meta do ano e revise sua
              autoavaliação técnica.
            </p>
          </div>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/95 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Ação principal
              </p>
              <h2 className="mt-2 text-xl font-semibold">Registrar e revisar atividade clínica</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use o logbook para documentar o caso, registrar autoavaliação e acompanhar o retorno do preceptor.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/logbook/new">
                  <Button size="sm">Novo registro</Button>
                </Link>
                <Link href="/logbook/stats">
                  <Button variant="outline" size="sm">Ver estatísticas</Button>
                </Link>
                <Link href="/logbook/validations">
                  <Button variant="ghost" size="sm">Abrir validações</Button>
                </Link>
                {scope !== "trainee" ? (
                  <span className="self-center text-xs text-muted-foreground">
                    Revisão institucional habilitada para preceptoria.
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Leitura rápida
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <QuickStat label="Total registrado" value={`${stats.totalProcedures}`} />
                <QuickStat label="Pendências" value={`${stats.pendingValidations}`} />
                <QuickStat
                  label="Mais frequente"
                  value={stats.frequentProcedures[0]?.name ?? "Sem dados"}
                />
                <QuickStat
                  label="Meta do ano"
                  value={
                    stats.expectedProgress
                      ? `${stats.expectedProgress.actualTotal}/${stats.expectedProgress.expectedTotal}`
                      : "—"
                  }
                />
              </div>
            </div>
          </section>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <LogbookStatsCard
            title="Procedimentos"
            value={stats.totalProcedures}
            description="Registrados no logbook"
            accent="Atualizado automaticamente"
          />
          <LogbookStatsCard
            title="Validações pendentes"
            value={stats.pendingValidations}
            description="Casos aguardando revisão do preceptor"
            accent="Status atualizado em tempo real"
          />
          <LogbookStatsCard
            title="Procedimentos frequentes"
            value={stats.frequentProcedures[0]?.name ?? "Sem dados"}
            description="Procedimento mais realizado"
            accent={`${stats.frequentProcedures[0]?.count ?? 0} vezes`}
          />
        </section>

        <LogbookYearSummary logs={logs} />

        {stats.expectedProgress ? (
          <section className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Comparação com o esperado</p>
                <h2 className="text-xl font-semibold">{stats.expectedProgress.label}</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold">{stats.expectedProgress.progressPercent}%</p>
                <p className="text-sm text-muted-foreground">
                  {stats.expectedProgress.actualTotal}/{stats.expectedProgress.expectedTotal} procedimentos
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Últimos registros</h2>
              <p className="text-sm text-muted-foreground">Casos recentes, autoavaliação e status de validação.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Traçar progresso</span>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhum registro encontrado. Comece clicando em “Novo registro” para documentar seu caso.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <ProcedureLogCard
                  key={log.id}
                  log={log}
                  procedureName={proceduresMap.get(log.procedure_catalog_id ?? "")?.name}
                  surgeryName={surgeriesMap.get(log.surgery_catalog_id ?? "")?.procedure_name}
                  unitName={unitsMap.get(log.unit_id ?? "")?.name}
                  selfAssessment={assessments[index]}
                  validationStatus={validationMap.get(log.id)?.validation_status ?? null}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
