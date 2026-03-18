import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HighlightCardData } from "@/features/dashboard/data/dashboard-content";

export function HighlightCard({ title, body, icon: Icon }: HighlightCardData) {
  return (
    <Card className="h-full border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,250,255,0.86))]">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(15,118,201,0.12),rgba(20,184,166,0.2))] p-3 text-primary">
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
