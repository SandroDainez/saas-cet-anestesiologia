import Link from "next/link";

import { CurriculumYearCard } from "@/components/curriculum/curriculum-year-card";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchCurriculumTopicsByYear,
  fetchCurriculumYears,
  fetchExamSummaries,
  fetchLearningTracksByYear,
  fetchQuestionBankEntries
} from "@/services/db/modules";

export const metadata = {
  title: "Currículo SBA"
};

const yearDescriptions: Record<string, string> = {
  ME1: "Fundamentos da anestesiologia: ética, avaliação pré-anestésica e farmacologia.",
  ME2: "Expansão corporativa com monitorização, obstetrícia, bloqueios periféricos e sistemas da analgesia.",
  ME3: "Casos complexos: trauma, cirurgia cardiovascular, neurocirurgia e gestão do centro cirúrgico."
};

export default async function CurriculumPage() {
  const profile = await requireModuleAccess("curriculum");
  const years = await fetchCurriculumYears();
  const exams = await fetchExamSummaries(profile.institution_id);
  const recommendedYear = isTraineeRole(profile.role) ? profile.training_year : undefined;

  const yearData = await Promise.all(
    years.map(async (year) => {
      const [topics, tracks, questions] = await Promise.all([
        fetchCurriculumTopicsByYear(year.code),
        fetchLearningTracksByYear(year.code, profile.institution_id),
        fetchQuestionBankEntries({ curriculum_year_code: year.code }, profile.institution_id)
      ]);

      return {
        year,
        topics,
        tracks,
        questions,
        exams: exams.filter((exam) => exam.curriculum_year_id === year.id)
      };
    })
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Currículo oficial SBA</p>
          <h1 className="text-3xl font-semibold">Mapa curricular com estudo, prática e avaliação</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            O currículo deixa de ser só lista de tópicos: cada ano agora aponta para trilhas, lições, banco de questões
            e provas coerentes com a etapa de formação.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {yearData.map(({ year, topics, tracks, questions, exams: yearExams }) => {
            const yearHref = `/curriculum/${year.code.toLowerCase()}` as Parameters<typeof Link>[0]["href"];

            return (
              <div key={year.id} className="space-y-3">
                <CurriculumYearCard
                  title={recommendedYear === year.code ? `${year.name} · foco recomendado` : year.name}
                  description={yearDescriptions[year.code]}
                  link={yearHref}
                  topics={topics.map((topic) => topic.title)}
                />
                <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-border/70 bg-card/90 p-4 text-sm">
                  <Metric label="Tópicos" value={topics.length} />
                  <Metric label="Trilhas" value={tracks.length} />
                  <Metric label="Questões" value={questions.length} />
                  <Metric label="Provas" value={yearExams.length} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <StudyFlowCard
            title="1. Entenda o ano"
            description="Veja os tópicos oficiais e a organização lógica do conteúdo antes de estudar."
            href={
              recommendedYear
                ? (`/curriculum/${recommendedYear.toLowerCase()}` as Parameters<typeof Link>[0]["href"])
                : ("/curriculum/me1" as Parameters<typeof Link>[0]["href"])
            }
            action="Abrir tópicos"
          />
          <StudyFlowCard
            title="2. Entre na trilha"
            description="Cada trilha organiza módulos e lições em uma sequência prática para o trainee."
            href={
              recommendedYear
                ? (`/trilhas/${recommendedYear.toLowerCase()}` as Parameters<typeof Link>[0]["href"])
                : ("/trilhas" as Parameters<typeof Link>[0]["href"])
            }
            action="Abrir trilhas"
          />
          <StudyFlowCard
            title="3. Pratique e teste"
            description="Resolva questões, revise erros e faça provas sem sair do fluxo do ano."
            href={
              recommendedYear
                ? { pathname: "/question-bank", query: { year: recommendedYear } }
                : ("/question-bank" as Parameters<typeof Link>[0]["href"])
            }
            action="Ir para prática"
          />
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StudyFlowCard({
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
    <article className="rounded-[1.5rem] border border-border/70 bg-card/95 p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <Link href={href} className="mt-4 inline-flex text-sm font-semibold text-primary">
        {action}
      </Link>
    </article>
  );
}
