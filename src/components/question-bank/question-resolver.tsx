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
import { QuestionAssertionGroup } from "./question-assertion-group";
import { QuestionOption } from "./question-option";

import type {
  QuestionAssertion,
  QuestionBankEntry,
  QuestionOption as QuestionOptionType,
  QuestionReference,
  QuestionTag,
  TraineeYearCode,
  LocalLibraryExtractionPreview
} from "@/types/database";

interface QuestionResolverProps {
  question: QuestionBankEntry;
  options: QuestionOptionType[];
  assertions?: QuestionAssertion[];
  references?: QuestionReference[];
  tags?: QuestionTag[];
  yearCode?: TraineeYearCode;
  localHighlights?: LocalLibraryExtractionPreview[];
}

export function QuestionResolver({
  question,
  options,
  assertions = [],
  references = [],
  tags = [],
  yearCode,
  localHighlights = []
}: QuestionResolverProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedAssertions, setSelectedAssertions] = useState<Record<string, boolean | null>>({});
  const [startedAt] = useState(() => Date.now());
  const [state, formAction, isPending] = useActionState(submitQuestionPracticeAction, {
    ok: false,
    message: ""
  });
  const isSbaTrueFalse = question.question_type === "sba_true_false";

  const selectedOption = useMemo(() => options.find((option) => option.id === selectedOptionId), [
    options,
    selectedOptionId
  ]);

  useEffect(() => {
    if ("selectedOptionId" in state && state.selectedOptionId) {
      setSelectedOptionId(state.selectedOptionId);
    }
  }, [state]);

  useEffect(() => {
    if ("selectedAssertions" in state && state.selectedAssertions) {
      setSelectedAssertions(state.selectedAssertions as Record<string, boolean | null>);
    }
  }, [state]);

  const answeredAssertionsCount = useMemo(
    () => Object.values(selectedAssertions).filter((value) => value !== null).length,
    [selectedAssertions]
  );
  const showFeedback = Boolean(
    state?.ok && (isSbaTrueFalse ? answeredAssertionsCount > 0 : selectedOptionId) && ("selectedOptionId" in state || "selectedAssertions" in state)
  );
  const feedbackMessage = showFeedback
    ? "isCorrect" in state && state.isCorrect
      ? "Resposta correta! Revise o raciocínio para consolidar o aprendizado."
      : "Resposta incorreta. Leia a explicação e tente novamente."
    : null;

  const handleSelectAssertion = (assertionId: string, value: boolean) => {
    setSelectedAssertions((prev) => ({ ...prev, [assertionId]: value }));
  };

  const canSubmit = isSbaTrueFalse ? assertions.length > 0 && answeredAssertionsCount === assertions.length : Boolean(selectedOptionId);

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

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Fluxo de resolução</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ResolverStep title="1. Resolver" description="Selecione a resposta sem abrir racional antes." />
            <ResolverStep title="2. Confirmar" description="Envie a questão para registrar desempenho e tempo." />
            <ResolverStep title="3. Consolidar" description="Leia o feedback e as referências para fechar o aprendizado." />
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Leitura rápida</p>
          <div className="mt-4 space-y-3">
            <ResolverRow label="Ano" value={yearCode ?? "Não definido"} />
            <ResolverRow label="Formato" value={question.question_type.replaceAll("_", " ")} />
            <ResolverRow label="Referências" value={`${references.length}`} />
          </div>
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
            <input type="hidden" name="selected_assertions_json" value={JSON.stringify(selectedAssertions)} />
            <input
              type="hidden"
              name="response_time_seconds"
              value={Math.max(1, Math.round((Date.now() - startedAt) / 1000))}
            />
            {isSbaTrueFalse ? (
              <QuestionAssertionGroup
                assertions={assertions}
                selectedAssertions={selectedAssertions}
                showFeedback={showFeedback}
                onSelect={handleSelectAssertion}
              />
            ) : (
              options.map((option) => (
                <QuestionOption
                  key={option.id}
                  option={option}
                  isSelected={selectedOptionId === option.id}
                  showFeedback={showFeedback}
                  onSelect={() => setSelectedOptionId(option.id)}
                />
              ))
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={!canSubmit || isPending}>
                {isPending ? "Enviando..." : "Responder questão"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedOptionId(null);
                  setSelectedAssertions({});
                }}
                disabled={isPending}
              >
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
        localHighlights={localHighlights}
      />
    </div>
  );
}

function ResolverStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ResolverRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
