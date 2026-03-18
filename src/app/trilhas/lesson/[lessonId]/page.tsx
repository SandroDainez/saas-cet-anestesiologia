import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonProgressPanel } from "@/components/learning/lesson-progress-panel";
import { LessonStepCard } from "@/components/learning/lesson-step-card";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchLessonById,
  fetchLessonSteps,
  fetchLessonsForModule,
  fetchLearningModuleById,
  fetchQuestionBankEntries,
  fetchTrackById,
  fetchTraineeLessonProgress
} from "@/services/db/modules";

interface LessonPageProps {
  params: Promise<{
    lessonId?: string | string[];
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const profile = await requireModuleAccess("tracks", { onDenied: "notFound" });
  const { lessonId: rawLessonId } = await params;
  if (typeof rawLessonId !== "string" && !Array.isArray(rawLessonId)) {
    notFound();
  }

  const lessonId = Array.isArray(rawLessonId) ? rawLessonId[0] : rawLessonId;
  if (typeof lessonId !== "string") {
    notFound();
  }

  const lesson = await fetchLessonById(lessonId);
  if (!lesson) {
    notFound();
  }

  const learningModule = await fetchLearningModuleById(lesson.learning_module_id);
  if (!learningModule) {
    notFound();
  }

  const [steps, siblingLessons, progressRows, relatedQuestions] = await Promise.all([
    fetchLessonSteps(lesson.id),
    fetchLessonsForModule(learningModule.id),
    isTraineeRole(profile.role) ? fetchTraineeLessonProgress(profile.id, [lesson.id]) : Promise.resolve([]),
    learningModule.curriculum_topic_id
      ? fetchQuestionBankEntries({ topicId: learningModule.curriculum_topic_id }, profile.institution_id)
      : Promise.resolve([])
  ]);
  const track = await fetchTrackById(learningModule.learning_track_id);
  const currentProgress = progressRows[0];
  const currentLessonIndex = siblingLessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = currentLessonIndex >= 0 ? siblingLessons[currentLessonIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <header className="space-y-4">
          <div className="space-y-2">
            <Badge>Lição interativa</Badge>
            <h1 className="text-3xl font-semibold">{lesson.title}</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">{lesson.objective ?? lesson.summary}</p>
          </div>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-border/70 bg-card/95 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Sequência recomendada
              </p>
              <h2 className="mt-2 text-xl font-semibold">Concluir a lição e fechar com prática do mesmo tópico</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                O fluxo ideal aqui é simples: terminar a lição, registrar progresso e treinar questões do tema antes da
                próxima etapa.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {isTraineeRole(profile.role) ? (
                  <a href="#lesson-progress-panel">
                    <Button size="sm">Concluir lição</Button>
                  </a>
                ) : null}
                {learningModule.curriculum_topic_id ? (
                  <Link href={{ pathname: "/question-bank", query: { topicId: learningModule.curriculum_topic_id } }}>
                    <Button size="sm" variant={isTraineeRole(profile.role) ? "outline" : "default"}>Resolver questões</Button>
                  </Link>
                ) : null}
                {nextLesson ? (
                  <Link href={`/trilhas/lesson/${nextLesson.id}` as Parameters<typeof Link>[0]["href"]}>
                    <Button size="sm" variant="ghost">Próxima lição</Button>
                  </Link>
                ) : null}
                {track ? (
                  <Link href={`/trilhas/track/${track.id}` as Parameters<typeof Link>[0]["href"]}>
                    <Button size="sm" variant="ghost">Voltar à trilha</Button>
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              <LessonMetric label="Formato" value={lesson.lesson_format} />
              <LessonMetric label="Etapas" value={steps.length} />
              <LessonMetric
                label="Status"
                value={currentProgress?.status === "completed" ? "Concluída" : "Em estudo"}
              />
            </div>
          </section>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {steps.length === 0 ? (
              <p className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
                Conteúdo adicional será inserido com base em fontes científicas aprovadas e revisão editorial.
              </p>
            ) : (
              <div className="grid gap-4">
                {steps.map((step) => (
                  <LessonStepCard key={step.id} step={step} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isTraineeRole(profile.role) ? (
              <div id="lesson-progress-panel">
                <LessonProgressPanel
                  lessonId={lesson.id}
                  moduleId={learningModule.id}
                  currentStatus={currentProgress?.status}
                  nextLessonHref={
                    nextLesson ? (`/trilhas/lesson/${nextLesson.id}` as Parameters<typeof Link>[0]["href"]) : null
                  }
                />
              </div>
            ) : null}

            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Navegação</p>
              <div className="mt-3 space-y-3">
                {track ? (
                  <Link
                    href={`/trilhas/track/${track.id}` as Parameters<typeof Link>[0]["href"]}
                    className="block text-sm font-semibold text-primary"
                  >
                    Voltar para {track.title}
                  </Link>
                ) : null}
                {learningModule.curriculum_topic_id ? (
                  <Link
                    href={{ pathname: "/question-bank", query: { topicId: learningModule.curriculum_topic_id } }}
                    className="block text-sm font-semibold text-primary"
                  >
                    Praticar questões deste tópico
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <h2 className="text-lg font-semibold">Próxima ação recomendada</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Finalize a lição e resolva uma sequência curta de questões para consolidar o raciocínio clínico.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {learningModule.curriculum_topic_id ? (
                  <Link href={{ pathname: "/question-bank", query: { topicId: learningModule.curriculum_topic_id } }}>
                    <Button size="sm">Resolver questões</Button>
                  </Link>
                ) : null}
                {nextLesson ? (
                  <Link href={`/trilhas/lesson/${nextLesson.id}` as Parameters<typeof Link>[0]["href"]}>
                    <Button size="sm" variant="outline">
                      Próxima lição
                    </Button>
                  </Link>
                ) : null}
              </div>
              {relatedQuestions.length > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {relatedQuestions.length} questões relacionadas disponíveis.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LessonMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </article>
  );
}
