import Link from "next/link";

import { LocalSourceExcerptPanel } from "@/components/content-management/local-source-excerpt-panel";
import { LocalSourceList } from "@/components/content-management/local-source-list";
import { ModuleNavigationStrip } from "@/components/layout/module-navigation-strip";
import { QuestionResolver } from "@/components/question-bank/question-resolver";
import { Button } from "@/components/ui/button";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { getCompetencyYearSummary } from "@/services/curriculum/competency-matrix";
import {
  fetchCurriculumYears,
  fetchQuestionAssertions,
  fetchQuestionById,
  fetchQuestionOptions,
  fetchQuestionReferences,
  fetchQuestionTags
} from "@/services/db/modules";
import type { TraineeYearCode, CurriculumYear } from "@/types/database";

export const metadata = {
  title: "Questão"
};

interface QuestionPageParams {
  params: Promise<{
    questionId: string;
  }>;
}

export default async function QuestionDetailPage({ params }: QuestionPageParams) {
  const profile = await requireModuleAccess("question-bank", { onDenied: "notFound" });
  const { questionId } = await params;

  try {
    const question = await fetchQuestionById(questionId, profile.institution_id);
    if (!question) {
      return (
        <div className="min-h-screen bg-background">
          <main className="container py-10">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Questão não encontrada.
            </div>
          </main>
        </div>
      );
    }

    const [options, assertions, references, tags, years] = await Promise.all([
      fetchQuestionOptions(question.id),
      fetchQuestionAssertions(question.id),
      fetchQuestionReferences(question.id),
      fetchQuestionTags(question.id),
      fetchCurriculumYears()
    ]);
    const yearCode = mapYearCode(question.curriculum_year_id, years);
    const yearSummary = yearCode ? getCompetencyYearSummary(yearCode) : null;
    const localContext = await getRecommendedLocalContext({
      usage: "questions",
      preferredYears: yearCode ? [yearCode] : [],
      keywords: [question.title ?? "", question.stem, question.educational_goal ?? ""],
      limit: 3
    });

    return (
      <div className="min-h-screen bg-background">
        <main className="container space-y-8 py-10">
          <ModuleNavigationStrip activeHref="/question-bank" />

          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Como usar esta questão</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <ActionStep label="1. Ler o enunciado" description="Responda no contexto do ano e do tópico vinculados." />
                <ActionStep label="2. Marcar a resposta" description="Resolva antes de abrir explicação e referências." />
                <ActionStep label="3. Revisar o racional" description="Use o feedback para decidir o próximo bloco de estudo." />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Escopo acadêmico</p>
              <div className="mt-4 space-y-3">
                <ScopeRow label="Ano" value={yearCode ?? "Não definido"} />
                <ScopeRow label="Formato" value={question.question_type.replaceAll("_", " ")} />
                <ScopeRow label="Domínios" value={`${yearSummary?.coverageDomains.length ?? 0}`} />
              </div>
            </div>
          </section>

          <QuestionResolver
            question={question}
            options={options}
            assertions={assertions}
            references={references}
            tags={tags}
            yearCode={yearCode}
            localHighlights={localContext.previews}
          />
          <section className="grid gap-4 lg:grid-cols-2">
            <LocalSourceList
              title="Biblioteca local relacionada"
              description="Fontes da content-library úteis para revisar este tema."
              sources={localContext.recommendedSources}
            />
            <LocalSourceExcerptPanel
              title="Trechos locais recomendados"
              description="Excertos de apoio para consolidar a resposta e revisar o conteúdo."
              previews={localContext.previews}
            />
          </section>
          <section className="flex flex-wrap gap-3 rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <Link href="/question-bank">
              <Button variant="outline" size="sm">
                Voltar ao banco
              </Button>
            </Link>
            {question.curriculum_topic_id ? (
              <Link href={{ pathname: "/question-bank", query: { topicId: question.curriculum_topic_id } }}>
                <Button size="sm">Mais questões deste tópico</Button>
              </Link>
            ) : null}
            <Link href="/exams">
              <Button size="sm" variant="ghost">
                Ver provas relacionadas
              </Button>
            </Link>
          </section>
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-10">
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Falha ao carregar a questão: {error instanceof Error ? error.message : "erro desconhecido"}
          </div>
        </main>
      </div>
    );
  }
}

function mapYearCode(yearId: string | null | undefined, years: CurriculumYear[]): TraineeYearCode | undefined {
  if (!yearId) {
    return undefined;
  }
  return years.find((year) => year.id === yearId)?.code;
}

function ActionStep({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ScopeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
