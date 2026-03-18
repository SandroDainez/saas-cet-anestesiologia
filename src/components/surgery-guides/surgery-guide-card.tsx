import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SurgeryGuideSummary } from "@/types/database";

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

export function SurgeryGuideCard({ summary }: { summary: SurgeryGuideSummary }) {
  const { guide, surgery, contexts, patientTypes, suggestedYears } = summary;

  return (
    <Card className="space-y-3">
      <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="text-xs uppercase tracking-[0.3em]">
              {guide.status}
            </Badge>
          <span className="text-xs text-muted-foreground">
            {surgery.specialty} · {surgery.complexity_level}
          </span>
        </div>
        <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{surgery.procedure_name}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{guide.summary}</p>
        <div className="flex flex-wrap gap-2">
          {contexts.map((context) => (
            <Badge key={context} className="text-xs uppercase">
              {contextLabels[context] ?? context}
            </Badge>
          ))}
          {patientTypes.map((type) => (
            <Badge key={type} className="text-xs uppercase">
              {patientLabels[type] ?? type}
            </Badge>
          ))}
          {suggestedYears.map((year) => (
            <Badge key={year} className="text-xs uppercase">
              {year}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {guide.checklist_jsonb.metadata?.confidence_level
              ? `Confiança ${guide.checklist_jsonb.metadata.confidence_level}`
              : "Confiança editorial pendente"}
          </div>
          <Link href={`/surgery-guides/${guide.id}`}>
            <Button variant="outline" size="sm">
              Abrir guia
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
