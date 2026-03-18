"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createProcedureLogAction } from "@/features/logbook/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "./confidence-badge";

import type {
  InstitutionUnit,
  ProcedureCatalog,
  ProcedureSuccessStatus,
  PerceivedDifficulty,
  ReadinessLevel,
  SurgeryCatalog,
  TraineeRoleInCase
} from "@/types/database";
import type { InstitutionReviewerSummary } from "@/services/db/modules";

const difficultyOptions: PerceivedDifficulty[] = ["low", "medium", "high"];
const successStatuses: ProcedureSuccessStatus[] = ["successful", "partial", "failed", "converted"];
const readinessOptions: ReadinessLevel[] = [
  "not_ready",
  "ready_with_close_supervision",
  "ready_with_standard_supervision",
  "confident_under_indirect_supervision"
];
const traineeRoles: { value: TraineeRoleInCase; label: string }[] = [
  { value: "observed", label: "Observado" },
  { value: "assisted", label: "Assistiu" },
  { value: "performed_supervised", label: "Executou com supervisão" },
  { value: "performed_with_relative_autonomy", label: "Executou com autonomia relativa" }
];

const readinessLabels: Record<ReadinessLevel, string> = {
  not_ready: "Ainda não pronto",
  ready_with_close_supervision: "Pronto com supervisão próxima",
  ready_with_standard_supervision: "Pronto com supervisão padrão",
  confident_under_indirect_supervision: "Confiante com supervisão indireta"
};

interface ProcedureLogFormProps {
  procedures: ProcedureCatalog[];
  surgeries: SurgeryCatalog[];
  units: InstitutionUnit[];
  reviewers: InstitutionReviewerSummary[];
}

export function ProcedureLogForm({ procedures, surgeries, units, reviewers }: ProcedureLogFormProps) {
  const router = useRouter();
  const [confidenceLevel, setConfidenceLevel] = useState(3);
  const [readinessLevel, setReadinessLevel] = useState<ReadinessLevel>("ready_with_close_supervision");
  const [state, formAction, isPending] = useActionState(createProcedureLogAction, {
    ok: false,
    message: ""
  });

  useEffect(() => {
    if (state.ok && state.logId) {
      router.push(`/logbook/${state.logId}`);
    }
  }, [router, state.logId, state.ok]);

  const confidenceBadgeProps = useMemo(
    () => ({
      level: confidenceLevel,
      readiness: readinessLevel
    }),
    [confidenceLevel, readinessLevel]
  );

  return (
    <Card className="space-y-6">
      <CardHeader>
        <CardTitle>Registrar procedimento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Documente o caso do dia, selecione o avaliador e registre sua percepção de confiança para alimentar o acompanhamento prático do CET.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Data do procedimento
              <input
                name="performed_on"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Unidade
              <select
                name="unit_id"
                required
                defaultValue={units[0]?.id ?? ""}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} {unit.city ? `· ${unit.city}` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Cirurgia
              <select
                name="surgery_catalog_id"
                required
                defaultValue={surgeries[0]?.id ?? ""}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {surgeries.map((surgery) => (
                  <option key={surgery.id} value={surgery.id}>
                    {surgery.procedure_name} · {surgery.specialty}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Técnica principal
              <select
                name="procedure_catalog_id"
                required
                defaultValue={procedures[0]?.id ?? ""}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {procedures.map((procedure) => (
                  <option key={procedure.id} value={procedure.id}>
                    {procedure.name} · {procedure.category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Papel do trainee
              <select
                name="trainee_role"
                required
                defaultValue={traineeRoles[0]?.value}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {traineeRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Preceptor avaliador
              <select
                name="reviewer_user_id"
                defaultValue={reviewers[0]?.id ?? ""}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                <option value="">Selecionar depois</option>
                {reviewers.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.full_name} · {reviewer.role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Dificuldade percebida
              <select
                name="difficulty_perceived"
                defaultValue="medium"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {difficultyOptions.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Resultado do caso
              <select
                name="success_status"
                defaultValue="successful"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {successStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Resumo da técnica anestésica
            <textarea
              name="anesthesia_technique_summary"
              required
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm"
              placeholder="Ex.: indução venosa, via aérea, monitorização e analgesia"
            />
          </label>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Perfil do paciente
            <textarea
              name="patient_profile_summary"
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm"
              placeholder="ASA, contexto clínico e fatores relevantes"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Complicações
              <textarea
                name="complications_summary"
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm"
                placeholder="Descreva complicações, intercorrências ou ausência delas"
              />
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Observações
              <textarea
                name="notes"
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm"
                placeholder="Observações para revisão futura"
              />
            </label>
          </div>

          <section className="space-y-3 rounded-[1.5rem] border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Autoavaliação</p>
                <p className="text-sm text-muted-foreground">Confiança, prontidão e reflexão logo após o procedimento.</p>
              </div>
              <ConfidenceBadge {...confidenceBadgeProps} />
            </div>

            <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Confiança no procedimento
              <input
                name="confidence_level"
                type="range"
                min="1"
                max="5"
                value={confidenceLevel}
                className="h-2 w-full accent-primary"
                onChange={(event) => setConfidenceLevel(Number(event.target.value))}
              />
            </label>

            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Nível de prontidão
              <select
                name="readiness_level"
                value={readinessLevel}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                onChange={(event) => setReadinessLevel(event.target.value as ReadinessLevel)}
              >
                {readinessOptions.map((option) => (
                  <option key={option} value={option}>
                    {readinessLabels[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Reflexão breve
              <textarea
                name="reflection_text"
                className="w-full rounded-2xl border border-border px-4 py-3 text-sm"
                placeholder="O que você repetiria, corrigiria ou revisaria neste caso?"
              />
            </label>
          </section>

          {state.message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar no logbook"}
            </Button>
            <span className="text-xs text-muted-foreground">
              O caso ficará vinculado ao trainee autenticado e ao tenant atual.
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
