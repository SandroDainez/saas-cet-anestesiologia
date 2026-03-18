import { Metadata } from "next";

import { GenerationTracePanel } from "@/components/ai/generation-trace-panel";
import { fetchAIGenerationJobs, fetchAIGenerationJobTrace } from "@/services/db/modules";

export const metadata: Metadata = {
  title: "Rastreabilidade IA"
};

export default async function AITracePage() {
  const jobs = await fetchAIGenerationJobs();
  const traces = await Promise.all(
    jobs.map(async (job) => ({
      job,
      trace: await fetchAIGenerationJobTrace(job.id)
    }))
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold">Rastreabilidade de conteúdo IA</h1>
          <p className="text-sm text-muted-foreground">
            Cada geração mostra modelos, prompts, fontes e validações antes de entrar no fluxo editorial.
          </p>
        </section>
        <section className="space-y-6">
          {traces.map(({ job, trace }) =>
            trace ? (
              <GenerationTracePanel key={job.id} trace={trace} />
            ) : (
              <div
                key={job.id}
                className="rounded-2xl border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground"
              >
                Rastreabilidade indisponível para o job {job.id}.
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}
