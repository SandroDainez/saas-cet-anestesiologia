import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailedContentViewProps {
  markdown?: string | null;
  references?: string[];
  status: string;
  lastReviewed?: string | null;
}

export function DetailedContentView({ markdown, references, status, lastReviewed }: DetailedContentViewProps) {
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
