import { Metadata } from "next";

import { AIJobCard } from "@/components/ai/ai-job-card";
import { fetchLibraryIngestionJobs } from "@/services/ai/library-ingestion-jobs";
import { fetchAIGenerationJobs } from "@/services/db/modules";

export const metadata: Metadata = {
  title: "Jobs de IA"
};

export default async function AIJobsPage() {
  const [jobs, libraryJobs] = await Promise.all([fetchAIGenerationJobs(), fetchLibraryIngestionJobs()]);
  const allJobs = [...libraryJobs, ...jobs];

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold">Jobs de geração com IA</h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento de modelo, prompt, fontes, ingestão da biblioteca local e bloqueios antes da revisão humana.
          </p>
        </section>
        <section className="space-y-4">
          {allJobs.length ? (
            allJobs.map((job) => <AIJobCard key={job.id} job={job} />)
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground">
              Nenhum job registrado.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
