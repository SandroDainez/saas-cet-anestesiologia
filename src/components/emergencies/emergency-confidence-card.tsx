import type { EmergencySelfAssessment } from "@/types/database";

interface EmergencyConfidenceCardProps {
  assessment: EmergencySelfAssessment;
}

export function EmergencyConfidenceCard({ assessment }: EmergencyConfidenceCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4 space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tentativa {assessment.scenario_id}</p>
      <p className="text-sm font-semibold">
        Confiança antes: {assessment.confidence_before ?? "-"} · depois: {assessment.confidence_after ?? "-"}
      </p>
      <p className="text-xs text-muted-foreground">Prontidão percebida: {assessment.perceived_readiness ?? "Não informado"}</p>
      {assessment.reflection_text ? <p className="text-xs text-muted-foreground">{assessment.reflection_text}</p> : null}
    </article>
  );
}
