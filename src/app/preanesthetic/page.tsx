import { Metadata } from "next";

import { LocalInsightPanel } from "@/components/content-management/local-insight-panel";
import { Badge } from "@/components/ui/badge";
import { PreanestheticFilters } from "@/components/preanesthetic/preanesthetic-filters";
import { PreanestheticTopicCard } from "@/components/preanesthetic/preanesthetic-topic-card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { buildLocalEditorialInsights } from "@/services/content-library/library-editorial-insights";
import { fetchPreanestheticTopics } from "@/services/db/modules";
import type { PreanestheticCategory, PreanestheticTopic } from "@/types/database";

export const metadata: Metadata = {
  title: "Pré-anestésico"
};

const categoryLabels: Record<PreanestheticCategory, string> = {
  fasting: "Jejum",
  medication_continue: "Medicações para manter",
  medication_suspend: "Medicações para suspender",
  risk_assessment: "Estratificação de risco",
  lab_tests: "Exames complementares",
  special_population: "Populações especiais",
  checklist: "Checklists"
};

interface PreanestheticPageProps {
  searchParams?: Promise<{
    category?: string | string[];
    q?: string | string[];
  }>;
}
const firstValidCategory = (value?: string | string[]): PreanestheticCategory | undefined => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && categoryLabels[candidate as PreanestheticCategory]) {
    return candidate as PreanestheticCategory;
  }
  return undefined;
};

const getQueryParam = (value?: string | string[]) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

export default async function PreanestheticPage({ searchParams }: PreanestheticPageProps) {
  const profile = await requireModuleAccess("preanesthetic");
  const resolvedSearchParams = (await (searchParams ?? Promise.resolve({}))) as {
    category?: string | string[];
    q?: string | string[];
  };
  const category = firstValidCategory(resolvedSearchParams.category);
  const query = getQueryParam(resolvedSearchParams.q);

  const categories = (Object.entries(categoryLabels) as [PreanestheticCategory, string][]).map(([key, label]) => ({
    key,
    label
  }));

  const topics = await fetchPreanestheticTopics({ category, query });
  const localContext = await getRecommendedLocalContext({
    usage: "theory",
    preferredYears: profile.training_year ? [profile.training_year] : [],
    keywords: [
      category ? categoryLabels[category] : "",
      query ?? "",
      "pré-anestésico",
      "avaliacao",
      "jejum",
      "risco"
    ],
    limit: 4
  });
  const localInsights = buildLocalEditorialInsights(localContext.previews, 3);

  const referenceCounts = topics.map(() => 1);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-3">
          <Badge>Pré-anestésico</Badge>
          <h1 className="text-3xl font-semibold">Preparação segura antes da anestesia</h1>
          <p className="text-sm text-muted-foreground">
            Conteúdo revisado editorialmente, com referências claras e foco na governança clínica.
          </p>
        </section>

        <section>
          <PreanestheticFilters categories={categories} selectedCategory={category} initialQuery={query} />
        </section>

        <LocalInsightPanel
          title="Destaques da biblioteca local"
          description="Trechos da content-library que podem orientar a revisão deste módulo."
          insights={localInsights}
        />

        <section className="space-y-4">
          {topics.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhum tópico encontrado. Ajuste a busca ou explore outra categoria.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {topics.map((topic, index) => (
                <PreanestheticTopicCard
                  key={topic.id}
                  topic={topic}
                  quickReferenceCount={referenceCounts[index] ?? 0}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
