import { Card, CardContent } from "@/components/ui/card";

export function DomainPerformanceCard({
  domain,
  scorePercent,
  improvement,
  bestTopic,
  worstTopic
}: {
  domain: string;
  scorePercent: number;
  improvement?: string;
  bestTopic?: string;
  worstTopic?: string;
}) {
  return (
    <Card className="space-y-2 border border-border/60 bg-card/80">
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="text-base font-semibold">{domain}</p>
        <p>Pontuação média: {scorePercent}%</p>
        {improvement ? <p>Melhoria: {improvement}</p> : null}
        {bestTopic ? <p>Melhor tópico: {bestTopic}</p> : null}
        {worstTopic ? <p>Pior tópico: {worstTopic}</p> : null}
      </CardContent>
    </Card>
  );
}
