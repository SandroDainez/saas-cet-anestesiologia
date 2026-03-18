import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HighlightCardData } from "@/features/dashboard/data/dashboard-content";

export function HighlightCard({ title, body, icon: Icon }: HighlightCardData) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="rounded-2xl bg-accent p-3 text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
