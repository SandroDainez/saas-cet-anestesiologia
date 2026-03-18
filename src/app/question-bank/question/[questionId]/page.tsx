import Link from "next/link";

import { QuestionResolver } from "@/components/question-bank/question-resolver";
import { Button } from "@/components/ui/button";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchCurriculumYears,
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

    const [options, references, tags, years] = await Promise.all([
      fetchQuestionOptions(question.id),
      fetchQuestionReferences(question.id),
      fetchQuestionTags(question.id),
      fetchCurriculumYears()
    ]);

    return (
      <div className="min-h-screen bg-background">
        <main className="container space-y-8 py-10">
          <QuestionResolver
            question={question}
            options={options}
            references={references}
            tags={tags}
            yearCode={mapYearCode(question.curriculum_year_id, years)}
          />
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
