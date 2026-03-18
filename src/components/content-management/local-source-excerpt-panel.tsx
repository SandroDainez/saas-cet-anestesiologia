import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocalLibraryExtractionPreview } from "@/types/database";

export function LocalSourceExcerptPanel({
  title,
  description,
  previews
}: {
  title: string;
  description?: string;
  previews: LocalLibraryExtractionPreview[];
}) {
  return (
    <Card className="space-y-3 border border-border/60">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {previews.length ? (
          previews.map((preview) => (
            <div key={preview.sourceId} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{preview.filePath}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {preview.status} · {preview.method}
                  </p>
                </div>
                <span className="rounded-full border border-border/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {preview.sectionCount} trechos
                </span>
              </div>
              {preview.sections.length ? (
                <div className="mt-3 space-y-3">
                  {preview.sections.slice(0, 2).map((section) => (
                    <div key={section.id} className="rounded-2xl border border-border/60 bg-card/70 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {section.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{section.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{section.excerpt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{preview.note ?? "Prévia indisponível."}</p>
              )}
            </div>
          ))
        ) : (
          <p>Nenhum trecho local recomendado para este conteúdo ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
