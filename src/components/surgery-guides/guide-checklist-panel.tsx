import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SurgeryGuideChecklist } from "@/types/database";

export function GuideChecklistPanel({ checklist }: { checklist: SurgeryGuideChecklist }) {
  const entries = checklist.entries ?? [];
  const confidence = checklist.metadata?.confidence_level;

  return (
    <Card className="space-y-3">
      <CardHeader className="space-y-1">
        <CardTitle>Checklist resumido</CardTitle>
        {confidence ? (
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Confiança editorial: {confidence}
          </p>
        ) : (
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Confiança editorial aguardando validação
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {entries.length ? (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li key={entry.label} className="flex flex-col gap-1 rounded-2xl border border-border/60 p-3">
                <span className="font-semibold text-foreground">{entry.label}</span>
                {entry.detail ? <span className="text-xs text-muted-foreground">{entry.detail}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Checklist aguardando edição.</p>
        )}
      </CardContent>
    </Card>
  );
}
