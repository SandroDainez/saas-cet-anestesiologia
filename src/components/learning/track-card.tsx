import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrackCardProps {
  title: string;
  description?: string | null;
  duration?: number | null;
  href: Parameters<typeof Link>[0]["href"];
  lessons?: number;
  progressPercent?: number;
  metadata?: string;
}

export function TrackCard({ title, description, duration, href, lessons = 0, progressPercent, metadata }: TrackCardProps) {
  return (
    <Card className="space-y-3">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge>{lessons} lições</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{duration ? `${duration} min` : "Duração estimada desconhecida"}</p>
        {typeof progressPercent === "number" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        ) : null}
        {metadata ? <p className="text-xs text-muted-foreground">{metadata}</p> : null}
        <Link href={href}>
          <Button variant="outline" size="sm">
            Explorar trilha
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
