import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentSummary } from "@/types/database";

import { EditorialStatusBadge } from "./editorial-status-badge";

export function ContentItemCard({ summary }: { summary: ContentSummary }) {
  const { item, latestVersion, latestReviews } = summary;
  const lastReview = latestReviews[0];

  return (
    <Card className="space-y-3">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <EditorialStatusBadge status={item.status} />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Tipo: {item.content_type}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {latestVersion?.summary ?? "Nenhuma versão publicada ainda."}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {latestVersion ? (
            <span>Versão {latestVersion.version_number}</span>
          ) : (
            <span>Sem versões</span>
          )}
          {latestVersion?.generated_by_ai ? <Badge className="uppercase tracking-[0.3em]">IA</Badge> : null}
          {lastReview ? (
            <span>Revisado por {lastReview.reviewer_user_id} · {new Date(lastReview.reviewed_at).toLocaleDateString("pt-BR")}</span>
          ) : (
            <span>Fila de revisão está aberta</span>
          )}
        </div>
        <div className="flex justify-end">
          <Link href={`/content-management/${item.id}`}>
            <Button variant="ghost" size="sm">
              Ver gestão editorial
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
