import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EditorialSynthesis } from "@/services/content-library/editorial-synthesis";

export function EditorialSynthesisPanel({
  title,
  synthesis
}: {
  title: string;
  synthesis: EditorialSynthesis;
}) {
  const hasContent = synthesis.keyPoints.length || synthesis.cautions.length || synthesis.nextActions.length;
  if (!hasContent) {
    return null;
  }

  return (
    <Card className="space-y-3 border border-border/60">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {synthesis.keyPoints.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Pontos centrais</p>
            <ul className="space-y-2">
              {synthesis.keyPoints.map((item) => (
                <li key={item} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {synthesis.cautions.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Alertas</p>
            <ul className="space-y-2">
              {synthesis.cautions.map((item) => (
                <li key={item} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {synthesis.nextActions.length ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Próximo foco</p>
            <ul className="space-y-2">
              {synthesis.nextActions.map((item) => (
                <li key={item} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
