import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentVersion } from "@/types/database";

import { EditorialStatusBadge } from "./editorial-status-badge";

export function ContentVersionCard({ version }: { version: ContentVersion }) {
  return (
    <Card className="space-y-3 border border-border/60">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle>Versão {version.version_number}</CardTitle>
          <EditorialStatusBadge status={version.review_status} />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Gerado por {version.generated_by_ai ? "IA" : "Editor"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p className="whitespace-pre-line">{version.summary}</p>
        <div className="space-y-1">
          {version.generation_model ? (
            <p className="text-xs font-semibold">Modelo: {version.generation_model}</p>
          ) : null}
          {version.generation_prompt_version ? (
            <p className="text-xs font-semibold">Prompt: {version.generation_prompt_version}</p>
          ) : null}
        </div>
        {version.review_notes ? (
          <p className="text-xs text-muted-foreground">Notas: {version.review_notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
