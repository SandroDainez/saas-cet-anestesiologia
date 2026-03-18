import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AIPromptTemplate } from "@/types/database";

export function PromptTemplateCard({ template }: { template: AIPromptTemplate }) {
  return (
    <Card className="space-y-3 border border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Versão {template.version}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {template.purpose ? <p>{template.purpose}</p> : null}
        <p className="rounded-2xl border border-border/60 bg-background px-3 py-2 font-mono text-xs">{template.template_text}</p>
      </CardContent>
    </Card>
  );
}
