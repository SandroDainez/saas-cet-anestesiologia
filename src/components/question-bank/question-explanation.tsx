import type { LocalLibraryExtractionPreview, QuestionReference } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionExplanationProps {
  rationale?: string | null;
  references?: QuestionReference[];
  localHighlights?: LocalLibraryExtractionPreview[];
}

export function QuestionExplanation({ rationale, references, localHighlights = [] }: QuestionExplanationProps) {
  return (
    <Card className="space-y-3">
      <CardHeader className="space-y-1">
        <CardTitle>Explicação comentada</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comentários baseados em guidelines oficiais e esclarecimentos para fixar o raciocínio.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-foreground">{rationale ?? "Sem comentário adicional disponível no momento."}</p>
        </div>
        {localHighlights.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Apoio local complementar</p>
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
        {references && references.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Fontes científicas</p>
            {references.map((reference) => (
              <div key={reference.id} className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                <p className="font-semibold">{reference.citation_label ?? "Fonte não identificada"}</p>
                {reference.cited_excerpt ? <p className="text-xs text-muted-foreground">{reference.cited_excerpt}</p> : null}
                {reference.page_or_section ? (
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    {reference.page_or_section}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhuma referência cadastrada ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
