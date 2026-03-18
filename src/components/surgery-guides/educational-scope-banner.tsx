import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const contextLabels: Record<string, string> = {
  elective: "Eletiva",
  urgent: "Urgente",
  ambulatory: "Ambulatório",
  inpatient: "Internação"
};

const patientLabels: Record<string, string> = {
  adult: "Adulto",
  obstetric: "Obstétrica",
  pediatric: "Pediátrica"
};

interface EducationalScopeBannerProps {
  notice?: string | null;
  contexts: string[];
  patientTypes: string[];
  status: string;
  lastReviewed?: string | null;
  suggestedYears: string[];
}

export function EducationalScopeBanner({
  notice,
  contexts,
  patientTypes,
  status,
  lastReviewed,
  suggestedYears
}: EducationalScopeBannerProps) {
  return (
    <Card className="space-y-3 border border-amber-400/70 bg-amber-50/60">
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Badge>Conteúdo educacional</Badge>
            <span>Suporte ao raciocínio anestésico · não substitui protocolo local</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Status: {status}</span>
            <span>Última revisão: {lastReviewed ?? "n/a"}</span>
          </div>
        </div>
        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {contexts.map((context) => (
            <span key={context} className="rounded-full border border-border/60 px-3 py-1">
              {contextLabels[context] ?? context}
            </span>
          ))}
          {patientTypes.map((type) => (
            <span key={type} className="rounded-full border border-border/60 px-3 py-1">
              {patientLabels[type] ?? type}
            </span>
          ))}
          {suggestedYears.map((year) => (
            <span key={year} className="rounded-full border border-border/60 px-3 py-1">
              {year}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
