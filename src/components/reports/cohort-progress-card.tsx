import type { CohortProgressSummary } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CohortProgressCard({
  year,
  traineeCount,
  expectedPercent,
  lessonProgressPercent,
  moduleProgressPercent,
  clinicalMaturityPercent,
  recentActivityCount
}: CohortProgressSummary) {
  return (
    <Card className="border border-border/60 bg-card/90">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">{year}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {traineeCount} trainees · esperado {expectedPercent}%
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <ProgressRow label="Lições" value={`${lessonProgressPercent}%`} />
        <ProgressRow label="Módulos" value={`${moduleProgressPercent}%`} />
        <ProgressRow label="Maturidade clínica" value={`${clinicalMaturityPercent}%`} />
        <ProgressRow label="Atividade recente" value={`${recentActivityCount} trainees`} />
      </CardContent>
    </Card>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
