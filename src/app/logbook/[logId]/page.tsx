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
  const validationStatus = relevantValidations.length === 0 ? "Sem pendências" : `${relevantValidations.length} em revisão`;

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Logbook</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Detalhe do registro</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Revise o caso, confira itens adicionais, autoavaliação e validações ligadas a este procedimento.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <DetailMetric label="Procedimento" value={procedureName ?? "Não identificado"} />
                <DetailMetric label="Unidade" value={unitName ?? "Sem unidade"} />
                <DetailMetric label="Validação" value={validationStatus} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
              <Link href="/logbook">
                <Button variant="outline" size="sm">
                  Voltar ao logbook
                </Button>
              </Link>
              {scope !== "trainee" ? (
                <Link href="/logbook/validations">
                  <Button variant="secondary" size="sm">
                    Abrir fila de validação
                  </Button>
                </Link>
              ) : (
                <Link href="/logbook/new">
                  <Button size="sm">Novo registro</Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        <ProcedureLogCard
          log={log}
          procedureName={procedureName}
          surgeryName={surgeryName}
          unitName={unitName}
          selfAssessment={selfAssessmentSummary}
        />

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Fluxo sugerido para este caso</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use esta sequência para revisar o registro sem perder contexto clínico.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <ActionStep
                label="1. Revisar registro"
                description="Confira procedimento, cirurgia, unidade e dificuldade relatada."
              />
              <ActionStep
                label="2. Conferir itens"
                description="Valide procedimentos adicionais e notas vinculadas ao caso."
              />
              <ActionStep
                label={scope === "trainee" ? "3. Acompanhar validação" : "3. Validar caso"}
                description={
                  scope === "trainee"
                    ? "Veja pendências do preceptor e acompanhe o feedback."
                    : "Registre feedback, aprove ou solicite revisão."
                }
              />
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Status rápido</CardTitle>
              <p className="text-sm text-muted-foreground">Resumo operacional deste log.</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <StatusRow label="Itens adicionais" value={String(itemsWithNames.length)} />
              <StatusRow label="Autoavaliação" value={selfAssessmentSummary ? "Registrada" : "Pendente"} />
              <StatusRow label="Cirurgia vinculada" value={surgeryName ?? "Não informada"} />
            </CardContent>
          </Card>
        </section>

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

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ActionStep({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
