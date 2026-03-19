import type { LocalLibraryExtractionPreview, QuestionReference } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionExplanationProps {
  rationale?: string | null;
  references?: QuestionReference[];
  localHighlights?: LocalLibraryExtractionPreview[];
}

export function QuestionExplanation({ rationale, references, localHighlights = [] }: QuestionExplanationProps) {
  return (
    <Card className="space-y-4 border border-border/70 bg-card/95">
      <CardHeader className="space-y-2">
        <CardTitle>Explicação comentada</CardTitle>
        <p className="text-sm text-muted-foreground">
          A explicação precisa mostrar raciocínio, armadilhas e de onde veio a sustentação bibliográfica.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[1.25rem] border border-border/60 bg-background/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Racional clínico</p>
          <p className="mt-3 text-sm leading-6 text-foreground">
            {rationale ?? "Sem comentário adicional disponível no momento."}
          </p>
        </div>
        {localHighlights.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Apoio local complementar</p>
            {localHighlights.slice(0, 2).map((preview) => (
              <div key={preview.sourceId} className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4 text-sm">
                <p className="font-semibold text-foreground">{preview.filePath}</p>
                {preview.sections.slice(0, 1).map((section) => (
                  <div key={section.id} className="mt-2 text-muted-foreground">
                    <p className="font-medium text-foreground">{section.title}</p>
                    <p className="mt-2 leading-6">{section.excerpt}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {references && references.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Fontes e referências</p>
            {references.map((reference) => (
              <div key={reference.id} className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4 text-sm">
                <p className="font-semibold text-foreground">{reference.citation_label ?? "Fonte não identificada"}</p>
                {reference.cited_excerpt ? (
                  <p className="mt-2 leading-6 text-muted-foreground">{reference.cited_excerpt}</p>
                ) : (
                  <p className="mt-2 leading-6 text-muted-foreground">Trecho detalhado ainda não cadastrado.</p>
                )}
                {reference.page_or_section ? (
                  <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
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
