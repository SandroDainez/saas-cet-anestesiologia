import Link from "next/link";
import { notFound } from "next/navigation";

import { ModuleNavigationStrip } from "@/components/layout/module-navigation-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchLessonsForModule,
  fetchLearningModulesForTrack,
  fetchTrackById,
  fetchTraineeLessonProgress,
  fetchTraineeModuleProgress
} from "@/services/db/modules";

interface TrackDetailPageProps {
  params: Promise<{
    trackId?: string | string[];
  }>;
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
  const profile = await requireModuleAccess("tracks", { onDenied: "notFound" });
  const { trackId: rawTrackId } = await params;
  if (typeof rawTrackId !== "string" && !Array.isArray(rawTrackId)) {
    notFound();
  }

  const trackId = Array.isArray(rawTrackId) ? rawTrackId[0] : rawTrackId;
  if (typeof trackId !== "string") {
    notFound();
  }

  const track = await fetchTrackById(trackId);
  if (!track) {
    notFound();
  }

  const modules = await fetchLearningModulesForTrack(track.id);
  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => ({
      module,
      lessons: await fetchLessonsForModule(module.id)
    }))
  );
  const allLessons = modulesWithLessons.flatMap(({ lessons }) => lessons);
  const [lessonProgress, moduleProgress] = isTraineeRole(profile.role)
    ? await Promise.all([
        fetchTraineeLessonProgress(profile.id, allLessons.map((lesson) => lesson.id)),
        fetchTraineeModuleProgress(profile.id, modules.map((module) => module.id))
      ])
    : [[], []];

  const firstIncompleteLesson =
    allLessons.find(
      (lesson) =>
        !lessonProgress.some((progress) => progress.lesson_id === lesson.id && progress.status === "completed")
    ) ?? modulesWithLessons[0]?.lessons?.[0];
  const completedLessons = lessonProgress.filter((progress) => progress.status === "completed").length;
  const inProgressLessons = lessonProgress.filter((progress) => progress.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <ModuleNavigationStrip activeHref="/trilhas" />

        <header className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Trilha</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">{track.title}</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">{track.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <TrackMetric label="Módulos" value={modules.length} />
                <TrackMetric label="Lições" value={allLessons.length} />
                <TrackMetric
                  label="Progresso"
                  value={
                    moduleProgress.length > 0
                      ? `${Math.round(
                          moduleProgress.reduce((sum, item) => sum + Number(item.completion_percent ?? 0), 0) /
                            moduleProgress.length
                        )}%`
                      : "0%"
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
              {firstIncompleteLesson ? (
                <Link href={`/trilhas/lesson/${firstIncompleteLesson.id}`}>
                  <Button size="sm">Continuar trilha</Button>
                </Link>
              ) : null}
              <Link href="/curriculum">
                <Button variant="outline" size="sm">
                  Ver currículo
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <Card className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Como avançar nesta trilha</CardTitle>
              <p className="text-sm text-muted-foreground">
                A ideia é manter sequência lógica entre teoria, prática e progresso registrado.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <TrackStep label="1. Retomar lição" description="Abra a próxima lição pendente desta trilha." />
              <TrackStep label="2. Consolidar módulo" description="Conclua o conjunto antes de migrar para outro tema." />
              <TrackStep label="3. Praticar depois" description="Feche o estudo com questões e provas do mesmo ano." />
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Status da trilha</CardTitle>
              <p className="text-sm text-muted-foreground">Leitura rápida do andamento atual.</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <TrackRow label="Concluídas" value={String(completedLessons)} />
              <TrackRow label="Em andamento" value={String(inProgressLessons)} />
              <TrackRow label="Próxima lição" value={firstIncompleteLesson?.title ?? "Nenhuma"} />
            </CardContent>
          </Card>
        </section>

        {modules.length === 0 ? (
          <p className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
            Ainda não há módulos configurados para esta trilha.
          </p>
        ) : (
          <div className="space-y-4">
            {modulesWithLessons.map(({ module, lessons }) => (
              <Card key={module.id} className="border-border/70">
                <CardHeader>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Duração estimada: {module.estimated_minutes ?? "—"} min
                  </p>
                  <div className="space-y-2">
                    {lessons.map((lesson) => {
                      const status =
                        lessonProgress.find((progress) => progress.lesson_id === lesson.id)?.status ?? "not_started";

                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.summary ?? lesson.objective ?? "Lição guiada"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                              {status === "completed"
                                ? "Concluída"
                                : status === "in_progress"
                                ? "Em andamento"
                                : "Nova"}
                            </span>
                            <Link href={`/trilhas/lesson/${lesson.id}`}>
                              <Button variant={status === "completed" ? "outline" : "secondary"} size="sm">
                                Abrir
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {firstIncompleteLesson ? (
          <section className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Retomar estudo</p>
                <h2 className="text-xl font-semibold">{firstIncompleteLesson.title}</h2>
              </div>
              <Link href={`/trilhas/lesson/${firstIncompleteLesson.id}`}>
                <Button variant="secondary" size="sm">
                  Retomar agora
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {firstIncompleteLesson.summary ?? firstIncompleteLesson.objective}
            </p>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function TrackMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function TrackStep({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function TrackRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
