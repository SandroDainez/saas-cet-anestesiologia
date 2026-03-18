import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GuideAnestheticPlanCard({
  title,
  content,
  accent
}: {
  title: string;
  content?: string | null;
  accent?: string;
}) {
  if (!content?.trim()) {
    return null;
  }

  return (
    <Card className="border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,249,255,0.86))]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">{title}</CardTitle>
        {accent ? <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{accent}</p> : null}
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        <p className="whitespace-pre-line">{content}</p>
      </CardContent>
    </Card>
  );
}
