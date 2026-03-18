import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentSourceSection } from "@/types/database";

export function SourceSectionCard({ section }: { section: ContentSourceSection }) {
  return (
    <Card className="border border-border/60">
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {section.section_label ?? "Seção recuperada"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="font-semibold">{section.section_title}</p>
        <p>{section.excerpt_text}</p>
      </CardContent>
    </Card>
  );
}
