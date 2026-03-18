import { Metadata } from "next";

import { ReferenceListPanel } from "@/components/content-management/reference-list-panel";
import { SourceCard } from "@/components/content-management/source-card";
import {
  fetchContentItemById,
  fetchContentLatestVersion,
  fetchContentReferences,
  fetchContentSourceSections,
  fetchContentSources
} from "@/services/db/modules";
import type { ContentSourceSection } from "@/types/database";

export const metadata: Metadata = {
  title: "Referências científicas"
};

export default async function ContentReferencesPage({ params }: { params: Promise<{ contentId: string }> }) {
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
  const sources = await fetchContentSources();
  const sectionsMap = new Map<string, ContentSourceSection[]>();

  await Promise.all(
    references.map(async (reference) => {
      if (!reference.content_source_id || sectionsMap.has(reference.content_source_id)) {
        return;
      }
      const sections = await fetchContentSourceSections(reference.content_source_id);
      sectionsMap.set(reference.content_source_id, sections);
    })
  );

  const referenceSources = references
    .map((reference) => sources.find((source) => source.id === reference.content_source_id))
    .filter((source): source is typeof sources[number] => Boolean(source));

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Referências e fontes</h1>
        <p className="text-sm text-muted-foreground">
          Toda IA utilizada foi rastreada, e nenhum conteúdo crítico é publicado sem revisão humana.
        </p>
      </section>
      <section className="space-y-4">
        <ReferenceListPanel references={references} />
        {referenceSources.map((source) => (
          <SourceCard key={source.id} source={source} sections={sectionsMap.get(source.id) ?? []} />
        ))}
      </section>
    </div>
  );
}
