import Link from "next/link";
import { notFound } from "next/navigation";

import { TrackCard } from "@/components/learning/track-card";
import { Badge } from "@/components/ui/badge";
import { isTraineeRole, requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchLearningModulesForTrack,
  fetchLearningTracksByYear,
  fetchLessonsForModule,
  fetchTraineeModuleProgress
} from "@/services/db/modules";
import { getCompetencyYearSummary } from "@/services/curriculum/competency-matrix";
import type { TraineeYearCode } from "@/types/database";

const validYears: TraineeYearCode[] = ["ME1", "ME2", "ME3"];

const yearDescriptions: Record<TraineeYearCode, string> = {
  ME1: "Trilhas para consolidar os fundamentos e preparar a rotina de plantão.",
  ME2: "Trilhas com foco em obstetrícia, bloqueios e monitorização avançada.",
  ME3: "Trilhas de emergência, trauma e casos complexos."
};

interface TrilhasYearProps {
  params: Promise<{
    year?: string | string[];
  }>;
}

export default async function TrilhasYearPage({ params }: TrilhasYearProps) {
  const profile = await requireModuleAccess("tracks", { onDenied: "notFound" });
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

  const tracks = await fetchLearningTracksByYear(yearCode, profile.institution_id);
  const competencySummary = getCompetencyYearSummary(yearCode);
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <header className="rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Trilhas {yearCode}</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Trilhas de estudo do {yearCode}</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">{yearDescriptions[yearCode]}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <YearMetric label="Trilhas" value={tracks.length} />
                <YearMetric label="Módulos" value={allModules.length} />
                <YearMetric
                  label="Lições"
                  value={Array.from(lessonCountsByModule.values()).reduce((sum, count) => sum + count, 0)}
                />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm lg:max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Escopo do ano</p>
              <div className="mt-3 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Esta página deve conter apenas trilhas compatíveis com {yearCode}.
                </p>
                {competencySummary ? (
                  <div className="flex flex-wrap gap-2">
                    {competencySummary.coverageDomains.slice(0, 4).map((domain) => (
                      <span key={domain.id} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                        {domain.title}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Fluxo recomendado</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <TrilhaStep title="1. Abrir trilha" description="Escolha um bloco do próprio ano." />
              <TrilhaStep title="2. Fechar módulo" description="Evite pular entre módulos sem concluir a sequência." />
              <TrilhaStep title="3. Praticar no fim" description="Leve a trilha para questões e prova do mesmo escopo." />
            </div>
          </div>
          {competencySummary ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Competências relacionadas</p>
              <div className="mt-4 space-y-3">
                {competencySummary.competencies.slice(0, 3).map((competency) => (
                  <div key={competency.id} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                    <p className="text-sm font-semibold">{competency.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{competency.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {tracks.length === 0 ? (
          <p className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
            Ainda não há trilhas configuradas para {yearCode}.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tracks.map((track, index) => {
              const modules = modulesByTrack[index] ?? [];
              const progressItems = moduleProgress.filter((item) =>
                modules.some((module) => module.id === item.module_id)
              );
              const totalLessons = modules.reduce(
                (sum, module) => sum + (lessonCountsByModule.get(module.id) ?? 0),
                0
              );
              const trackHref = `/trilhas/track/${track.id}` as Parameters<typeof Link>[0]["href"];

              return (
                <TrackCard
                  key={track.id}
                  title={track.title}
                  description={track.description}
                  duration={track.estimated_minutes}
                  href={trackHref}
                  lessons={totalLessons}
                  progressPercent={
                    progressItems.length > 0
                      ? Math.round(
                          progressItems.reduce((sum, item) => sum + Number(item.completion_percent ?? 0), 0) /
                            progressItems.length
                        )
                      : undefined
                  }
                  metadata={`${modules.length} módulos nesta trilha`}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function YearMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function TrilhaStep({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
