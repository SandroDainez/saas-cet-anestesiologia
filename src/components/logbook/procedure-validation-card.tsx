"use client";

import { useActionState } from "react";

import { reviewProcedureValidationAction } from "@/features/logbook/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "./confidence-badge";

import type {
  ProcedureLog,
  ProcedureValidation,
  ProcedureSelfAssessment,
  ProcedurePerformanceLevel,
  ValidationStatus
} from "@/types/database";

const statusColors: Record<ValidationStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  needs_revision: "border-slate-200 bg-slate-50 text-slate-700"
};

const performanceLabels: Record<ProcedurePerformanceLevel, string> = {
  needs_direct_supervision: "Necessita supervisão direta",
  performed_with_significant_help: "Executou com ajuda importante",
  performed_with_minor_corrections: "Executou com pequenas correções",
  performed_safely: "Executou com segurança"
};

interface ProcedureValidationCardProps {
  validation: ProcedureValidation;
  log: ProcedureLog;
  procedureName?: string;
  unitName?: string;
  selfAssessment?: ProcedureSelfAssessment | null;
  traineeName?: string;
  editable?: boolean;
}

export function ProcedureValidationCard({
  validation,
  log,
  procedureName,
  unitName,
  selfAssessment,
  traineeName,
  editable = true
}: ProcedureValidationCardProps) {
  const [state, formAction, isPending] = useActionState(reviewProcedureValidationAction, {
    ok: false,
    message: ""
  });

  return (
    <Card className="space-y-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{procedureName ?? "Procedimento pendente"}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {traineeName ? `${traineeName} · ` : ""}
              {unitName ?? "Unidade indefinida"} · {new Date(log.performed_on).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Badge className={statusColors[validation.validation_status]}>
            {validation.validation_status.replaceAll("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{log.anesthesia_technique_summary}</p>
            {log.notes ? <p className="text-sm text-muted-foreground">Observações: {log.notes}</p> : null}
            {log.complications_summary ? (
              <p className="text-sm text-muted-foreground">Complicações: {log.complications_summary}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Autoavaliação</p>
            {selfAssessment ? (
              <div className="mt-2 space-y-2">
                <ConfidenceBadge level={selfAssessment.confidence_level} readiness={selfAssessment.readiness_level} />
                {selfAssessment.reflection_text ? (
                  <p className="text-xs text-muted-foreground">{selfAssessment.reflection_text}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Sem autoavaliação registrada.</p>
            )}
          </div>
        </div>

        {editable ? (
        <form action={formAction} className="space-y-3 rounded-2xl border border-border/70 bg-background p-4">
          <input type="hidden" name="validation_id" value={validation.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Decisão
              <select
                name="validation_status"
                defaultValue={validation.validation_status}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                <option value="approved">Aprovar</option>
                <option value="needs_revision">Solicitar revisão</option>
                <option value="rejected">Rejeitar</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Nível de desempenho
              <select
                name="performance_level"
                defaultValue={validation.performance_level ?? "performed_with_minor_corrections"}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {Object.entries(performanceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Feedback
            <textarea
              name="feedback"
              defaultValue={validation.feedback ?? ""}
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm"
              placeholder="Oriente o trainee sobre técnica, decisão e próximos passos."
            />
          </label>

          {state.message ? (
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${
                state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar validação"}
            </Button>
            {validation.feedback ? <p className="text-xs text-muted-foreground">Último feedback mantido no histórico.</p> : null}
          </div>
        </form>
        ) : (
          <div className="space-y-2 rounded-2xl border border-border/70 bg-background p-4">
            <p className="text-sm font-medium">
              {validation.performance_level ? performanceLabels[validation.performance_level] : "Desempenho ainda não classificado"}
            </p>
            <p className="text-sm text-muted-foreground">
              {validation.feedback ?? "Aguardando feedback do preceptor."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
