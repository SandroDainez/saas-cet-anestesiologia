import { cn } from "@/lib/utils";

import type { QuestionDifficulty } from "@/types/database";

const colorMap: Record<QuestionDifficulty, string> = {
  easy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  hard: "border-rose-200 bg-rose-50 text-rose-700"
};

const labelMap: Record<QuestionDifficulty, string> = {
  easy: "Fácil",
  medium: "Intermediária",
  hard: "Avançada"
};

interface DifficultyBadgeProps {
  difficulty: QuestionDifficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] transition",
        colorMap[difficulty]
      )}
    >
      {labelMap[difficulty]}
    </span>
  );
}
