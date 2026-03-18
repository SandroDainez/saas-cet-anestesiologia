import Link from "next/link";

import { QuestionCard } from "@/components/question-bank/question-card";
import { QuestionFilter } from "@/components/question-bank/question-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchCurriculumSubtopics,
  fetchCurriculumTopicsByYear,
  fetchCurriculumYears,
  fetchQuestionBankEntries,
  fetchQuestionPracticeSummary
} from "@/services/db/modules";
import type { QuestionFilters } from "@/services/db/modules";
import type {
  CurriculumSubtopic,
  QuestionBankEntry,
  QuestionDifficulty,
  QuestionTypeEnum,
  TraineeYearCode
} from "@/types/database";

export const metadata = {
  title: "Banco de Questões"
};

const difficultyValues: QuestionDifficulty[] = ["easy", "medium", "hard"];
const questionTypeValues: QuestionTypeEnum[] = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "matching",
  "case_sequential",
  "image_based"
];

const yearCodes: TraineeYearCode[] = ["ME1", "ME2", "ME3"];

interface QuestionBankPageParams {
  searchParams?: Promise<{
    year?: string | string[];
    topicId?: string | string[];
    subtopicId?: string | string[];
    difficulty?: string | string[];
    questionType?: string | string[];
  }>;
}

const getFirstParam = (value?: string | string[]) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

export default async function QuestionBankPage({ searchParams }: QuestionBankPageParams) {
  const profile = await requireModuleAccess("question-bank");
  const resolvedSearchParams = (await (searchParams ?? Promise.resolve({}))) as {
    year?: string | string[];
    topicId?: string | string[];
    subtopicId?: string | string[];
    difficulty?: string | string[];
    questionType?: string | string[];
  };
  const yearParam = getFirstParam(resolvedSearchParams.year);
  const topicId = getFirstParam(resolvedSearchParams.topicId);
  const subtopicId = getFirstParam(resolvedSearchParams.subtopicId);
  const difficultyParam = getFirstParam(resolvedSearchParams.difficulty);
  const questionTypeParam = getFirstParam(resolvedSearchParams.questionType);

  const defaultYear = isTraineeRole(profile.role) ? profile.training_year : undefined;
  const curriculumYearCode = yearCodes.includes(yearParam as TraineeYearCode)
    ? (yearParam as TraineeYearCode)
    : defaultYear;
  const difficulty =
    difficultyParam && difficultyValues.includes(difficultyParam as QuestionDifficulty)
      ? (difficultyParam as QuestionDifficulty)
      : undefined;
  const questionType =
    questionTypeParam && questionTypeValues.includes(questionTypeParam as QuestionTypeEnum)
      ? (questionTypeParam as QuestionTypeEnum)
      : undefined;

  const filters: QuestionFilters = {
    curriculum_year_code: curriculumYearCode,
    topicId,
    subtopicId,
    difficulty,
    questionType
  };

  const years = await fetchCurriculumYears();
  const topicsByYear = await Promise.all(years.map((year) => fetchCurriculumTopicsByYear(year.code)));
  const topics = topicsByYear.flat();
  const topicMap = new Map(topics.map((topic) => [topic.id, topic]));

  const subtopics: CurriculumSubtopic[] = topicId ? await fetchCurriculumSubtopics(topicId) : [];
  const subtopicMap = new Map(subtopics.map((subtopic) => [subtopic.id, subtopic]));
  const practiceSummary = isTraineeRole(profile.role) ? await fetchQuestionPracticeSummary(profile.id) : null;

  let questions: QuestionBankEntry[] = [];
  let fetchError: string | null = null;

  try {
    questions = await fetchQuestionBankEntries(filters, profile.institution_id);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "Não foi possível carregar as questões.";
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <Badge>Banco oficial SBA</Badge>
          <h1 className="text-3xl font-semibold">Questões alinhadas ao currículo SBA</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            O banco agora funciona como prática real: filtra por ano, mostra desempenho, alimenta caderno de erros e
            conecta a revisão às provas.
          </p>
        </header>

        {practiceSummary ? (
          <section className="grid gap-4 md:grid-cols-4">
            <PracticeMetric label="Tentativas" value={practiceSummary.totalAttempts} helper="Questões respondidas" />
            <PracticeMetric label="Acertos" value={practiceSummary.correctAttempts} helper="Total correto" />
            <PracticeMetric label="Precisão" value={`${practiceSummary.accuracyPercent}%`} helper="Taxa global" />
            <PracticeMetric label="Erros abertos" value={practiceSummary.unresolvedErrors} helper="Pendências no caderno" />
          </section>
        ) : null}

        <QuestionFilter
          years={years}
          topics={topics}
          subtopics={subtopics}
          currentFilters={{
            curriculum_year_code: curriculumYearCode,
            topicId,
            subtopicId,
            difficulty,
            questionType
          }}
        />

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Questões</h2>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <span>{questions.length} resultados</span>
            </div>
          </div>

          {fetchError ? (
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              Falha ao carregar as questões: {fetchError}
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhuma questão encontrada. Ajuste os filtros ou revise o caderno de erros.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {questions.map((question) => {
                const questionYearCode =
                  years.find((year) => year.id === question.curriculum_year_id)?.code ?? curriculumYearCode;

                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    yearCode={questionYearCode}
                    topicLabel={topicMap.get(question.curriculum_topic_id ?? "")?.title}
                    subtopicLabel={subtopicMap.get(question.curriculum_subtopic_id ?? "")?.title}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <CardSummary
            title="Caderno de erros"
            description="Revisite questões erradas para evoluir com foco nos tópicos fracos."
            href="/question-bank/errors"
            actionLabel="Ir para o caderno"
          />
          <CardSummary
            title="Favoritas"
            description="Reserve questões importantes para revisão rápida antes das provas."
            href="/question-bank/favorites"
            actionLabel="Ver favoritas"
          />
        </section>
      </main>
    </div>
  );
}

function PracticeMetric({
  label,
  value,
  helper
}: {
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
    </article>
  );
}

function CardSummary({
  title,
  description,
  href,
  actionLabel
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <Link href={{ pathname: href }}>
          <Button variant="outline" size="sm">
            {actionLabel}
          </Button>
        </Link>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
    </article>
  );
}
