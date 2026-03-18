import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireModuleAccess, isPrivilegedReviewerRole, isTraineeRole } from "@/services/auth/require-module-access";
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
  const topics = yearCode ? await fetchCurriculumTopicsByYear(yearCode) : [];
  const blueprint = await fetchExamBlueprints(exam.id);
  const questionLinks = await fetchExamQuestionLinks(exam.id);
  const viewerRole = isTraineeRole(profile.role) ? "trainee" : isPrivilegedReviewerRole(profile.role) ? "preceptor" : "admin";
  const attempts = await fetchExamAttemptsByExam(exam.id, isTraineeRole(profile.role) ? profile.id : undefined, viewerRole);
  const questions = await Promise.all(
    questionLinks.map((link) => fetchQuestionById(link.question_id, profile.institution_id))
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-secondary/10 text-secondary-foreground">{exam.exam_type}</Badge>
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
            <DetailItem label="Questões" value={`${questionLinks.length}`} />
            <DetailItem label="Status" value={exam.status} />
            <DetailItem label="Disponibilidade" value={`${formatDate(exam.available_from)} → ${formatDate(exam.available_until)}`} />
          </div>
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
