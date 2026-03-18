import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProcedureValidationCard } from "@/components/logbook/procedure-validation-card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchInstitutionUnits, fetchProcedureCatalogEntries, fetchProcedureLogById, fetchProcedureSelfAssessment, fetchProcedureValidations, fetchUserProfileSummaries } from "@/services/db/modules";

export const metadata = {
  title: "Validações"
};

export default async function LogbookValidationsPage() {
  const profile = await requireModuleAccess("logbook-review");
  const validations = await fetchProcedureValidations("pending", {
    validatorUserId: profile.role === "preceptor" ? profile.id : undefined
  });
  const [procedures, units, logs, selfAssessments] = await Promise.all([
    fetchProcedureCatalogEntries(),
    fetchInstitutionUnits(profile.institution_id),
    Promise.all(
      validations.map((validation) =>
        fetchProcedureLogById(validation.procedure_log_id, { institutionId: profile.institution_id })
      )
    ),
    Promise.all(validations.map((validation) => fetchProcedureSelfAssessment(validation.procedure_log_id)))
  ]);

  const filteredValidations = validations
    .map((validation, index) => ({ validation, log: logs[index], selfAssessment: selfAssessments[index] }))
    .filter((item) => item.log);

  const procedureMap = new Map(procedures.map((procedure) => [procedure.id, procedure]));
  const unitMap = new Map(units.map((unit) => [unit.id, unit]));
  const traineeMap = await fetchUserProfileSummaries(
    filteredValidations.map((item) => item.log!.trainee_user_id)
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <Badge>Preceptor</Badge>
          <h1 className="text-3xl font-semibold">Validações pendentes</h1>
          <p className="text-sm text-muted-foreground">
            Analise os registros enviados pelos trainees, deixe feedback e aprove ou solicite revisão.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/logbook">
              <Button variant="outline" size="sm">
                Ver logbook
              </Button>
            </Link>
            <Link href="/logbook/validations">
              <Button variant="ghost" size="sm">
                Atualizar
              </Button>
            </Link>
          </div>
        </header>

        {filteredValidations.length === 0 ? (
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
            Nenhum registro aguardando validação.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredValidations.map(({ validation, log, selfAssessment }) => (
              <ProcedureValidationCard
                key={validation.id}
                validation={validation}
                log={log!}
                procedureName={procedureMap.get(log!.procedure_catalog_id ?? "")?.name}
                unitName={unitMap.get(log!.unit_id ?? "")?.name}
                selfAssessment={selfAssessment ?? null}
                traineeName={traineeMap.get(log!.trainee_user_id)?.full_name}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
