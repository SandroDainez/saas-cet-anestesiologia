import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { QuickReferencePanel } from "@/components/preanesthetic/quick-reference-panel";
import { DetailedContentView } from "@/components/preanesthetic/detailed-content-view";
import { DecisionTreeView } from "@/components/preanesthetic/decision-tree-view";
import { TopicReferenceList } from "@/components/preanesthetic/topic-reference-list";
import { EmergencyConfidenceCard } from "@/components/emergencies/emergency-confidence-card";
import { EditorialStatusBadge } from "@/components/content-management/editorial-status-badge";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchContentReferences, fetchContentVersions, fetchPreanestheticTopicById } from "@/services/db/modules";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pré-anestésico"
};

interface TopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function PreanestheticTopicPage({ params }: TopicPageProps) {
  const profile = await requireModuleAccess("preanesthetic", { onDenied: "notFound" });
  const { topicId } = await params;
  const topic = await fetchPreanestheticTopicById(topicId);
  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-10">
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Tópico não encontrado.
          </div>
        </main>
      </div>
    );
  }

  const versions = await fetchContentVersions("item-jejuns");
  const references = await fetchContentReferences(versions[0]?.id ?? "");

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-3">
          <Badge>Pré-anestésico</Badge>
          <div className="flex items-center gap-2">
            <EditorialStatusBadge status={topic.status} />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Conteúdo clínico</span>
          </div>
          <h1 className="text-3xl font-semibold">{topic.title}</h1>
          <p className="text-sm text-muted-foreground">
            Todo o conteúdo clínico exige validação editorial e referências claras. Consulte o resumo e as referências
            antes da aplicação clínica.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <QuickReferencePanel quickReference={topic.quick_reference_jsonb} />
            <DetailedContentView
              markdown={topic.detailed_content_markdown}
              references={references.map((reference) => reference.citation_label ?? reference.cited_excerpt ?? "Fonte não identificada")}
              status={topic.status}
              lastReviewed={topic.last_reviewed_at}
            />
            <DecisionTreeView decisionTree={topic.decision_tree_jsonb} />
          </div>

          <div className="space-y-4">
            <TopicReferenceList
              references={references.map((reference) => reference.citation_label ?? reference.cited_excerpt ?? "Fonte sem título")}
            />
            <EmergencyConfidenceCard
              assessment={{
                id: `self-${topic.id}`,
                trainee_user_id: profile.id,
                scenario_id: topic.id,
                confidence_before: 3,
                confidence_after: 4,
                perceived_readiness: "ready_with_standard_supervision",
                created_at: new Date().toISOString()
              }}
            />
            <Link href="/preanesthetic">
              <span className="text-sm font-semibold text-primary">Voltar ao módulo pré-anestésico</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
