import { ContentVersionCard } from "@/components/content-management/content-version-card";
import { fetchContentTimeline } from "@/services/db/modules";

export default async function ContentVersionsPage({ params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  const timeline = await fetchContentTimeline(contentId);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Versões</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de versões com marcação de IA e status editorial. Nenhuma versão sensível é publicada automaticamente.
        </p>
      </section>
      <section className="space-y-4">
        {timeline.length ? (
          timeline.map(({ version }) => <ContentVersionCard key={version.id} version={version} />)
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground">
            Nenhuma versão disponível.
          </div>
        )}
      </section>
    </div>
  );
}
