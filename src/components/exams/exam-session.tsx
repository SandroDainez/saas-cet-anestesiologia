"use client";

import { type FormEvent, useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { submitExamAttemptAction } from "@/features/education/actions";
import { cn } from "@/lib/utils";

import { QuestionAssertionGroup } from "@/components/question-bank/question-assertion-group";
import { QuestionOption } from "@/components/question-bank/question-option";

import type {
  Exam,
  QuestionAssertion,
  QuestionBankEntry,
  QuestionOption as QuestionOptionType
} from "@/types/database";

interface ExamSessionQuestion {
  question: QuestionBankEntry;
  options: QuestionOptionType[];
  assertions: QuestionAssertion[];
}

interface ExamSessionProps {
  exam: Exam;
  questions: ExamSessionQuestion[];
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

export function ExamSession({ exam, questions }: ExamSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedAssertions, setSelectedAssertions] = useState<Record<string, Record<string, boolean | null>>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration_minutes ? exam.duration_minutes * 60 : 900);
  const [state, formAction, isPending] = useActionState(submitExamAttemptAction, {
    ok: false,
    message: ""
  });

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const answeredCount = useMemo(
    () =>
      questions.filter((item) => {
        if (item.question.question_type === "sba_true_false") {
          const answered = selectedAssertions[item.question.id] ?? {};
          return item.assertions.length > 0 && item.assertions.every((assertion) => answered[assertion.id] !== null && answered[assertion.id] !== undefined);
        }

        return Boolean(selectedOptions[item.question.id]);
      }).length,
    [questions, selectedAssertions, selectedOptions]
  );

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = window.setTimeout(() => setTimeLeft((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (state?.ok && "attemptId" in state && state.attemptId) {
      router.push(`/exams/result/${state.attemptId}`);
    }
  }, [router, state]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSelectAssertion = (questionId: string, assertionId: string, value: boolean) => {
    setSelectedAssertions((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? {}),
        [assertionId]: value
      }
    }));
  };

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= totalQuestions) return;
    setCurrentIndex(index);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!window.confirm("A prova será finalizada e não poderá ser alterada. Deseja enviar agora?")) {
      event.preventDefault();
      return;
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Cronômetro</p>
            <p className="text-3xl font-semibold">{formatTime(timeLeft)}</p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Questão</p>
            <p className="text-3xl font-semibold">
              {currentIndex + 1}/{totalQuestions}
            </p>
          </div>
        </div>
        <div className="h-2 rounded-full border border-border/30 bg-background/60">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          {answeredCount} perguntas respondidas · {Math.max(totalQuestions - answeredCount, 0)} pendentes
        </p>
      </section>

      <section className="space-y-3 rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {questions.map((item, index) => {
            const isAnswered =
              item.question.question_type === "sba_true_false"
                ? item.assertions.length > 0 &&
                  item.assertions.every((assertion) => {
                    const value = selectedAssertions[item.question.id]?.[assertion.id];
                    return value !== null && value !== undefined;
                  })
                : Boolean(selectedOptions[item.question.id]);
            return (
              <button
                key={item.question.id}
                type="button"
                className={cn(
                  "h-10 w-10 rounded-full border text-xs font-semibold transition",
                  index === currentIndex
                    ? "border-primary bg-primary/10 text-primary"
                    : isAnswered
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-border/70 text-muted-foreground"
                )}
                onClick={() => goToQuestion(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </section>

      {currentQuestion ? (
        <section className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Enunciado</p>
            <p className="text-lg font-semibold">{currentQuestion.question.title ?? "Questão sem título"}</p>
            <p className="text-sm text-muted-foreground">{currentQuestion.question.stem}</p>
          </div>
          <div className="space-y-3">
            {currentQuestion.question.question_type === "sba_true_false" ? (
              <QuestionAssertionGroup
                assertions={currentQuestion.assertions}
                selectedAssertions={selectedAssertions[currentQuestion.question.id] ?? {}}
                showFeedback={false}
                onSelect={(assertionId, value) => handleSelectAssertion(currentQuestion.question.id, assertionId, value)}
              />
            ) : (
              currentQuestion.options.map((option) => (
                <QuestionOption
                  key={option.id}
                  option={option}
                  isSelected={selectedOptions[currentQuestion.question.id] === option.id}
                  showFeedback={false}
                  onSelect={() => handleSelectOption(currentQuestion.question.id, option.id)}
                />
              ))
            )}
          </div>
        </section>
      ) : null}

      <form action={formAction} onSubmit={handleSubmit} className="space-y-3 rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
        <input type="hidden" name="exam_id" value={exam.id} />
        <input type="hidden" name="answers_json" value={JSON.stringify(selectedOptions)} />
        <input type="hidden" name="assertion_answers_json" value={JSON.stringify(selectedAssertions)} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => goToQuestion(currentIndex - 1)}>
              Anterior
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => goToQuestion(currentIndex + 1)}>
              Próxima
            </Button>
          </div>
          <Button size="sm" type="submit" disabled={isPending || answeredCount === 0}>
            {isPending ? "Enviando..." : "Enviar prova"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Ao enviar você finaliza a prova e não poderá alterar as respostas. O sistema registra um snapshot para revisão.
        </p>
        {state?.message ? (
          <p className="text-sm text-rose-600">{state.message}</p>
        ) : null}
      </form>
    </div>
  );
}
