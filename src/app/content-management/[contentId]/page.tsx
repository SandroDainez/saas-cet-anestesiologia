import { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { ContentHistoryTimeline } from "@/components/content-management/content-history-timeline";
import { EditorialStatusBadge } from "@/components/content-management/editorial-status-badge";
import { ReferenceListPanel } from "@/components/content-management/reference-list-panel";
import { fetchContentItemById, fetchContentLatestVersion, fetchContentReferences, fetchContentTimeline } from "@/services/db/modules";

export const metadata: Metadata = {
  title: "Detalhe editorial"
};

export default async function ContentDetailPage({ params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  const item = await fetchContentItemById(contentId);
  if (!item) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Conteúdo não encontrado.
      </div>
    );
  }

  const latestVersion = await fetchContentLatestVersion(item.id);
  const references = latestVersion ? await fetchContentReferences(latestVersion.id) : [];
  const timeline = await fetchContentTimeline(item.id);

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-[2rem] border border-border/70 bg-card/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge>Conteúdo editorial</Badge>
            <h1 className="text-3xl font-semibold">{item.title}</h1>
            <p className="text-sm text-muted-foreground">Tipo: {item.content_type}</p>
          </div>
          <EditorialStatusBadge status={item.status} />
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <span>Versão atual: {latestVersion ? latestVersion.version_number : "n/a"}</span>
          <span>Atualizado em: {new Date(item.updated_at).toLocaleDateString("pt-BR")}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Este conteúdo exige revisão humana antes de publicação e está integrado ao sistema de IA segura e referências aprovadas.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <ContentHistoryTimeline entries={timeline} />
        </div>
          <div className="space-y-4">
            <ReferenceListPanel references={references} />
            <Badge className="text-xs font-semibold uppercase tracking-[0.3em]">
              Última revisão mostra {latestVersion?.generated_by_ai ? "IA" : "Editor humano"} na geração
            </Badge>
          </div>
      </section>
    </div>
  );
}
