import Link from "next/link";

import { QuestionCard } from "@/components/question-bank/question-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchCurriculumSubtopics, fetchCurriculumTopicsByYear, fetchCurriculumYears, fetchErrorNotebookEntries, fetchQuestionById } from "@/services/db/modules";
import type { QuestionBankEntry, CurriculumSubtopic, CurriculumTopic, CurriculumYear, TraineeYearCode } from "@/types/database";

export const metadata = {
  title: "Caderno de Erros"
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "data indisponível";

export default async function ErrorNotebookPage() {
  try {
    const profile = await requireModuleAccess("question-bank", { allowedScopes: ["trainee"] });
    const years = await fetchCurriculumYears();
    const topicsByYear = await Promise.all(years.map((year) => fetchCurriculumTopicsByYear(year.code)));
    const topics = topicsByYear.flat();

    const notebookEntries = await fetchErrorNotebookEntries(profile.id);
    const detailedEntries = await Promise.all(
      notebookEntries.map(async (entry) => {
        const question = await fetchQuestionById(entry.question_id, profile.institution_id);
        return { entry, question };
      })
    );

    const entries = detailedEntries.filter((item): item is { entry: typeof notebookEntries[number]; question: QuestionBankEntry } => Boolean(item.question));

    const topicIds = Array.from(
      new Set(
        entries
          .map(({ question }) => question.curriculum_topic_id)
          .filter((value): value is string => Boolean(value))
      )
    );
    const subtopicsByTopic: Record<string, CurriculumSubtopic[]> = {};
    await Promise.all(topicIds.map(async (topicId) => {
      if (!topicId) return;
      subtopicsByTopic[topicId] = await fetchCurriculumSubtopics(topicId);
    }));

    return (
      <div className="min-h-screen bg-background">
        <main className="container space-y-8 py-10">
          <header className="space-y-3">
            <Badge>Questionário pessoal</Badge>
            <h1 className="text-3xl font-semibold">Caderno de erros do trainee</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Reforce os tópicos que causam dificuldade. Cada registro lista quantas vezes a questão foi respondida
              incorretamente e permite acesso rápido ao detalhe.
            </p>
          </header>

          {entries.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhum erro registrado ainda. Resolva questões e o caderno irá listar automaticamente os pontos críticos.
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map(({ entry, question }) => (
                <article key={entry.id} className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>Última tentativa: {formatDate(entry.last_wrong_at)}</span>
                    <span className="font-semibold text-foreground">{entry.times_wrong} erros</span>
                  </div>
                  <QuestionCard
                    question={question}
                    yearCode={question.curriculum_year_id ? mapYearCode(question.curriculum_year_id, years) : undefined}
                    topicLabel={mapTopicTitle(question.curriculum_topic_id, topics)}
                    subtopicLabel={mapSubtopicTitle(question.curriculum_subtopic_id ?? "", subtopicsByTopic)}
                  />
                  <p className="text-sm text-muted-foreground">{entry.notes ?? "Sem notas adicionais."}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/question-bank/question/${question.id}`}>
                      <Button size="sm">Revisar questão</Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-10">
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Falha ao carregar o caderno de erros: {error instanceof Error ? error.message : "erro desconhecido"}
          </div>
        </main>
      </div>
    );
  }
}

function mapYearCode(yearId: string, years: CurriculumYear[]): TraineeYearCode | undefined {
  return years.find((year) => year.id === yearId)?.code;
}

function mapTopicTitle(topicId: string | null | undefined, topics: CurriculumTopic[]): string | undefined {
  if (!topicId) return undefined;
  return topics.find((topic) => topic.id === topicId)?.title;
}

function mapSubtopicTitle(subtopicId: string, subtopicsByTopic: Record<string, CurriculumSubtopic[]>): string | undefined {
  for (const subtopics of Object.values(subtopicsByTopic)) {
    const found = subtopics.find((subtopic) => subtopic.id === subtopicId);
    if (found) return found.title;
  }
  return undefined;
}
