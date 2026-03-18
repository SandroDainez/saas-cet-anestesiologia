import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { PreanestheticTopic } from "@/types/database";

interface PreanestheticTopicCardProps {
  topic: PreanestheticTopic;
  quickReferenceCount?: number;
}

export function PreanestheticTopicCard({ topic, quickReferenceCount }: PreanestheticTopicCardProps) {
  return (
    <Card className="space-y-4">
      <CardHeader className="space-y-2">
        <Badge className="bg-secondary/10 text-secondary-foreground">{topic.category}</Badge>
        <CardTitle>{topic.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3">{topic.summary}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Última revisão {topic.last_reviewed_at ? new Date(topic.last_reviewed_at).toLocaleDateString("pt-BR") : "sem data"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Referências: {quickReferenceCount ?? 0}</span>
          <Link href={`/preanesthetic/${topic.id}`}>
            <Button variant="outline" size="sm">
              Ver tópico
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
