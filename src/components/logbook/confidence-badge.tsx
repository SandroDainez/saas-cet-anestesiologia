"use client";

import { cn } from "@/lib/utils";

import type { ReadinessLevel } from "@/types/database";

const readinessLabels: Record<ReadinessLevel, string> = {
  not_ready: "Ainda não pronto para autonomia.",
  ready_with_close_supervision: "Pronto com supervisão próxima.",
  ready_with_standard_supervision: "Pronto com supervisão padrão.",
  confident_under_indirect_supervision: "Confiante com supervisão indireta."
};

interface ConfidenceBadgeProps {
  level: number;
  readiness?: ReadinessLevel;
}

export function ConfidenceBadge({ level, readiness }: ConfidenceBadgeProps) {
  return (
    <div className="space-y-1 rounded-2xl border border-border/70 bg-background/70 p-3 text-xs">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
        Confiança {level}/5
      </p>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-2.5 w-8 rounded-full transition",
              index < level ? "bg-primary" : "bg-border/60"
            )}
          />
        ))}
      </div>
      {readiness ? <p className="text-[11px] text-muted-foreground">{readinessLabels[readiness]}</p> : null}
    </div>
  );
}
