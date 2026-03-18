import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsSectionCard({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-3 border border-border/60 bg-card/90">
      <CardHeader className="space-y-1 px-4 py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="px-4 py-3">{children}</CardContent>
    </Card>
  );
}
