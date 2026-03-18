import type { LocalLibraryExtractionPreview } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailedContentViewProps {
  markdown?: string | null;
  references?: string[];
  status: string;
  lastReviewed?: string | null;
  localHighlights?: LocalLibraryExtractionPreview[];
}

export function DetailedContentView({
  markdown,
  references,
  status,
  lastReviewed,
  localHighlights = []
}: DetailedContentViewProps) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>Conteúdo detalhado</CardTitle>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Status editorial: {status} · Revisado em {lastReviewed ?? "n/a"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground whitespace-pre-line">{markdown ?? "Conteúdo em revisão."}</p>
        {localHighlights.length ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Apoio local</p>
            {localHighlights.slice(0, 2).map((preview) => (
              <div key={preview.sourceId} className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                <p className="font-semibold">{preview.filePath}</p>
                {preview.sections.slice(0, 1).map((section) => (
                  <div key={section.id} className="mt-2 text-muted-foreground">
                    <p className="font-medium text-foreground">{section.title}</p>
                    <p className="mt-1">{section.excerpt}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {references && references.length ? (
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold">Referências científicas</p>
            {references.map((reference) => (
              <p key={reference}>{reference}</p>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Referências aguardando revisão editorial.</p>
        )}
      </CardContent>
    </Card>
  );
}
