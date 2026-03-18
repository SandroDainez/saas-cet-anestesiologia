import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocalSourceExcerptPanel } from "@/components/content-management/local-source-excerpt-panel";
import { LocalSourceList } from "@/components/content-management/local-source-list";
import { requireModuleAccess, isPrivilegedReviewerRole, isTraineeRole } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { getCompetencyYearSummary } from "@/services/curriculum/competency-matrix";
import { describeExamRefreshPolicy } from "@/services/exams/exam-refresh";
import {
  fetchCurriculumTopicsByYear,
  fetchCurriculumYears,
  fetchExamAttemptsByExam,
  fetchExamById,
  fetchExamBlueprints,
  fetchExamQuestionLinks,
  fetchQuestionById
} from "@/services/db/modules";

export const metadata = {
  title: "Detalhes da prova"
};

const examTypeLabels: Record<string, string> = {
  quarterly: "Prova trimestral",
  annual: "Prova anual SBA",
  training_short: "Treino rápido",
  mock: "Simulado",
  mini_test: "Mini teste",
  oral_simulation: "Simulação oral"
};

interface ExamDetailPageProps {
  params: Promise<{
    examId: string;
  }>;
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "indefinido";

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const profile = await requireModuleAccess("exams", { onDenied: "notFound" });
  const { examId } = await params;
  const exam = await fetchExamById(examId, profile.institution_id);
  if (!exam) {
    notFound();
  }

  const years = await fetchCurriculumYears();
  const yearCode = years.find((year) => year.id === exam.curriculum_year_id)?.code;
  const yearSummary = yearCode ? getCompetencyYearSummary(yearCode) : null;
  const refreshPolicy = describeExamRefreshPolicy(exam);
  const topics = yearCode ? await fetchCurriculumTopicsByYear(yearCode) : [];
  const blueprint = await fetchExamBlueprints(exam.id);
  const questionLinks = await fetchExamQuestionLinks(exam.id);
  const viewerRole = isTraineeRole(profile.role) ? "trainee" : isPrivilegedReviewerRole(profile.role) ? "preceptor" : "admin";
  const attempts = await fetchExamAttemptsByExam(exam.id, isTraineeRole(profile.role) ? profile.id : undefined, viewerRole);
  const questions = await Promise.all(
    questionLinks.map((link) => fetchQuestionById(link.question_id, profile.institution_id))
  );
  const localContext = await getRecommendedLocalContext({
    usage: "exams",
    preferredYears: yearCode ? [yearCode] : [],
    keywords: [exam.title, exam.description ?? "", ...topics.map((topic) => topic.title)],
    limit: 4
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-secondary/10 text-secondary-foreground">
              {examTypeLabels[exam.exam_type] ?? exam.exam_type}
            </Badge>
            <span className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {yearCode ?? "Ano não definido"}
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{exam.title}</h1>
            <p className="text-sm text-muted-foreground">{exam.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Duração" value={exam.duration_minutes ? `${exam.duration_minutes} min` : "Não definido"} />
            <DetailItem
              label="Questões planejadas"
              value={exam.total_questions ? `${exam.total_questions}` : `${questionLinks.length}`}
            />
            <DetailItem label="Questões publicadas" value={`${questionLinks.length}`} />
            <DetailItem label="Status" value={exam.status} />
            <DetailItem label="Disponibilidade" value={`${formatDate(exam.available_from)} → ${formatDate(exam.available_until)}`} />
            <DetailItem label="Atualização" value={refreshPolicy.label} />
          </div>
          <p className="text-sm text-muted-foreground">{refreshPolicy.detail}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/exams/${exam.id}/take`}>
              <Button disabled={exam.status !== "open"}>{exam.status === "open" ? "Iniciar prova" : "Prova indisponível"}</Button>
            </Link>
            {isTraineeRole(profile.role) && attempts[0] ? (
              <Link href={`/exams/result/${attempts[0].id}`}>
                <Button variant="outline">Último resultado</Button>
              </Link>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Leitura recomendada</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ExamStep label="1. Conferir blueprint" description="Valide quais domínios e tópicos estão cobrados." />
              <ExamStep label="2. Executar prova" description="Faça a tentativa no contexto do seu ano e formato." />
              <ExamStep label="3. Revisar resultado" description="Use o desempenho para voltar ao tema fraco." />
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Escopo acadêmico</p>
            <div className="mt-4 space-y-3">
              <DetailRow label="Ano" value={yearCode ?? "Não definido"} />
              <DetailRow label="Domínios do ano" value={`${yearSummary?.coverageDomains.length ?? 0}`} />
              <DetailRow label="Tentativas" value={`${attempts.length}`} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Blueprint</h2>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Distribuição curricular</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {blueprint.map((item) => (
              <article key={item.id} className="rounded-[1.5rem] border border-border/70 bg-card/90 p-4">
                <p className="text-sm font-semibold">
                  {topics.find((topic) => topic.id === item.curriculum_topic_id)?.title ?? "Tópico designado"}
                </p>
                <p className="text-xs text-muted-foreground">Questões: {item.target_question_count}</p>
                <p className="text-xs text-muted-foreground">
                  Peso: {item.weight_percent ? `${item.weight_percent}%` : "Não definido"}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Histórico de tentativas</h2>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Acompanhamento</p>
          </div>
          {attempts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhuma tentativa registrada ainda.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {attempts.map((attempt) => (
                <article key={attempt.id} className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Tentativa</p>
                  <p className="mt-2 text-lg font-semibold">
                    {attempt.percent_score !== null && attempt.percent_score !== undefined
                      ? `${Number(attempt.percent_score).toFixed(1)}%`
                      : "Em processamento"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(attempt.submitted_at ?? attempt.started_at)} · {attempt.status}
                  </p>
                  <Link href={`/exams/result/${attempt.id}`} className="mt-3 inline-flex text-sm font-semibold text-primary">
                    Abrir resultado
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Questões vinculadas</h2>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Referências SBA</p>
          </div>
          <div className="space-y-4">
            {questionLinks.map((link, index) => {
              const question = questions[index];
              return (
                <article key={link.id} className="rounded-[1.5rem] border border-border/70 bg-card/95 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold">Questão {index + 1}</h3>
                    <span className="text-xs text-muted-foreground">Peso: {link.points}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{question?.stem ?? "Enunciado indisponível"}</p>
                  {question ? (
                    <Link href={`/question-bank/question/${question.id}`} className="text-sm font-semibold text-primary">
                      Abrir questão detalhada
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <LocalSourceList
            title="Biblioteca local relacionada"
            description="Fontes da content-library com uso sugerido para esta prova."
            sources={localContext.recommendedSources}
          />
          <LocalSourceExcerptPanel
            title="Trechos locais recomendados"
            description="Excertos para revisar domínios e temas ligados à prova."
            previews={localContext.previews}
          />
        </section>
      </main>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function ExamStep({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
