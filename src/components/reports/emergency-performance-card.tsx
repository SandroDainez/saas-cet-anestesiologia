import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmergencyPerformanceCard({
  scenario,
  completed,
  successRate,
  confidenceChange
}: {
  scenario: string;
  completed: number;
  successRate: number;
  confidenceChange: number;
}) {
  return (
    <Card className="space-y-3 border border-border/60">
      <CardHeader>
        <CardTitle className="text-sm">{scenario}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Simulações concluídas: {completed}</p>
        <p>Taxa de sucesso: {successRate}%</p>
        <p>Confiança aumentou {confidenceChange} ponto(s)</p>
      </CardContent>
    </Card>
  );
}
