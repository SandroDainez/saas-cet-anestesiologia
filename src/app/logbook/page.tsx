import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProcedureLogCard } from "@/components/logbook/procedure-log-card";
import { LogbookStatsCard } from "@/components/logbook/logbook-stats-card";
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
        <header className="space-y-2">
          <Badge>Logbook</Badge>
          <h1 className="text-3xl font-semibold">Procedimentos registrados</h1>
          <p className="text-sm text-muted-foreground">
            Registre seus procedimentos, confira validações feitas pelos preceptores e acompanhe o progresso de cada caso.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/logbook/new">
              <Button>Novo registro</Button>
            </Link>
            <Link href="/logbook/stats">
              <Button variant="ghost">Ver estatísticas</Button>
            </Link>
            {scope !== "trainee" ? (
              <Link href="/logbook/validations">
                <Button variant="outline">Validações pendentes</Button>
              </Link>
            ) : null}
          </div>
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Últimos registros</h2>
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
