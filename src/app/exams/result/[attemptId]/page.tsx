import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExamDomainCard } from "@/components/exams/exam-domain-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScopeFromRole } from "@/lib/auth/profile";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchCurriculumTopicsByYear,
  fetchCurriculumYears,
  fetchExamAttemptById,
  fetchExamAnswers,
  fetchExamById,
  fetchExamResultDomains,
  fetchQuestionAssertions,
  fetchQuestionById,
  fetchQuestionOptions
} from "@/services/db/modules";

export const metadata = {
  title: "Resultado da prova"
};

function decodeAssertionSelections(selectedOptionIds: string[]) {
  return Object.fromEntries(
    selectedOptionIds
      .map((value) => value.split(":"))
      .filter((parts) => parts.length === 2)
      .map(([assertionId, choice]) => [assertionId, choice === "V"])
  ) as Record<string, boolean>;
}

interface ResultPageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

export default async function ExamResultPage({ params }: ResultPageProps) {
  const profile = await requireModuleAccess("exams", { onDenied: "notFound" });
  const scope = getScopeFromRole(profile.role);
  const { attemptId } = await params;
  const attempt = await fetchExamAttemptById(attemptId, profile.id, scope);
  if (!attempt) {
    notFound();
  }

  const exam = await fetchExamById(attempt.exam_id, profile.institution_id);
  const answers = await fetchExamAnswers(attempt.id);
  const domains = await fetchExamResultDomains(attempt.id);

  if (!exam) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-10">
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Prova vinculada à tentativa não localizada.
          </div>
        </main>
      </div>
    );
  }

  const totalQuestions = answers.length || exam.total_questions || 0;
  const correctAnswers = answers.filter((answer) => answer.is_correct).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const years = await fetchCurriculumYears();
  const topics = (
    await Promise.all(years.map((year) => fetchCurriculumTopicsByYear(year.code)))
  ).flat();

  const argumentsList = await Promise.all(
    answers.map(async (answer) => {
      const question = await fetchQuestionById(answer.question_id, profile.institution_id);
      const options = await fetchQuestionOptions(answer.question_id);
      const assertions = await fetchQuestionAssertions(answer.question_id);
      return { answer, question, options, assertions };
    })
  );

  const formatScore = () => {
    if (attempt.percent_score !== null && attempt.percent_score !== undefined) {
      return `${attempt.percent_score.toFixed(1)}%`;
    }
    if (attempt.raw_score !== null && exam.total_questions) {
      return `${attempt.raw_score}/${exam.total_questions}`;
    }
    return "Sem pontuação";
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <Badge>Resultado final</Badge>
          <h1 className="text-3xl font-semibold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            Prova realizada em {new Date(attempt.submitted_at ?? Date.now()).toLocaleString("pt-BR")} · Status:{" "}
            {attempt.status}
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Nota final</p>
            <p className="text-3xl font-semibold">{formatScore()}</p>
            <p className="text-sm text-muted-foreground">
              {correctAnswers} acertos · {incorrectAnswers} erros · {totalQuestions} questões
            </p>
            <Link href={`/exams/${exam.id}`}>
              <Button variant="outline" size="sm">
                Ver detalhes da prova
              </Button>
            </Link>
          </div>
          <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Resumo</p>
            <p className="text-sm text-muted-foreground">
              Revise os tópicos com baixo desempenho, reforce os acertos e compartilhe o relatório com seu preceptor.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/question-bank/errors">
                <Button variant="ghost" size="sm">
                  Ir para o caderno de erros
                </Button>
              </Link>
              <Link
                href={{
                  pathname: "/question-bank",
                  query: { year: years.find((year) => year.id === exam.curriculum_year_id)?.code ?? "" }
                }}
              >
                <Button variant="ghost" size="sm">
                  Revisar questões do ano
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Desempenho por tema</h2>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Currículo SBA</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">Desempenho detalhado em processamento.</p>
            ) : (
              domains.map((domain) => {
                const topicTitle = topics.find((topic) => topic.id === domain.curriculum_topic_id)?.title ?? "Tema";
                return (
                  <ExamDomainCard
                    key={domain.id}
                    title={topicTitle}
                    scorePercent={domain.score_percent}
                    correct={domain.correct_count}
                    total={domain.total_count}
                  />
                );
              })
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Revisão das questões</h2>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Respostas e feedback</p>
          </div>
          <div className="space-y-4">
            {argumentsList.map(({ question, answer, options, assertions }, index) => (
              <Card key={answer.id} className="space-y-3">
                <CardHeader className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Questão {index + 1}</p>
                  <CardTitle className="text-base">{question?.title ?? "Questão"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{question?.stem}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                      {question?.question_type === "sba_true_false" ? "Assertivas" : "Alternativas"}
                    </p>
                    {question?.question_type === "sba_true_false" ? (
                      <div className="space-y-2">
                        {assertions.map((assertion, assertionIndex) => {
                          const selectedAssertions = decodeAssertionSelections(answer.selected_option_ids);
                          const selectedValue = selectedAssertions[assertion.id];
                          const isCorrectSelection = selectedValue === assertion.is_true;
                          return (
                            <div
                              key={assertion.id}
                              className={`rounded-2xl border px-4 py-3 ${
                                isCorrectSelection
                                  ? "border-emerald-300 bg-emerald-50"
                                  : "border-rose-300 bg-rose-50"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                                  Assertiva {assertionIndex + 1}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.4em]">
                                  Marcado: {selectedValue === undefined ? "—" : selectedValue ? "V" : "F"} · Gabarito:{" "}
                                  {assertion.is_true ? "V" : "F"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{assertion.assertion_text}</p>
                              {assertion.explanation ? (
                                <p className="text-xs text-muted-foreground">{assertion.explanation}</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {options.map((option) => {
                          const isSelected = answer.selected_option_ids.includes(option.id);
                          const isCorrect = option.is_correct;
                          return (
                            <div
                              key={option.id}
                              className={`rounded-2xl border px-4 py-3 ${
                                isCorrect
                                  ? "border-emerald-300 bg-emerald-50"
                                  : isSelected
                                  ? "border-rose-300 bg-rose-50"
                                  : "border-border/60 bg-background"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                                  {option.option_label ?? "Alternativa"}
                                </span>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.4em]">
                                  {isCorrect ? "Correta" : isSelected ? "Selecionada" : " "}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{option.option_text}</p>
                              {option.explanation ? <p className="text-xs text-muted-foreground">{option.explanation}</p> : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/question-bank/question/${question?.id}`}>
                      <Button variant="ghost" size="sm">
                        Abrir questão detalhada
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
