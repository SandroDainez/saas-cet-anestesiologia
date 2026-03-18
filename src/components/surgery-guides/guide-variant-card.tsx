import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SurgeryGuideVariant } from "@/types/database";

export function GuideVariantCard({ variant }: { variant: SurgeryGuideVariant }) {
  const contextEntries = Object.entries(variant.context_jsonb || {});

  return (
    <Card className="space-y-3 border-emerald-300/60 bg-emerald-50/30">
      <CardHeader className="space-y-1">
        <CardTitle>{variant.variant_label}</CardTitle>
        {contextEntries.length ? (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {contextEntries.map(([key, value]) => (
              <span key={key} className="rounded-full border border-muted-foreground/40 px-3 py-1">
                {`${key}: ${value}`}
              </span>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="whitespace-pre-line">{variant.content_markdown ?? "Conteúdo da variante em preparação."}</p>
      </CardContent>
    </Card>
  );
}
