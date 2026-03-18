import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { ConfidenceBadge } from "./confidence-badge";

import type { ProcedureLog, ProcedureSelfAssessment, ProcedureSuccessStatus, PerceivedDifficulty, ValidationStatus } from "@/types/database";

const statusStyles: Record<ProcedureSuccessStatus, string> = {
  successful: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
  converted: "border-slate-200 bg-slate-50 text-slate-700"
};

const difficultyLabels: Record<PerceivedDifficulty, string> = {
  low: "Percepção baixa",
  medium: "Percepção média",
  high: "Percepção alta"
};

const roleLabels: Record<string, string> = {
  observed: "Observado",
  assisted: "Assistiu",
  performed_supervised: "Executou (supervisionado)",
  performed_with_relative_autonomy: "Executou com autonomia"
};

interface ProcedureLogCardProps {
  log: ProcedureLog;
  procedureName?: string;
  surgeryName?: string;
  unitName?: string;
  selfAssessment?: ProcedureSelfAssessment | null;
  validationStatus?: ValidationStatus | null;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR", { dateStyle: "short" });

export function ProcedureLogCard({ log, procedureName, surgeryName, unitName, selfAssessment, validationStatus }: ProcedureLogCardProps) {
  return (
    <Card className="space-y-4">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-muted/70 text-muted-foreground">
            {formatDate(log.performed_on)}
          </Badge>
          <span className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            {roleLabels[log.trainee_role] ?? "Papel do trainee"}
          </span>
          <span className={cn("rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.4em]", statusStyles[log.success_status])}>
            {log.success_status.toUpperCase()}
          </span>
        </div>
        <CardTitle>{procedureName ?? "Procedimento"}</CardTitle>
        <p className="text-sm text-muted-foreground">{surgeryName ?? "Cirurgia não definida"}</p>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Unidade · {unitName ?? "Não informado"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-secondary/10 text-secondary-foreground">
            {difficultyLabels[log.difficulty_perceived ?? "medium"]}
          </Badge>
          {validationStatus ? (
            <Badge className="bg-muted/70 text-muted-foreground">
              Validação {validationStatus.replaceAll("_", " ")}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{log.anesthesia_technique_summary ?? "Técnica não registrada."}</p>
        {selfAssessment ? (
          <ConfidenceBadge level={selfAssessment.confidence_level} readiness={selfAssessment.readiness_level} />
        ) : null}
        <div className="flex items-center justify-between">
          <Link href={`/logbook/${log.id}`}>
            <Button variant="outline" size="sm">
              Ver detalhes
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">{log.complications_summary ?? "Sem complicações relatadas."}</p>
        </div>
      </CardContent>
    </Card>
  );
}
