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
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>Lições: {lessonProgressPercent}%</p>
        <p>Módulos: {moduleProgressPercent}%</p>
        <p>Maturidade clínica: {clinicalMaturityPercent}%</p>
        <p>Atividade recente: {recentActivityCount} trainees</p>
      </CardContent>
    </Card>
  );
}
