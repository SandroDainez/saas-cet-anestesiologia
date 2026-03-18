import Link from "next/link";

import { QuestionCard } from "@/components/question-bank/question-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchCurriculumTopicsByYear, fetchCurriculumYears, fetchFavoriteQuestions } from "@/services/db/modules";
import type { QuestionBankEntry, CurriculumTopic, CurriculumYear, TraineeYearCode } from "@/types/database";

export const metadata = {
  title: "Favoritas"
};

export default async function FavoritesPage() {
  const profile = await requireModuleAccess("question-bank", { allowedScopes: ["trainee"] });
  const years = await fetchCurriculumYears();
  const topicsByYear = await Promise.all(years.map((year) => fetchCurriculumTopicsByYear(year.code)));
  const topics = topicsByYear.flat();

  const favorites = await fetchFavoriteQuestions(undefined, profile.institution_id);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <Badge>Banco pessoal</Badge>
          <h1 className="text-3xl font-semibold">Favoritas</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Liste questões marcadas para revisão, aprofunde-se nas explicações comentadas e compartilhe com seu preceptor.
          </p>
        </header>

        {favorites.length === 0 ? (
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
            Ainda não há questões favoritas. Ao acessar uma questão, marque ela para revisar depois.
          </div>
        ) : (
          <div className="space-y-5">
            {favorites.map((question) => (
              <article key={question.id} className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Favorita</h2>
                  <Link href={`/question-bank/question/${question.id}`}>
                    <Button size="sm">Revisar</Button>
                  </Link>
                </div>
                <QuestionCard
                  question={question}
                  yearCode={mapYearCode(question.curriculum_year_id, years)}
                  topicLabel={mapTopicTitle(question.curriculum_topic_id, topics)}
                />
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function mapYearCode(yearId: string | null | undefined, years: CurriculumYear[]): TraineeYearCode | undefined {
  if (!yearId) return undefined;
  return years.find((year) => year.id === yearId)?.code;
}

function mapTopicTitle(topicId: string | null | undefined, topics: CurriculumTopic[]): string | undefined {
  if (!topicId) return undefined;
  return topics.find((topic) => topic.id === topicId)?.title;
}
