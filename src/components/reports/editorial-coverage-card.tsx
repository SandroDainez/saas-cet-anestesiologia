import { Card, CardContent } from "@/components/ui/card";

export function EditorialCoverageCard({
  coveragePercent,
  itemsPublished,
  inReview,
  criticalPending
}: {
  coveragePercent: number;
  itemsPublished: number;
  inReview: number;
  criticalPending: number;
}) {
  return (
    <Card className="space-y-3 border border-border/60 bg-card/80">
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="text-base font-semibold">Cobertura editorial</p>
        <p>Conteúdo aprovado: {coveragePercent}%</p>
        <p>Itens publicados: {itemsPublished}</p>
        <p>Em revisão: {inReview}</p>
        <p>Críticos pendentes: {criticalPending}</p>
      </CardContent>
    </Card>
  );
}
