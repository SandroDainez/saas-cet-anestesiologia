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
    <Card className="space-y-2 overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(242,248,255,0.86))]">
      <CardHeader className="space-y-2 px-4 py-4">
        <CardTitle className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{label}</CardTitle>
        <p className="text-3xl font-semibold text-foreground">{value}</p>
      </CardHeader>
      {helper ? (
        <CardContent className="border-t border-border/60 px-4 py-3 text-xs leading-5 text-muted-foreground">{helper}</CardContent>
      ) : null}
    </Card>
  );
}
