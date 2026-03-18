import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmergencyCoverageItem } from "@/services/emergencies/emergency-coverage";

const severityLabel = {
  high: "Alta prioridade",
  critical: "Crítica"
} as const;

export function EmergencyCoverageCard({ title, focus, years, severity }: EmergencyCoverageItem) {
  return (
    <Card className="border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,249,255,0.88))]">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {severityLabel[severity]}
          </span>
          {years.map((year) => (
            <span key={year} className="rounded-full bg-secondary/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-foreground">
              {year}
            </span>
          ))}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{focus}</p>
      </CardContent>
    </Card>
  );
}
