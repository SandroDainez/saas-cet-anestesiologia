import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { QuestionReference } from "@/types/database";

interface QuestionExplanationProps {
  rationale?: string | null;
  references?: QuestionReference[];
}

export function QuestionExplanation({ rationale, references }: QuestionExplanationProps) {
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
