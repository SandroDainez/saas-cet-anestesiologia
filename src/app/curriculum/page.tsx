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
import { getCompetencyYearSummary } from "@/services/curriculum/competency-matrix";

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
        exams: exams.filter((exam) => exam.curriculum_year_id === year.id),
        competencySummary: getCompetencyYearSummary(year.code)
      };
    })
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Currículo oficial SBA</p>
              <h1 className="text-3xl font-semibold">Mapa curricular com estudo, prática e avaliação</h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Cada ano precisa ter escopo próprio. Aqui o foco é organizar o que pertence a `ME1`, `ME2` e `ME3`
                sem misturar conteúdo, prova ou trilha fora da etapa correta.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm lg:max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Ordem sugerida</p>
              <div className="mt-3 space-y-3">
                <FlowHint title="1. Escolha o ano" description="Abra apenas o bloco curricular correspondente à etapa atual." />
                <FlowHint title="2. Entre na trilha" description="Passe dos tópicos oficiais para módulos e lições organizadas." />
                <FlowHint title="3. Feche com prática" description="Use questões, provas, logbook e emergências do mesmo ano." />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {yearData.map(({ year, topics, tracks, questions, exams: yearExams, competencySummary }) => {
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
                {competencySummary ? (
                  <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4 text-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      Cobertura obrigatória
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {competencySummary.coverageDomains.map((domain) => (
                        <span key={domain.id} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                          {domain.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
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

        <section className="grid gap-4 lg:grid-cols-4">
          <StudyFlowCard
            title="Logbook"
            description="Registre procedimentos, acompanhe validações e maturidade clínica por ano."
            href="/logbook"
            action="Abrir logbook"
          />
          <StudyFlowCard
            title="Autoavaliação"
            description="Veja a evolução da confiança e da prontidão clínica em cenários de emergência."
            href="/emergencies/self-assessment"
            action="Abrir autoavaliação"
          />
          <StudyFlowCard
            title="Habilidades"
            description="Consulte a matriz de competências exigidas e as evidências esperadas em cada etapa."
            href="/curriculum/competencies"
            action="Ver competências"
          />
          <StudyFlowCard
            title="Guias por cirurgia"
            description="Acesse técnica recomendada, monitorização, drogas, profilaxias e riscos por procedimento."
            href="/surgery-guides"
            action="Abrir guias"
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

function FlowHint({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
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
