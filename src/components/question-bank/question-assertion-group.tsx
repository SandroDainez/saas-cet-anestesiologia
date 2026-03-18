"use client";

import { cn } from "@/lib/utils";

import type { QuestionAssertion } from "@/types/database";

interface QuestionAssertionGroupProps {
  assertions: QuestionAssertion[];
  selectedAssertions: Record<string, boolean | null>;
  showFeedback: boolean;
  onSelect: (assertionId: string, value: boolean) => void;
}

export function QuestionAssertionGroup({
  assertions,
  selectedAssertions,
  showFeedback,
  onSelect
}: QuestionAssertionGroupProps) {
  return (
    <div className="space-y-3">
      {assertions.map((assertion, index) => {
        const selectedValue = selectedAssertions[assertion.id] ?? null;
        const isAnswered = selectedValue !== null;
        const isCorrect = selectedValue === assertion.is_true;

        return (
          <div
            key={assertion.id}
            className={cn(
              "rounded-2xl border px-4 py-4 transition",
              !showFeedback && isAnswered ? "border-primary bg-primary/5" : "border-border/60 bg-background",
              showFeedback && isCorrect ? "border-emerald-300 bg-emerald-50" : "",
              showFeedback && isAnswered && !isCorrect ? "border-rose-300 bg-rose-50" : ""
            )}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                  Assertiva {index + 1}
                </p>
                <p className="text-sm text-foreground">{assertion.assertion_text}</p>
              </div>
              <div className="flex gap-2">
                {[
                  { label: "V", value: true },
                  { label: "F", value: false }
                ].map((choice) => (
                  <button
                    key={choice.label}
                    type="button"
                    className={cn(
                      "min-w-12 rounded-xl border px-4 py-2 text-sm font-semibold transition",
                      selectedValue === choice.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/70 bg-background text-muted-foreground"
                    )}
                    onClick={() => onSelect(assertion.id, choice.value)}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>
            {showFeedback ? (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>
                  Gabarito: <span className="font-semibold text-foreground">{assertion.is_true ? "Verdadeiro" : "Falso"}</span>
                </p>
                {assertion.explanation ? <p>{assertion.explanation}</p> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
