import Link from "next/link";

import { LocalInsightPanel } from "@/components/content-management/local-insight-panel";
import { ModuleNavigationStrip } from "@/components/layout/module-navigation-strip";
import { QuestionCard } from "@/components/question-bank/question-card";
import { QuestionFilter } from "@/components/question-bank/question-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { buildLocalEditorialInsights } from "@/services/content-library/library-editorial-insights";
import { getCompetencyYearSummary } from "@/services/curriculum/competency-matrix";
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
  "sba_true_false",
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
  const yearSummary = curriculumYearCode ? getCompetencyYearSummary(curriculumYearCode) : null;
  const localContext = await getRecommendedLocalContext({
    usage: "questions",
    preferredYears: curriculumYearCode ? [curriculumYearCode] : profile.training_year ? [profile.training_year] : [],
    keywords: [
      curriculumYearCode ?? "",
      topicId ? topicMap.get(topicId)?.title ?? "" : "",
      subtopicId ? subtopicMap.get(subtopicId)?.title ?? "" : "",
      questionType ?? "",
      difficulty ?? "",
      "questoes",
      "provas"
    ],
    limit: 4
  });
  const localInsights = buildLocalEditorialInsights(localContext.previews, 3);

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
        <ModuleNavigationStrip activeHref="/question-bank" />

        <header className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Banco oficial SBA</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Questões alinhadas ao currículo SBA</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  O banco deve funcionar por escopo de ano. Aqui o objetivo é praticar sem misturar conteúdo fora da
                  etapa atual e usar os erros para guiar a revisão.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ActiveScopeStat label="Ano ativo" value={curriculumYearCode ?? "Todos"} />
                <ActiveScopeStat label="Tópico" value={topicId ? topicMap.get(topicId)?.title ?? "Selecionado" : "Todos"} />
                <ActiveScopeStat label="Subtema" value={subtopicId ? subtopicMap.get(subtopicId)?.title ?? "Selecionado" : "Todos"} />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm lg:max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Uso recomendado</p>
              <div className="mt-3 space-y-3">
                <FlowStep title="1. Filtrar o ano" description="Comece sempre por ME1, ME2 ou ME3." />
                <FlowStep title="2. Fechar o tema" description="Afine o tópico antes de abrir prática livre." />
                <FlowStep title="3. Revisar erros" description="Leve o que errou para caderno e prova do mesmo escopo." />
              </div>
            </div>
          </div>
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

        <LocalInsightPanel
          title="Destaques da biblioteca local"
          description="Trechos da content-library para apoiar prática, revisão e interpretação das questões."
          insights={localInsights}
        />

        {yearSummary ? (
          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Domínios do ano</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {yearSummary.coverageDomains.map((domain) => (
                  <span key={domain.id} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                    {domain.title}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Prática ligada a</p>
              <div className="mt-4 space-y-3">
                {yearSummary.assessmentTargets.slice(0, 3).map((target) => (
                  <div key={target} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                    {target}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

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

function ActiveScopeStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </article>
  );
}

function FlowStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
