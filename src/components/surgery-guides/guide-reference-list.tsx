import type { LocalLibraryExtractionPreview } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GuideReferenceList({
  references,
  localHighlights = []
}: {
  references: string[];
  localHighlights?: LocalLibraryExtractionPreview[];
}) {
  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>Referências científicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        {localHighlights.length ? (
          <div className="space-y-2 rounded-2xl border border-border/60 bg-background/70 p-3 text-sm">
            <p className="font-semibold text-foreground">Biblioteca local em apoio</p>
            {localHighlights.slice(0, 2).map((preview) => (
              <div key={preview.sourceId}>
                <p className="font-medium text-foreground">{preview.filePath}</p>
                {preview.sections.slice(0, 1).map((section) => (
                  <p key={section.id} className="mt-1">{section.excerpt}</p>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {references.length ? (
          references.map((reference) => <p key={reference}>{reference}</p>)
        ) : (
          <p>Referências em validação editorial.</p>
        )}
      </CardContent>
    </Card>
  );
}
