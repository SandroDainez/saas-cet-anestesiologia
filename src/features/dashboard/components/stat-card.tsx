import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatCardData } from "@/features/dashboard/data/dashboard-content";

export function StatCard({ title, value, description }: StatCardData) {
  return (
    <Card className="overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,246,255,0.82))]">
      <CardHeader className="pb-3">
        <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.24em]">{title}</CardDescription>
        <CardTitle className="text-xl md:text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="border-t border-border/60 pt-4">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
