import { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ContentItemCard } from "@/components/content-management/content-item-card";
import { fetchContentSummaries, fetchEditorialQueue } from "@/services/db/modules";

export const metadata: Metadata = {
  title: "Gestão editorial"
};

export default async function ContentManagementPage() {
  const [summaries, queue] = await Promise.all([fetchContentSummaries(), fetchEditorialQueue()]);
  const queuePreview = queue.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-3">
          <Badge>Editorial & IA</Badge>
          <h1 className="text-3xl font-semibold">Gestão de conteúdo e governança científica</h1>
          <p className="text-sm text-muted-foreground">
            Central editorial com histórico de versões, fila de revisão e rastreabilidade de fontes.
          </p>
        </section>

        <section className="space-y-4 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {summaries.length} itens publicados · {queue.length} versões aguardando revisão
            </div>
            <Link href="/content-management/queue">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Ver fila de revisão
              </span>
            </Link>
          </div>
          {queuePreview.length ? (
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {queuePreview.map((entry) => (
                <span key={entry.version.id} className="rounded-full border border-muted-foreground/40 px-3 py-1">
                  {entry.item.title} · Versão {entry.version.version_number}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Fila vazia. Todos os conteúdos padrão estão atualizados.
            </p>
          )}
        </section>

        <section className="space-y-4">
          {summaries.map((summary) => (
            <ContentItemCard key={summary.item.id} summary={summary} />
          ))}
        </section>
      </main>
    </div>
  );
}
