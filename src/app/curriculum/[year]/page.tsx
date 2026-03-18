import Link from "next/link";
import { notFound } from "next/navigation";

import { CurriculumTopicCard } from "@/components/curriculum/curriculum-topic-card";
import { Badge } from "@/components/ui/badge";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchCurriculumSubtopics,
  fetchCurriculumTopicsByYear,
  fetchExamSummaries,
  fetchLearningTracksByYear,
  fetchQuestionBankEntries
} from "@/services/db/modules";
import type { TraineeYearCode } from "@/types/database";

const validYears: TraineeYearCode[] = ["ME1", "ME2", "ME3"];

interface CurriculumYearPageProps {
  params: Promise<{
    year?: string | string[];
  }>;
}

export default async function YearPage({ params }: CurriculumYearPageProps) {
  const profile = await requireModuleAccess("curriculum", { onDenied: "notFound" });
  const { year: rawYear } = await params;
  if (typeof rawYear !== "string" && !Array.isArray(rawYear)) {
    notFound();
  }

  const yearValue = Array.isArray(rawYear) ? rawYear[0] : rawYear;
  if (typeof yearValue !== "string") {
    notFound();
  }

  const yearCode = yearValue.toUpperCase() as TraineeYearCode;
  if (!validYears.includes(yearCode)) {
    notFound();
  }

  const topics = await fetchCurriculumTopicsByYear(yearCode);
  const [tracks, questions, exams] = await Promise.all([
    fetchLearningTracksByYear(yearCode, profile.institution_id),
    fetchQuestionBankEntries({ curriculum_year_code: yearCode }, profile.institution_id),
    fetchExamSummaries(profile.institution_id)
  ]);
  const subtopicCounts = await Promise.all(topics.map((topic) => fetchCurriculumSubtopics(topic.id)));
  const yearExams = exams.filter((exam) => exam.curriculum_year_id === topics[0]?.curriculum_year_id);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <header className="space-y-2">
          <Badge>Tópicos oficiais</Badge>
          <h1 className="text-3xl font-semibold">Currículo SBA {yearCode}</h1>
          <p className="text-sm text-muted-foreground">
            Este ano combina base curricular, trilhas guiadas, prática com questões e provas coerentes com o estágio de
            formação.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryBox label="Tópicos" value={topics.length} helper="Cobertura oficial do ano" />
          <SummaryBox label="Trilhas" value={tracks.length} helper="Fluxos guiados de estudo" />
          <SummaryBox label="Prática" value={questions.length + yearExams.length} helper="Questões e provas disponíveis" />
        </section>

        {topics.length === 0 ? (
          <p className="rounded-[1.5rem] border border-border/80 bg-card/90 p-6 text-sm text-muted-foreground">
            Ainda não há tópicos registrados para este ano.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((topic, index) => {
              const topicHref = `/curriculum/topic/${topic.id}` as Parameters<typeof Link>[0]["href"];
              return (
                <CurriculumTopicCard
                  key={topic.id}
                  title={topic.title}
                  description={topic.description}
                  href={topicHref}
                  pointNumber={topic.point_number}
                  subtopicsCount={subtopicCounts[index].length}
                />
              );
            })}
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-3">
          <QuickLinkCard
            title="Entrar nas trilhas"
            description="Ver módulos e lições sequenciadas para este ano."
            href={`/trilhas/${yearCode.toLowerCase()}` as Parameters<typeof Link>[0]["href"]}
            action="Abrir trilhas"
          />
          <QuickLinkCard
            title="Praticar questões"
            description="Resolver banco de questões já filtrado para este ano."
            href={{ pathname: "/question-bank", query: { year: yearCode } }}
            action="Resolver questões"
          />
          <QuickLinkCard
            title="Ver provas"
            description="Conferir provas e simulados ligados a esta etapa."
            href="/exams"
            action="Ir para provas"
          />
        </section>
      </main>
    </div>
  );
}

function SummaryBox({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
    </article>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
  action
}: {
  title: string;
  description: string;
  href: Parameters<typeof Link>[0]["href"];
  action: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card/95 p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link href={href} className="mt-4 inline-flex text-sm font-semibold text-primary">
        {action}
      </Link>
    </article>
  );
}
