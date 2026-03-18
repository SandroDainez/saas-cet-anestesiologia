import { Card, CardContent } from "@/components/ui/card";

export function ProcedureStatsCard({
  title,
  value,
  trend
}: {
  title: string;
  value: string;
  trend?: string;
}) {
  return (
    <Card className="space-y-2 border border-border/60 bg-card/80">
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {trend ? <p className="text-xs uppercase tracking-[0.3em]">{trend}</p> : null}
      </CardContent>
    </Card>
  );
}
