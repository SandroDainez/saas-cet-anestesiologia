import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIJobStatusBadge } from "./ai-job-status-badge";
import { AIValidationBadge } from "./ai-validation-badge";
import type { AIGenerationJobTrace } from "@/types/database";
import { SourceCard } from "@/components/content-management/source-card";
import { SourceSectionCard } from "./source-section-card";

export function GenerationTracePanel({ trace }: { trace: AIGenerationJobTrace }) {
  const { job, sources, validations } = trace;

  return (
    <Card className="space-y-4">
      <CardHeader className="space-y-2">
        <CardTitle>Rastreabilidade de geração IA</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          <AIJobStatusBadge status={job.status} />
          <span className="text-xs text-muted-foreground">Tipo: {job.job_type}</span>
          <span className="text-xs text-muted-foreground">Modelo: {job.model_name ?? "não informado"}</span>
          <span className="text-xs text-muted-foreground">
            Prompt: {job.generation_prompt_version ?? "sem versão"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="space-y-1">
          <p className="font-semibold">Entrada</p>
          <pre className="rounded-2xl border border-border/60 bg-background px-3 py-2 text-xs font-mono break-words">
            {JSON.stringify(job.input_payload, null, 2)}
          </pre>
        </div>
        {job.output_payload ? (
          <div className="space-y-1">
            <p className="font-semibold">Resultado</p>
            <pre className="rounded-2xl border border-border/60 bg-background px-3 py-2 text-xs font-mono break-words">
              {JSON.stringify(job.output_payload, null, 2)}
            </pre>
          </div>
        ) : null}
        <div className="space-y-2">
          <p className="font-semibold text-xs uppercase tracking-[0.3em]">Validações automáticas</p>
          <div className="space-y-2">
            {validations.length ? (
              validations.map((validation) => (
                <div key={validation.id} className="flex flex-wrap items-center gap-2">
                  <AIValidationBadge result={validation.result} />
                  <span className="text-xs text-muted-foreground">{validation.check_type}</span>
                  {validation.details ? <span className="text-xs text-muted-foreground">{validation.details}</span> : null}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Nenhuma validação registrada.</p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-xs uppercase tracking-[0.3em]">Fontes vinculadas</p>
          {sources.length ? (
            sources.map((source) => <SourceCard key={source.id} source={source} />)
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma fonte associada.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
