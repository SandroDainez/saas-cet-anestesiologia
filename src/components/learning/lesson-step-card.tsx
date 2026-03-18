import type { LessonStep } from "@/types/database";

export function LessonStepCard({ step }: { step: LessonStep }) {
  const checklist = Array.isArray(step.structured_payload?.checklist)
    ? (step.structured_payload.checklist as string[])
    : [];
  const options = Array.isArray(step.structured_payload?.options)
    ? (step.structured_payload.options as string[])
    : [];

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{step.step_type}</p>
      {step.title ? <p className="text-lg font-semibold">{step.title}</p> : null}
      <p className="text-sm text-muted-foreground">{step.body_markdown ?? "Conteúdo em produção"}</p>
      {options.length ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Pontos para decidir</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {options.map((option) => (
              <li key={option} className="rounded-xl border border-border/60 bg-background/70 px-3 py-2">
                {option}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {checklist.length ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Checklist</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {checklist.map((item) => (
              <li key={item} className="rounded-xl border border-border/60 bg-background/70 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
