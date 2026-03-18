import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentLibrarySourceSummary } from "@/types/database";

export function LocalSourceList({
  title,
  description,
  sources
}: {
  title: string;
  description?: string;
  sources: ContentLibrarySourceSummary[];
}) {
  return (
    <Card className="space-y-3 border border-border/60">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {sources.length ? (
          sources.map((source) => (
            <div key={source.id} className="rounded-2xl border border-border/60 bg-background/70 p-3">
              <p className="font-semibold text-foreground">{source.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {source.sourceType} · {source.priority}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {source.applicability.map((year) => (
                  <span key={year} className="rounded-full border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em]">
                    {year}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{source.filePath}</p>
            </div>
          ))
        ) : (
          <p>Biblioteca local sem fonte complementar catalogada para este tema ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
