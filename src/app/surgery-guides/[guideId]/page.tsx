import { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { EducationalScopeBanner } from "@/components/surgery-guides/educational-scope-banner";
import { GuideChecklistPanel } from "@/components/surgery-guides/guide-checklist-panel";
import { GuideReferenceList } from "@/components/surgery-guides/guide-reference-list";
import { GuideSectionCard } from "@/components/surgery-guides/guide-section-card";
import { GuideVariantCard } from "@/components/surgery-guides/guide-variant-card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchSurgeryGuideById } from "@/services/db/modules";
import { EditorialStatusBadge } from "@/components/content-management/editorial-status-badge";

export const metadata: Metadata = {
  title: "Guia cirúrgico"
};

const contextLabels: Record<string, string> = {
  elective: "Eletiva",
  urgent: "Urgente",
  ambulatory: "Ambulatório",
  inpatient: "Internação"
};

const patientLabels: Record<string, string> = {
  adult: "Adulto",
  obstetric: "Obstétrica",
  pediatric: "Pediátrica"
};

export default async function SurgeryGuideDetailPage({ params }: { params: Promise<{ guideId: string }> }) {
  await requireModuleAccess("surgery-guides", { onDenied: "notFound" });
  const { guideId } = await params;
  const detail = await fetchSurgeryGuideById(guideId);

  if (!detail) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-10">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Guia não encontrado.
          </div>
        </main>
      </div>
    );
  }

  const { guide, surgery, contexts, patientTypes, suggestedYears, variants, references } = detail;

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <section className="space-y-3">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Badge>{surgery.procedure_name}</Badge>
            <span>
              {surgery.specialty} · {surgery.complexity_level}
            </span>
          </div>
          <EditorialStatusBadge status={guide.status} />
          <h1 className="text-3xl font-semibold">{guide.title}</h1>
          <p className="text-sm text-muted-foreground">{guide.summary}</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {contexts.map((context) => (
              <span key={context} className="rounded-full border border-border/70 px-3 py-1">
                {contextLabels[context] ?? context}
              </span>
            ))}
          {patientTypes.map((type) => (
            <span key={type} className="rounded-full border border-border/70 px-3 py-1">
              {patientLabels[type] ?? type}
            </span>
          ))}
            {suggestedYears.map((year) => (
              <span key={year} className="rounded-full border border-border/70 px-3 py-1">
                {year}
              </span>
            ))}
          </div>
        </section>

        <EducationalScopeBanner
          notice={guide.educational_scope_notice}
          contexts={contexts}
          patientTypes={patientTypes}
          suggestedYears={suggestedYears}
          status={guide.status}
          lastReviewed={new Date(guide.updated_at).toLocaleDateString("pt-BR")}
        />

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <GuideSectionCard title="Resumo do procedimento" content={guide.summary} />
            <GuideSectionCard
              title="Objetivos anestésicos"
              list={guide.checklist_jsonb.objectives}
            />
            <GuideSectionCard
              title="Avaliação pré-operatória relevante"
              content={guide.preop_considerations_markdown}
            />
            <GuideSectionCard title="Monitorização sugerida" content={guide.monitoring_markdown} />
            <GuideSectionCard
              title="Técnica anestésica sugerida"
              content={guide.anesthetic_approach_markdown}
            />
            <GuideSectionCard
              title="Alternativas de técnica"
              list={guide.checklist_jsonb.alternatives}
            />
            <GuideSectionCard
              title="Estratégia de medicações"
              content={guide.medication_strategy_markdown}
            />
            <GuideSectionCard title="Analgesia" content={guide.analgesia_plan_markdown} />
            <GuideSectionCard title="Plano pós-operatório" content={guide.postop_plan_markdown} />
            <GuideSectionCard title="Riscos e armadilhas" content={guide.risks_and_pitfalls_markdown} />
            <GuideChecklistPanel checklist={guide.checklist_jsonb} />
            {variants.length ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Variantes</h2>
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <GuideVariantCard key={variant.id} variant={variant} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            <GuideSectionCard
              title="Checklist clínico rápido"
              content="Revise itens mínimos antes da indução."
              list={guide.checklist_jsonb.entries?.map((entry) => entry.label)}
            />
            <GuideReferenceList references={references} />
          </div>
        </section>
      </main>
    </div>
  );
}
