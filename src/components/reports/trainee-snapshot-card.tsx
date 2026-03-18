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
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <SnapshotRow label="Lições" value={`${lessonProgressPercent}%`} />
        <SnapshotRow label="Módulos" value={`${moduleProgressPercent}%`} />
        <SnapshotRow label="Gap teórico" value={formatGap(theoreticalGapPercent)} />
        <SnapshotRow label="Maturidade clínica" value={`${clinicalMaturityPercent}%`} />
        <SnapshotRow label="Questões recentes" value={formatOptionalPercent(recentQuestionAccuracy)} />
        <SnapshotRow label="Provas recentes" value={formatOptionalPercent(recentExamAverage)} />
        <SnapshotRow label="Procedimentos/Emergências" value={`${recentProcedures}/${recentEmergencies}`} />
        <SnapshotRow label="Validações pendentes" value={`${pendingValidations}`} />
        <SnapshotRow label="Caderno de erros aberto" value={`${openNotebookItems}`} />
      </CardContent>
    </Card>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
