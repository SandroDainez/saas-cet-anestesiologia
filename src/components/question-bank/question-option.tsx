"use client";

import { cn } from "@/lib/utils";

import { CheckCircle2, XCircle } from "lucide-react";

import type { QuestionOption } from "@/types/database";

interface QuestionOptionProps {
  option: QuestionOption;
  isSelected: boolean;
  showFeedback: boolean;
  onSelect: () => void;
}

export function QuestionOption({ option, isSelected, showFeedback, onSelect }: QuestionOptionProps) {
  const isCorrect = option.is_correct;
  const borderClass = cn(
    "w-full rounded-2xl border px-4 py-3 text-left transition",
    isSelected ? "border-primary bg-primary/5" : "border-border/60 bg-background",
    showFeedback && isCorrect ? "border-emerald-300 bg-emerald-50" : ""
  );

  return (
    <button type="button" className={borderClass} onClick={onSelect}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {option.option_label ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
              {option.option_label}
            </span>
          ) : null}
          <span className="text-sm font-semibold text-foreground">alternativa</span>
        </div>
        {showFeedback && isSelected ? (
          isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-500" />
          )
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{option.option_text}</p>
      {showFeedback && isSelected && option.explanation ? (
        <p className="mt-2 text-xs text-muted-foreground">{option.explanation}</p>
      ) : null}
    </button>
  );
}
