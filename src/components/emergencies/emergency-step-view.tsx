import type { EmergencyScenarioStep } from "@/types/database";

interface EmergencyStepViewProps {
  step: EmergencyScenarioStep;
}

export function EmergencyStepView({ step }: EmergencyStepViewProps) {
  return (
    <article className="space-y-3 rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Etapa {step.step_order}</p>
      <h2 className="text-xl font-semibold">{step.prompt_text}</h2>
      <p className="text-sm text-muted-foreground">
        Esta etapa orienta a decisão baseada em condutas da SBA e deve respeitar a governança clínica.
      </p>
    </article>
  );
}
