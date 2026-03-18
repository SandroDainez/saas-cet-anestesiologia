import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocalEditorialInsight } from "@/services/content-library/library-editorial-insights";

export function LocalInsightPanel({
  title,
  description,
  insights
}: {
  title: string;
  description?: string;
  insights: LocalEditorialInsight[];
}) {
  if (!insights.length) {
    return null;
  }

  return (
    <Card className="space-y-3 border border-border/60">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {insights.map((insight) => (
          <div key={`${insight.label}-${insight.detail}`} className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="font-semibold text-foreground">{insight.label}</p>
            <p className="mt-2">{insight.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
