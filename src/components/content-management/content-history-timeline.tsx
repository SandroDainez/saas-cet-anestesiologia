import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentVersionTimelineEntry } from "@/types/database";

import { ReviewDecisionPanel } from "./review-decision-panel";

export function ContentHistoryTimeline({ entries }: { entries: ContentVersionTimelineEntry[] }) {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>Histórico editorial</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length ? (
          entries.map(({ version, reviews }) => (
            <div key={version.id} className="space-y-2 rounded-2xl border border-border/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Versão {version.version_number}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {new Date(version.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{version.summary}</p>
              <div className="space-y-2">
                {reviews.length ? (
                  reviews.map((review) => <ReviewDecisionPanel key={review.id} review={review} />)
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhuma revisão registrada para esta versão.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Ainda não há versões registradas.</p>
        )}
      </CardContent>
    </Card>
  );
}
