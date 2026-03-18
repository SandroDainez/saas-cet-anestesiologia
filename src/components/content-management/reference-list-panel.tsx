import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentReference } from "@/types/database";

export function ReferenceListPanel({ references }: { references: ContentReference[] }) {
  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>Referências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {references.length ? (
          references.map((reference) => (
            <div key={reference.id} className="rounded-2xl border border-border/60 p-3">
              <p className="font-semibold">{reference.citation_label ?? "Referência sem título"}</p>
              <p>{reference.cited_excerpt ?? "Sem trecho divulgado."}</p>
              {reference.note ? <p className="text-xs text-muted-foreground">{reference.note}</p> : null}
            </div>
          ))
        ) : (
          <p>Referências aguardando validação.</p>
        )}
      </CardContent>
    </Card>
  );
}
