import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card className="space-y-2 border border-border/60 bg-card/90">
      <CardHeader className="space-y-1 px-4 py-3">
        <CardTitle className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</CardTitle>
        <p className="text-3xl font-semibold">{value}</p>
      </CardHeader>
      {helper ? (
        <CardContent className="px-4 py-2 text-xs text-muted-foreground">{helper}</CardContent>
      ) : null}
    </Card>
  );
}
