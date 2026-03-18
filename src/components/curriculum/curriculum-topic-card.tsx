import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CurriculumTopicCardProps {
  title: string;
  description?: string | null;
  subtopicsCount?: number;
  href: Parameters<typeof Link>[0]["href"];
  pointNumber: number;
}

export function CurriculumTopicCard({ title, description, subtopicsCount = 0, href, pointNumber }: CurriculumTopicCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="justify-between gap-2">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{`Item ${pointNumber}`}</p>
        </div>
        <Badge>{subtopicsCount} subitens</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Link href={href}>
          <span className="text-sm font-semibold text-primary">Ver detalhes</span>
        </Link>
      </CardContent>
    </Card>
  );
}
