import { Metadata } from "next";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GenerationTracePanel } from "@/components/ai/generation-trace-panel";
import { AIJobStatusBadge } from "@/components/ai/ai-job-status-badge";
import { fetchAIGenerationJobTrace, fetchAIValidationChecks, fetchAIGenerationJobById } from "@/services/db/modules";

export const metadata: Metadata = {
  title: "Detalhe de job IA"
};

export default async function AIJobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await fetchAIGenerationJobById(jobId);
  if (!job) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Job não encontrado.
      </div>
    );
  }

  const [trace, validations] = await Promise.all([
    fetchAIGenerationJobTrace(job.id),
    fetchAIValidationChecks(job.id)
  ]);

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-[2rem] border border-border/70 bg-card/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">{job.job_type.replace(/_/g, " ")}</h1>
            <p className="text-sm text-muted-foreground">Solicitado por {job.requested_by}</p>
          </div>
          <AIJobStatusBadge status={job.status} />
        </div>
        {job.status === "blocked_no_source" ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertTriangle className="h-4 w-4" />
            <p>Bloqueado automaticamente: {job.error_message}</p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Modelo: {job.model_name ?? "—"}</span>
          <span>Prompt: {job.generation_prompt_version ?? "—"}</span>
          <span>Status: {job.status}</span>
        </div>
      </section>
      {trace ? <GenerationTracePanel trace={trace} /> : null}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Validações automáticas</h2>
        {validations.length ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            {validations.map((validation) => (
              <div key={validation.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 p-3">
                <span className="font-semibold">{validation.check_type}</span>
                <span>{validation.result}</span>
                {validation.details ? <span className="text-xs text-muted-foreground">{validation.details}</span> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm text-muted-foreground">
            Nenhuma validação executada para este job.
          </div>
        )}
      </section>
      <div className="flex justify-end">
        <Link href="/content-management" className={cn(buttonVariants({}))}>
          Ir para governança editorial
        </Link>
      </div>
    </div>
  );
}
