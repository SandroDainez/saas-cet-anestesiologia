import type { TraineeSnapshot } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatOptionalPercent(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function formatGap(value: number) {
  const rounded = Math.round(value);
  if (rounded === 0) {
    return "0 pp";
  }

  return `${rounded > 0 ? "+" : ""}${rounded} pp`;
}

export function TraineeSnapshotCard({
  traineeName,
  trainingYear,
  lessonProgressPercent,
  moduleProgressPercent,
  theoreticalGapPercent,
  clinicalMaturityPercent,
  recentQuestionAccuracy,
  recentExamAverage,
  recentProcedures,
  recentEmergencies,
  pendingValidations,
  openNotebookItems
}: TraineeSnapshot) {
  return (
    <Card className="border border-border/60 bg-card/90">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">{traineeName}</CardTitle>
        <p className="text-xs text-muted-foreground">{trainingYear}</p>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>Lições: {lessonProgressPercent}%</p>
        <p>Módulos: {moduleProgressPercent}%</p>
        <p>Gap teórico: {formatGap(theoreticalGapPercent)}</p>
        <p>Maturidade clínica: {clinicalMaturityPercent}%</p>
        <p>Questões recentes: {formatOptionalPercent(recentQuestionAccuracy)}</p>
        <p>Provas recentes: {formatOptionalPercent(recentExamAverage)}</p>
        <p>Procedimentos/Emergências: {recentProcedures}/{recentEmergencies}</p>
        <p>Validações pendentes: {pendingValidations}</p>
        <p>Caderno de erros aberto: {openNotebookItems}</p>
      </CardContent>
    </Card>
  );
}
