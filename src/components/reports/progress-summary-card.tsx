import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProgressSummaryCard({
  title,
  detail,
  progressPercent
}: {
  title: string;
  detail: string;
  progressPercent?: number;
}) {
  return (
    <Card className="space-y-2 border border-border/60">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>{detail}</p>
        {progressPercent !== undefined ? (
          <p className="text-xs">Progresso: {progressPercent}%</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
