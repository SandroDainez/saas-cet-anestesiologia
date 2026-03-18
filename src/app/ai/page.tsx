import { Metadata } from "next";
import Link from "next/link";

import { GenerationReadinessCard } from "@/components/ai/generation-readiness-card";
import { buttonVariants } from "@/components/ui/button";
import { fetchLibraryIngestionJobs } from "@/services/ai/library-ingestion-jobs";
import { fetchGenerationReadiness } from "@/services/ai/generation-readiness";
import { fetchAIGenerationJobs, fetchAIValidationChecks, fetchAIPromptTemplates } from "@/services/db/modules";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "IA Assistida"
};

export default async function AIPage() {
  const [jobs, validations, templates, libraryJobs, readiness] = await Promise.all([
    fetchAIGenerationJobs(),
    fetchAIValidationChecks("job-cesarean-lesson"), // mostrações do total via mock
    fetchAIPromptTemplates(),
    fetchLibraryIngestionJobs(),
    fetchGenerationReadiness()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold">IA com RAG e rastreabilidade editorial</h1>
          <p className="text-sm text-muted-foreground">
            Jobs monitorados, fontes rastreáveis e validações automáticas antes de enviar para revisão humana.
          </p>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <Link href="/ai/sources" className="rounded-[1.5rem] border border-border/70 bg-card/80 p-6 transition hover:border-primary">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Biblioteca</p>
            <p className="text-2xl font-semibold">{templates.length}</p>
            <p className="text-sm text-muted-foreground">Templates e fontes científicas</p>
          </Link>
          <Link href="/ai/jobs" className="rounded-[1.5rem] border border-border/70 bg-card/80 p-6 transition hover:border-primary">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Jobs</p>
            <p className="text-2xl font-semibold">{jobs.length + libraryJobs.length}</p>
            <p className="text-sm text-muted-foreground">Gerações e ingestões candidatas</p>
          </Link>
          <Link
            href="/ai/validations"
            className="rounded-[1.5rem] border border-border/70 bg-card/80 p-6 transition hover:border-primary"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Validações</p>
            <p className="text-2xl font-semibold">{validations.length}</p>
            <p className="text-sm text-muted-foreground">Checagens automáticas</p>
          </Link>
        </section>
        <section className="rounded-[2rem] border border-border/60 bg-card/80 p-6">
          <h2 className="text-xl font-semibold">Fluxo seguro</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Geração de rascunho via IA (modelos rastreados).</li>
            <li>2. Associação automática de fontes locais, banco editorial e complementação externa;</li>
            <li>3. Detecção contínua de arquivos novos na biblioteca local;</li>
            <li>4. Envio para revisão humana antes da publicação.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/ai/jobs" className={cn(buttonVariants({}))}>
              Ver jobs
            </Link>
            <Link href="/ai/trace" className={cn(buttonVariants({ variant: "outline" }))}>
              Rastreabilidade geral
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Prontidão de geração</h2>
            <p className="text-sm text-muted-foreground">
              A estrutura do produto funciona sem a `content-library`. Quando houver material local, ele entra como reforço.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {readiness.map((item) => (
              <GenerationReadinessCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
