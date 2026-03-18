import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EditorialReview } from "@/types/database";

export function ReviewDecisionPanel({ review }: { review: EditorialReview }) {
  return (
    <Card className="space-y-2 border border-border/60 bg-card/70">
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm">Revisão editorial</CardTitle>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Decisão: {review.decision}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Revisor: {review.reviewer_user_id}</p>
        <p>Data: {new Date(review.reviewed_at).toLocaleString("pt-BR")}</p>
        {review.comments ? <p className="text-xs text-muted-foreground">Comentários: {review.comments}</p> : null}
      </CardContent>
    </Card>
  );
}
