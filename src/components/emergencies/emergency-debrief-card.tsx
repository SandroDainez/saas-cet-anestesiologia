import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmergencyDebriefCardProps {
  score: number;
  summary: string;
  recommend: string;
  onViewResult?: () => void;
  ctaLabel?: string;
}

export function EmergencyDebriefCard({ score, summary, recommend, onViewResult, ctaLabel = "Ver resultado" }: EmergencyDebriefCardProps) {
  return (
    <Card className="space-y-4">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold">Debriefing</CardTitle>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Pontuação: {score}%</p>
        <p className="text-sm text-muted-foreground">{recommend}</p>
        {onViewResult ? <Button onClick={onViewResult}>{ctaLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}
