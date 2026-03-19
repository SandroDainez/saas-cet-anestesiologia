import Link from "next/link";

import { ModuleNavigationStrip } from "@/components/layout/module-navigation-strip";
import { TrackCard } from "@/components/learning/track-card";
import { Badge } from "@/components/ui/badge";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchCurriculumYears,
  fetchLearningModulesForTrack,
  fetchLearningTracksByYear,
  fetchLessonsForModule,
  fetchTraineeModuleProgress
} from "@/services/db/modules";
import type { TraineeYearCode } from "@/types/database";

export const metadata = {
  title: "Trilhas de Estudo"
};

const yearSummaries: Record<TraineeYearCode, string> = {
  ME1: "Construir a base: ética, avaliação e farmacologia em módulos curtos e interativos.",
  ME2: "Integrar monitorização, obstetrícia e bloqueios periféricos com casos guiados.",
  ME3: "Simulações complexas com trauma, cardiovascular e neurocirurgia."
};

export default async function TrilhasPage() {
  const profile = await requireModuleAccess("tracks");
  const years = await fetchCurriculumYears();
  const yearSnapshots = await Promise.all(
    years.map(async (year) => {
      const tracks = await fetchLearningTracksByYear(year.code, profile.institution_id);
      const modulesByTrack = await Promise.all(tracks.map((track) => fetchLearningModulesForTrack(track.id)));
      const allModules = modulesByTrack.flat();
      const moduleProgress = isTraineeRole(profile.role)
        ? await fetchTraineeModuleProgress(profile.id, allModules.map((module) => module.id))
        : [];

      const lessonCountsByModule = new Map(
        (
          await Promise.all(
            allModules.map(async (module) => [module.id, (await fetchLessonsForModule(module.id)).length] as const)
          )
        ).map(([moduleId, count]) => [moduleId, count])
      );

      return {
        year,
        tracks,
        modulesByTrack,
        moduleProgress,
        lessonCountsByModule
      };
    })
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <ModuleNavigationStrip activeHref="/trilhas" />

        <header className="space-y-3">
          <Badge>Trilhas oficiais</Badge>
          <h1 className="text-3xl font-semibold">Trilhas de estudo por ano</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cada trilha conecta tópicos SBA a módulos, lições e checkpoints práticos. O progresso do trainee aparece
            diretamente no catálogo para facilitar retomada.
          </p>
        </header>

        {yearSnapshots.map(({ year, tracks, modulesByTrack, moduleProgress, lessonCountsByModule }) => (
          <section key={year.id} className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/90 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{year.code}</h2>
              <Link
                href={`/trilhas/${year.code.toLowerCase()}` as Parameters<typeof Link>[0]["href"]}
                className="text-sm font-semibold text-primary"
              >
                Ver trilhas
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">{yearSummaries[year.code]}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {tracks.slice(0, 2).map((track, trackIndex) => {
                const modules = modulesByTrack[trackIndex] ?? [];
                const totalLessons = modules.reduce(
                  (sum, module) => sum + (lessonCountsByModule.get(module.id) ?? 0),
                  0
                );
                const progressItems = moduleProgress.filter((item) =>
                  modules.some((module) => module.id === item.module_id)
                );
                const progressPercent =
                  progressItems.length > 0
                    ? Math.round(
                        progressItems.reduce((sum, item) => sum + Number(item.completion_percent ?? 0), 0) /
                          progressItems.length
                      )
                    : undefined;
                const trackHref = `/trilhas/track/${track.id}` as Parameters<typeof Link>[0]["href"];

                return (
                  <TrackCard
                    key={track.id}
                    title={track.title}
                    description={track.description}
                    duration={track.estimated_minutes}
                    href={trackHref}
                    lessons={totalLessons}
                    progressPercent={progressPercent}
                    metadata={`${modules.length} módulos`}
                  />
                );
              })}
              {tracks.length === 0 ? (
                <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                  Nenhuma trilha disponível para este ano ainda.
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
