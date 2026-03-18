import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcedureLogCard } from "@/components/logbook/procedure-log-card";
import { ProcedureValidationCard } from "@/components/logbook/procedure-validation-card";
import { getScopeFromRole } from "@/lib/auth/profile";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchInstitutionUnits, fetchProcedureCatalogEntries, fetchProcedureLogById, fetchProcedureLogItems, fetchProcedureSelfAssessment, fetchProcedureValidations, fetchSurgeryCatalogEntries } from "@/services/db/modules";

export const metadata = {
  title: "Detalhe do log"
};

interface LogbookDetailPageProps {
  params: Promise<{
    logId: string;
  }>;
}

export default async function LogbookDetailPage({ params }: LogbookDetailPageProps) {
  const profile = await requireModuleAccess("logbook", { onDenied: "notFound" });
  const scope = getScopeFromRole(profile.role);
  const { logId } = await params;
  const log = await fetchProcedureLogById(logId, {
    traineeId: scope === "trainee" ? profile.id : undefined,
    institutionId: profile.institution_id
  });
  if (!log) {
    notFound();
  }

  const [procedures, surgeries, units, items, selfAssessment, validations] = await Promise.all([
    fetchProcedureCatalogEntries(),
    fetchSurgeryCatalogEntries(),
    fetchInstitutionUnits(profile.institution_id),
    fetchProcedureLogItems(log.id),
    fetchProcedureSelfAssessment(log.id),
    fetchProcedureValidations(undefined, { procedureLogIds: [log.id] })
  ]);

  const procedureName = procedures.find((proc) => proc.id === log.procedure_catalog_id)?.name;
  const surgeryName = surgeries.find((surgery) => surgery.id === log.surgery_catalog_id)?.procedure_name;
  const unitName = units.find((unit) => unit.id === log.unit_id)?.name;

  const relevantValidations = validations.filter((validation) => validation.procedure_log_id === log.id);

  const itemsWithNames = items.map((item) => ({
    ...item,
    procedureName: procedures.find((proc) => proc.id === item.procedure_catalog_id)?.name
  }));

  const selfAssessmentSummary = selfAssessment
    ? selfAssessment
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <Badge>Logbook</Badge>
          <h1 className="text-3xl font-semibold">Detalhe do registro</h1>
          <p className="text-sm text-muted-foreground">
            Revise o caso com a equipe, confira os itens e aprove ou solicite revisões quando necessário.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/logbook">
              <Button variant="outline" size="sm">
                Voltar ao logbook
              </Button>
            </Link>
            {scope !== "trainee" ? (
              <Link href="/logbook/validations">
                <Button variant="ghost" size="sm">
                  Validar registros
                </Button>
              </Link>
            ) : null}
          </div>
        </header>

        <ProcedureLogCard
          log={log}
          procedureName={procedureName}
          surgeryName={surgeryName}
          unitName={unitName}
          selfAssessment={selfAssessmentSummary}
        />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Itens do procedimento</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Catálogo SBA</span>
          </div>
          {itemsWithNames.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhum item adicional registrado.
            </div>
          ) : (
            <div className="space-y-3">
              {itemsWithNames.map((item) => (
                <Card key={item.id} className="space-y-2">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{item.procedureName ?? "Procedimento extra"}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                    <p className="text-sm text-muted-foreground">Status: {item.success_status}</p>
                    {item.notes ? <p className="text-xs text-muted-foreground">Notas: {item.notes}</p> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Validações</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Preceptor</span>
          </div>
          {relevantValidations.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhuma validação pendente para este caso.
            </div>
          ) : (
            <div className="space-y-4">
              {relevantValidations.map((validation) => (
                <ProcedureValidationCard
                  key={validation.id}
                  validation={validation}
                  log={log}
                  procedureName={procedureName}
                  unitName={unitName}
                  selfAssessment={selfAssessmentSummary}
                  editable={scope !== "trainee"}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
