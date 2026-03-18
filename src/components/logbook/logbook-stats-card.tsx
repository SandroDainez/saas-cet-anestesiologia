import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogbookStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  accent?: string;
}

export function LogbookStatsCard({ title, value, description, accent }: LogbookStatsCardProps) {
  return (
    <Card className="space-y-3">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        {accent ? <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{accent}</p> : null}
      </CardContent>
    </Card>
  );
}
