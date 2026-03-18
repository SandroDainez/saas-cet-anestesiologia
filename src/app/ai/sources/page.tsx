import { Metadata } from "next";

import { PromptTemplateCard } from "@/components/ai/prompt-template-card";
import { SourceCard } from "@/components/content-management/source-card";
import { SourceSectionCard } from "@/components/ai/source-section-card";
import { buildHybridGenerationPlan } from "@/services/ai/hybrid-source-policy";
import { discoverContentLibraryFiles } from "@/services/content-library/library-discovery";
import { getContentLibraryExtractionPreviews } from "@/services/content-library/library-extraction";
import { getContentLibrarySnapshot } from "@/services/content-library/library-index";
import { fetchContentSourceSections, fetchContentSources, fetchAIPromptTemplates } from "@/services/db/modules";
import type { ContentSourceSection } from "@/types/database";

export const metadata: Metadata = {
  title: "Biblioteca de fontes"
};

export default async function AISourcesPage() {
  const [sources, templates, librarySnapshot, hybridPlan, discoveryReport, extractionPreviews] = await Promise.all([
    fetchContentSources(),
    fetchAIPromptTemplates(),
    getContentLibrarySnapshot(),
    buildHybridGenerationPlan({
      objective: "Apoiar geração de conteúdo teórico, provas, emergências e estudo interativo",
      recommendedUsage: ["theory", "interactive-study", "questions", "exams", "emergencies", "surgery-guides"]
    }),
    discoverContentLibraryFiles(),
    getContentLibraryExtractionPreviews()
  ]);

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
        <section className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold">Biblioteca de fontes científicas</h1>
            <p className="text-sm text-muted-foreground">
              Documentos indexados, biblioteca local complementar, política híbrida de uso e templates de prompt aprovados.
            </p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <LibraryStat label="Fontes no banco" value={`${sources.length}`} />
            <LibraryStat label="Arquivos indexados" value={`${librarySnapshot.stats.totalIndexedSources}`} />
            <LibraryStat label="Arquivos presentes" value={`${librarySnapshot.stats.existingFiles}`} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Política híbrida</p>
            <div className="mt-4 space-y-3">
              {hybridPlan.policy.priorityOrder.map((step, index) => (
                <div key={step} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  {index + 1}. {step}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Regra editorial</p>
            <div className="mt-4 space-y-3">
              {hybridPlan.policy.behaviorNotes.map((note) => (
                <div key={note} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                  {note}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Biblioteca local complementar</h2>
            <p className="text-sm text-muted-foreground">
              Arquivos colocados em `content-library/` e usados junto com o material já indexado no banco e a pesquisa por IA.
            </p>
          </div>
          {librarySnapshot.sources.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground">
              Nenhum arquivo local indexado ainda. Use `content-library/index.json` para registrar o material novo.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {librarySnapshot.sources.map((source) => (
                <article key={source.id} className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{source.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {source.sourceType} · {source.topLevelFolder} · {source.fileExtension || "arquivo"}
                      </p>
                    </div>
                    <span className="rounded-full border border-border/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {source.fileExists ? "disponível" : "faltando"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {source.applicability.map((item) => (
                      <span key={item} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {source.usage.map((item) => (
                      <span key={item} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                  {source.notes ? <p className="mt-3 text-sm text-muted-foreground">{source.notes}</p> : null}
                  <p className="mt-3 text-xs text-muted-foreground">{source.filePath}</p>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Prévias extraídas da biblioteca local</h2>
            <p className="text-sm text-muted-foreground">
              Trechos locais disponíveis para apoiar rastreabilidade, revisão e composição híbrida de conteúdo.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {extractionPreviews.map((preview) => (
              <article key={preview.sourceId} className="rounded-[1.5rem] border border-border/70 bg-card/80 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{preview.filePath}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {preview.status} · {preview.method}
                    </p>
                  </div>
                  <span className="rounded-full border border-border/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {preview.sectionCount} trechos
                  </span>
                </div>
                {preview.note ? <p className="mt-3 text-sm text-muted-foreground">{preview.note}</p> : null}
                {preview.sections.length ? (
                  <div className="mt-4 space-y-3">
                    {preview.sections.map((section) => (
                      <div key={section.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                          {section.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold">{section.title}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{section.excerpt}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
        <section className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Arquivos não catalogados</p>
            {discoveryReport.unindexedFiles.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Nenhum arquivo novo pendente de catalogação.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {discoveryReport.unindexedFiles.map((item) => (
                  <div key={item.relativePath} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                    <p className="text-sm font-semibold">{item.relativePath}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.topLevelFolder} · {item.fileExtension || "arquivo"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Sugestões automáticas</p>
            {discoveryReport.suggestions.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Sem sugestões pendentes no momento.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {discoveryReport.suggestions.map((item) => (
                  <article key={item.filePath} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.sourceType} · prioridade {item.priority}
                        </p>
                      </div>
                      <span className="rounded-full border border-border/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {item.id}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.applicability.map((year) => (
                        <span key={year} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                          {year}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.usage.map((usage) => (
                        <span key={usage} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                          {usage}
                        </span>
                      ))}
                    </div>
                    {item.topics.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.topics.map((topic) => (
                          <span key={topic} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                            {topic}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-3 text-xs text-muted-foreground">{item.reason}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
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

function LibraryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
