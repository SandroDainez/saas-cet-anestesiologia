import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import {
  fetchCurriculumSubtopics,
  fetchCurriculumTopicById,
  fetchCurriculumYears,
  fetchLearningModulesForTrack,
  fetchLearningTracksByYear,
  fetchQuestionBankEntries
} from "@/services/db/modules";

interface TopicDetailPageProps {
  params: Promise<{
    topicId?: string | string[];
  }>;
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const profile = await requireModuleAccess("curriculum", { onDenied: "notFound" });
  const { topicId: rawId } = await params;
  if (typeof rawId !== "string" && !Array.isArray(rawId)) {
    notFound();
  }

  const topicId = Array.isArray(rawId) ? rawId[0] : rawId;
  if (typeof topicId !== "string") {
    notFound();
  }

  const topic = await fetchCurriculumTopicById(topicId);
  if (!topic) {
    notFound();
  }

  const years = await fetchCurriculumYears();
  const yearCode = years.find((year) => year.id === topic.curriculum_year_id)?.code;
  const [subtopics, questions, tracksByYear] = await Promise.all([
    fetchCurriculumSubtopics(topic.id),
    fetchQuestionBankEntries({ topicId: topic.id }, profile.institution_id),
    yearCode ? fetchLearningTracksByYear(yearCode, profile.institution_id) : Promise.resolve([])
  ]);
  const relatedTracks = (
    await Promise.all(
      tracksByYear.map(async (track) => ({
        track,
        modules: await fetchLearningModulesForTrack(track.id)
      }))
    )
  ).filter(({ modules }) => modules.some((module) => module.curriculum_topic_id === topic.id));

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <header className="space-y-2">
          <Badge>Detalhe curricular</Badge>
          <h1 className="text-3xl font-semibold">{topic.title}</h1>
          <p className="text-sm text-muted-foreground">{topic.description}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <MiniMetric label="Subitens" value={subtopics.length} />
          <MiniMetric label="Questões" value={questions.length} />
          <MiniMetric label="Trilhas" value={relatedTracks.length} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Subitens oficiais ({subtopics.length})</h2>
          {subtopics.length === 0 ? (
            <p className="rounded-[1.5rem] border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground">
              Nenhum subitem foi cadastrado para este tópico ainda.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {subtopics.map((subtopic) => (
                <Card key={subtopic.id} className="border-border/60">
                  <CardHeader>
                    <CardTitle>{subtopic.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{subtopic.description ?? "Conteúdo em produção"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
            <h2 className="text-lg font-semibold">Estudo guiado relacionado</h2>
            {relatedTracks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda não há módulos diretamente conectados a este tópico.</p>
            ) : (
              relatedTracks.map(({ track, modules }) => (
                <div key={track.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="font-semibold">{track.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{track.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {modules.filter((module) => module.curriculum_topic_id === topic.id).length} módulos conectados
                  </p>
                  <Link
                    href={`/trilhas/track/${track.id}` as Parameters<typeof Link>[0]["href"]}
                    className="mt-3 inline-flex text-sm font-semibold text-primary"
                  >
                    Abrir trilha
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6">
            <h2 className="text-lg font-semibold">Prática recomendada</h2>
            <p className="text-sm text-muted-foreground">
              Resolva questões deste tópico antes de avançar para provas completas.
            </p>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-sm font-semibold">{questions.length} questões disponíveis</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {yearCode ? `Alinhadas ao ano ${yearCode}.` : "Conteúdo transversal."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={{ pathname: "/question-bank", query: { topicId: topic.id } }}>
                  <Button size="sm">Resolver questões</Button>
                </Link>
                {yearCode ? (
                  <Link href={`/curriculum/${yearCode.toLowerCase()}` as Parameters<typeof Link>[0]["href"]}>
                    <Button size="sm" variant="outline">
                      Voltar ao ano
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
