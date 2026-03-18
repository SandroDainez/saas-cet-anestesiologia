import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AIGenerationJob } from "@/types/database";

import { AIJobStatusBadge } from "./ai-job-status-badge";

export function AIJobCard({ job }: { job: AIGenerationJob }) {
  return (
    <Card className="space-y-3 border border-border/70">
      <CardHeader className="flex items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg">{job.job_type.replace(/_/g, " ")}</CardTitle>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {new Date(job.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <AIJobStatusBadge status={job.status} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Modelo: {job.model_name ?? "não informado"}</p>
        <p>Prompt: {job.generation_prompt_version ?? "sem versão"}</p>
        {job.error_message ? (
          <p className="text-xs text-rose-600">Bloqueio: {job.error_message}</p>
        ) : null}
        <div className="flex justify-end">
          <Link href={`/ai/jobs/${job.id}`}>
            <Button variant="outline" size="sm">
              Ver job
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
