import { Metadata } from "next";

import { ContentVersionCard } from "@/components/content-management/content-version-card";
import { fetchEditorialQueue } from "@/services/db/modules";

export const metadata: Metadata = {
  title: "Fila de revisão"
};

export default async function EditorialQueuePage() {
  const queue = await fetchEditorialQueue();

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold">Fila de revisão</h1>
          <p className="text-sm text-muted-foreground">
            Versões críticas aguardando decisão editorial. A publicação automática está desativada para conteúdos sensíveis.
          </p>
        </section>
        <section className="space-y-4">
          {queue.length ? (
            queue.map((entry) => (
              <ContentVersionCard key={entry.version.id} version={entry.version} />
            ))
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground">
              Não há versões pendentes no momento.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
