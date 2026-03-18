"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { submitQuestionPracticeAction } from "@/features/education/actions";
import { cn } from "@/lib/utils";

import { DifficultyBadge } from "./difficulty-badge";
import { QuestionExplanation } from "./question-explanation";
import { QuestionOption } from "./question-option";

import type {
  QuestionBankEntry,
  QuestionOption as QuestionOptionType,
  QuestionReference,
  QuestionTag,
  TraineeYearCode
} from "@/types/database";

interface QuestionResolverProps {
  question: QuestionBankEntry;
  options: QuestionOptionType[];
  references?: QuestionReference[];
  tags?: QuestionTag[];
  yearCode?: TraineeYearCode;
}

export function QuestionResolver({ question, options, references = [], tags = [], yearCode }: QuestionResolverProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [state, formAction, isPending] = useActionState(submitQuestionPracticeAction, {
    ok: false,
    message: ""
  });

  const selectedOption = useMemo(() => options.find((option) => option.id === selectedOptionId), [
    options,
    selectedOptionId
  ]);

  useEffect(() => {
    if ("selectedOptionId" in state && state.selectedOptionId) {
      setSelectedOptionId(state.selectedOptionId);
    }
  }, [state]);

  const showFeedback = Boolean(state?.ok && selectedOptionId && "selectedOptionId" in state);
  const feedbackMessage = showFeedback
    ? "isCorrect" in state && state.isCorrect
      ? "Resposta correta! Revise o raciocínio para consolidar o aprendizado."
      : "Resposta incorreta. Leia a explicação e tente novamente."
    : null;

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold tracking-[0.4em] text-muted-foreground">
          {yearCode ? (
            <Badge className="bg-background/70 text-muted-foreground">{yearCode}</Badge>
          ) : null}
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <h1 className="text-2xl font-semibold">{question.title ?? "Questão"}</h1>
        <p className="text-sm text-muted-foreground">{question.stem}</p>
        {question.educational_goal ? (
          <p className="text-xs text-muted-foreground">Objetivo: {question.educational_goal}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge key={tag.id} className="bg-secondary/20 text-secondary-foreground">
              {tag.name}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold">Alternativas</CardTitle>
          <Link href="/question-bank">
            <Button variant="outline" size="sm">
              Voltar ao banco
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="question_id" value={question.id} />
            <input
              type="hidden"
              name="selected_option_id"
              value={selectedOptionId ?? ""}
            />
            <input
              type="hidden"
              name="response_time_seconds"
              value={Math.max(1, Math.round((Date.now() - startedAt) / 1000))}
            />
            {options.map((option) => (
              <QuestionOption
                key={option.id}
                option={option}
                isSelected={selectedOptionId === option.id}
                showFeedback={showFeedback}
                onSelect={() => setSelectedOptionId(option.id)}
              />
            ))}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={!selectedOptionId || isPending}>
                {isPending ? "Enviando..." : "Responder questão"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setSelectedOptionId(null)} disabled={isPending}>
                Limpar seleção
              </Button>
            </div>
          </form>
        </div>
        {feedbackMessage ? (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide transition",
              "isCorrect" in state && state.isCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-rose-300 bg-rose-50 text-rose-700"
            )}
          >
            {feedbackMessage}
          </div>
        ) : null}
        {state?.ok && "feedback" in state && state.feedback ? (
          <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
            {state.feedback}
          </div>
        ) : null}
      </section>

      <QuestionExplanation
        rationale={("rationale" in state ? state.rationale : undefined) ?? question.rationale}
        references={references}
      />
    </div>
  );
}
