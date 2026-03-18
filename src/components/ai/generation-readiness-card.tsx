import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GenerationReadinessItem } from "@/types/database";

const modeLabels: Record<GenerationReadinessItem["mode"], string> = {
  internal_only: "Funciona sem biblioteca",
  hybrid_optional: "Biblioteca opcional",
  local_augmented: "Biblioteca já reforça"
};

export function GenerationReadinessCard({ item }: { item: GenerationReadinessItem }) {
  return (
    <Card className="space-y-3 border border-border/70">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">{item.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Modo</p>
          <p className="mt-2 font-semibold text-foreground">{modeLabels[item.mode]}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Fontes locais</p>
            <p className="mt-2 font-semibold text-foreground">{item.localSourceCount}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Sem biblioteca</p>
            <p className="mt-2 font-semibold text-foreground">{item.supportedWithoutLibrary ? "Sim" : "Não"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
