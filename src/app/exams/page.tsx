import { getCompetencyMatrix } from "@/services/curriculum/competency-matrix";
import { LocalInsightPanel } from "@/components/content-management/local-insight-panel";
import { Badge } from "@/components/ui/badge";
import { ExamCard } from "@/components/exams/exam-card";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { buildLocalEditorialInsights } from "@/services/content-library/library-editorial-insights";
import { fetchCurriculumYears, fetchExamAttemptsByExam, fetchExamSummaries } from "@/services/db/modules";
import type { Exam, TraineeYearCode } from "@/types/database";

export const metadata = {
  title: "Provas"
};

const categoryLabels: Record<Exam["exam_type"], { title: string; subtitle: string }> = {
  quarterly: {
    title: "Provas trimestrais SBA",
    subtitle: "Avaliações formais com 50 questões para acompanhar a evolução do ano em ciclos trimestrais."
  },
  annual: {
    title: "Provas anuais SBA",
    subtitle: "Avaliações formais anuais com 100 questões e cobertura ampla dos principais domínios."
  },
  training_short: {
    title: "Treinos rápidos",
    subtitle: "Blocos curtos de 10 a 15 questões para prática frequente fora das provas formais."
  },
  mock: {
    title: "Simulados",
    subtitle: "Testes completos com correção detalhada e feedback por domínio."
  },
  mini_test: {
    title: "Mini testes",
    subtitle: "Versões rápidas para revisar condutas específicas."
  },
  oral_simulation: {
    title: "Simulações orais",
    subtitle: "Discussões guiadas por professores para cenários críticos."
  }
};

export default async function ExamsPage() {
  const profile = await requireModuleAccess("exams");
  const years = await fetchCurriculumYears();
  const exams = await fetchExamSummaries(profile.institution_id);
  const matrix = getCompetencyMatrix();
  const recommendedYear = isTraineeRole(profile.role) ? profile.training_year : undefined;
  const localContext = await getRecommendedLocalContext({
    usage: "exams",
    preferredYears: recommendedYear ? [recommendedYear] : [],
    keywords: [recommendedYear ?? "", "provas", "trimestral", "anual", "treino"],
    limit: 4
  });
  const localInsights = buildLocalEditorialInsights(localContext.previews, 3);
  const attemptsByExam = isTraineeRole(profile.role)
    ? new Map(
        (
          await Promise.all(
            exams.map(async (exam) => [exam.id, await fetchExamAttemptsByExam(exam.id, profile.id, "trainee")] as const)
          )
        ).map(([examId, attempts]) => [examId, attempts])
      )
    : new Map<string, Awaited<ReturnType<typeof fetchExamAttemptsByExam>>>();

  const yearMap = new Map(years.map((year) => [year.id, year.code]));
  const grouped: Record<Exam["exam_type"], Exam[]> = {
    quarterly: [],
    annual: [],
    training_short: [],
    mock: [],
    mini_test: [],
    oral_simulation: []
  };

  exams.forEach((exam) => {
    grouped[exam.exam_type]?.push(exam);
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-10 py-10">
        <header className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Fase de avaliação</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Provas alinhadas ao currículo SBA</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  As avaliações devem acompanhar o ano correto. Provas formais e treinos curtos agora ficam separados
                  por papel, cadência e escopo curricular.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ExamScopeStat label="Ano sugerido" value={recommendedYear ?? "Institucional"} />
                <ExamScopeStat label="Categorias" value={`${Object.keys(categoryLabels).length}`} />
                <ExamScopeStat label="Provas ativas" value={`${exams.length}`} />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm lg:max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sequência recomendada</p>
              <div className="mt-3 space-y-3">
                <ExamFlow title="1. Treino curto" description="Use blocos de 10 a 15 questões para aquecimento e revisão." />
                <ExamFlow title="2. Trimestral" description="Feche ciclos de conteúdo do ano com avaliação formal de 50 questões." />
                <ExamFlow title="3. Anual" description="Consolide cobertura ampla com prova anual de 100 questões." />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {matrix.map((yearBlock) => (
            <div key={yearBlock.year} className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{yearBlock.year}</p>
              <h2 className="mt-2 text-lg font-semibold">{yearBlock.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{yearBlock.focus}</p>
            </div>
          ))}
        </section>

        <LocalInsightPanel
          title="Destaques da biblioteca local"
          description="Trechos da content-library para apoiar preparo, revisão e entendimento do perfil das provas."
          insights={localInsights}
        />

        {Object.entries(categoryLabels).map(([type, info]) => (
          <section key={type} className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold">{info.title}</h2>
              <p className="text-sm text-muted-foreground">{info.subtitle}</p>
            </div>
            {grouped[type as Exam["exam_type"]].length === 0 ? (
              <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
                Nenhuma prova cadastrada para esta categoria ainda.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {grouped[type as Exam["exam_type"]].map((exam) => (
                  <div key={exam.id} className="space-y-3">
                    <ExamCard
                      exam={exam}
                      href={`/exams/${exam.id}`}
                      yearCode={yearMap.get(exam.curriculum_year_id ?? "") as TraineeYearCode | undefined}
                    />
                    {isTraineeRole(profile.role) ? (
                      <div className="rounded-[1.25rem] border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                        {attemptsByExam.get(exam.id)?.length
                          ? `${attemptsByExam.get(exam.id)?.length} tentativa(s) registrada(s).`
                          : "Nenhuma tentativa ainda."}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}

function ExamScopeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ExamFlow({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
