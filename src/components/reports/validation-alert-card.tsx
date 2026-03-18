import { Card, CardContent } from "@/components/ui/card";

const severityColors: Record<"low" | "medium" | "high", string> = {
  low: "border-emerald-300/70 bg-emerald-50/60",
  medium: "border-amber-300/70 bg-amber-50/70",
  high: "border-rose-300/70 bg-rose-50/70"
};

export function ValidationAlertCard({
  label,
  detail,
  severity
}: {
  label: string;
  detail: string;
  severity: "low" | "medium" | "high";
}) {
  return (
    <Card className={`space-y-2 border ${severityColors[severity]}`}>
      <CardContent className="text-sm text-muted-foreground">
        <p className="text-base font-semibold uppercase tracking-[0.3em]">{label}</p>
        <p>{detail}</p>
      </CardContent>
    </Card>
  );
}
