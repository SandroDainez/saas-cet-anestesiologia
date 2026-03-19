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
    "w-full rounded-[1.25rem] border px-4 py-4 text-left transition",
    isSelected ? "border-primary bg-primary/5" : "border-border/60 bg-background",
    showFeedback && isCorrect ? "border-emerald-300 bg-emerald-50" : ""
  );

  return (
    <button type="button" className={borderClass} onClick={onSelect}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-xs font-semibold text-foreground">
            {option.option_label}
          </span>
          <span className="text-sm font-semibold text-foreground">Alternativa {option.option_label}</span>
        </div>
        {showFeedback && isSelected ? (
          isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-500" />
          )
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-foreground/88">{option.option_text}</p>
      {showFeedback && isSelected && option.explanation ? (
        <p className="mt-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs leading-5 text-muted-foreground">
          {option.explanation}
        </p>
      ) : null}
    </button>
  );
}
