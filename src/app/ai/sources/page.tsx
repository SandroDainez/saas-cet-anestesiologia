import { Metadata } from "next";

import { PromptTemplateCard } from "@/components/ai/prompt-template-card";
import { SourceCard } from "@/components/content-management/source-card";
import { SourceSectionCard } from "@/components/ai/source-section-card";
import { fetchContentSourceSections, fetchContentSources, fetchAIPromptTemplates } from "@/services/db/modules";
import type { ContentSourceSection } from "@/types/database";

export const metadata: Metadata = {
  title: "Biblioteca de fontes"
};

export default async function AISourcesPage() {
  const [sources, templates] = await Promise.all([fetchContentSources(), fetchAIPromptTemplates()]);

  const sectionsMap = new Map<string, ContentSourceSection[]>();
  await Promise.all(
    sources.map(async (source) => {
      const sections = await fetchContentSourceSections(source.id);
      sectionsMap.set(source.id, sections);
    })
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold">Biblioteca de fontes científicas</h1>
          <p className="text-sm text-muted-foreground">
            Documentos indexados, nível de confiança, seções acessíveis e templates de prompt aprovados.
          </p>
        </section>
        <section className="space-y-4">
          {sources.map((source) => (
            <div key={source.id} className="space-y-3 rounded-[2rem] border border-border/70 bg-card/80 p-6">
              <SourceCard source={source} sections={sectionsMap.get(source.id) ?? []} />
              {(sectionsMap.get(source.id) ?? []).map((section) => (
                <div key={section.id} className="grid gap-3 md:grid-cols-2">
                  <SourceSectionCard section={section} />
                </div>
              ))}
            </div>
          ))}
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Templates de prompt autorizados</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <PromptTemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
