import { Badge } from "@/components/ui/badge";
import { ExamCard } from "@/components/exams/exam-card";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchCurriculumYears, fetchExamAttemptsByExam, fetchExamSummaries } from "@/services/db/modules";
import type { Exam, TraineeYearCode } from "@/types/database";

export const metadata = {
  title: "Provas"
};

const categoryLabels: Record<Exam["exam_type"], { title: string; subtitle: string }> = {
  quarterly: {
    title: "Provas trimestrais",
    subtitle: "Avaliações curtas para revisar os blocos de cada ano com recorrência."
  },
  annual: {
    title: "Prova anual",
    subtitle: "Síntese completa do ano com foco em integração de conteúdo."
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
        <header className="space-y-3">
          <Badge>Fase de avaliação</Badge>
          <h1 className="text-3xl font-semibold">Provas alinhadas ao currículo SBA</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            As provas agora funcionam como parte do ciclo de estudo: preparo por ano, tentativa real, correção e
            retomada por domínio.
          </p>
        </header>

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
