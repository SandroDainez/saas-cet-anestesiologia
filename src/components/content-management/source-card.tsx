import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentSource, ContentSourceSection } from "@/types/database";

export function SourceCard({ source, sections }: { source: ContentSource; sections?: ContentSourceSection[] }) {
  return (
    <Card className="space-y-3 border border-border/60">
      <CardHeader>
        <CardTitle>{source.title}</CardTitle>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {source.source_type} · {source.publisher ?? "Fonte institucional"}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {source.trust_level ? <p>Confiança: {source.trust_level}</p> : null}
        {source.publication_year ? <p>Ano: {source.publication_year}</p> : null}
        {sections?.length ? (
          <div className="space-y-1 pt-2 text-xs text-muted-foreground">
            {sections.map((section) => (
              <div key={section.id} className="rounded-2xl border border-border/60 p-2">
                <p className="font-semibold">{section.section_title ?? section.section_label}</p>
                <p>{section.excerpt_text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
