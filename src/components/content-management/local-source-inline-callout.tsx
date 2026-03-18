import type { LocalLibraryExtractionPreview } from "@/types/database";

export function LocalSourceInlineCallout({
  title,
  previews
}: {
  title: string;
  previews: LocalLibraryExtractionPreview[];
}) {
  if (!previews.length) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{title}</p>
      <div className="mt-4 grid gap-3">
        {previews.slice(0, 2).map((preview) => (
          <div key={preview.sourceId} className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="text-sm font-semibold text-foreground">{preview.filePath}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {preview.status} · {preview.method}
            </p>
            {preview.sections.length ? (
              <div className="mt-3 space-y-3">
                {preview.sections.slice(0, 1).map((section) => (
                  <div key={section.id}>
                    <p className="text-sm font-semibold text-foreground">{section.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{section.excerpt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{preview.note ?? "Sem trecho disponível."}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
