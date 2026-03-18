import { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { EducationalScopeBanner } from "@/components/surgery-guides/educational-scope-banner";
import { GuideAnestheticPlanCard } from "@/components/surgery-guides/guide-anesthetic-plan-card";
import { GuideChecklistPanel } from "@/components/surgery-guides/guide-checklist-panel";
import { GuideReferenceList } from "@/components/surgery-guides/guide-reference-list";
import { GuideSectionCard } from "@/components/surgery-guides/guide-section-card";
import { GuideVariantCard } from "@/components/surgery-guides/guide-variant-card";
import { EditorialSynthesisPanel } from "@/components/content-management/editorial-synthesis-panel";
import { LocalSourceInlineCallout } from "@/components/content-management/local-source-inline-callout";
import { LocalSourceExcerptPanel } from "@/components/content-management/local-source-excerpt-panel";
import { LocalSourceList } from "@/components/content-management/local-source-list";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { buildEditorialSynthesis } from "@/services/content-library/editorial-synthesis";
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
  const localContext = await getRecommendedLocalContext({
    usage: "surgery-guides",
    preferredYears: suggestedYears,
    keywords: [guide.title, surgery.procedure_name, surgery.specialty, ...(guide.summary ? [guide.summary] : [])],
    limit: 4
  });
  const synthesis = buildEditorialSynthesis({
    primaryText: [
      guide.summary,
      guide.preop_considerations_markdown,
      guide.monitoring_markdown,
      guide.anesthetic_approach_markdown,
      guide.medication_strategy_markdown,
      guide.analgesia_plan_markdown,
      guide.postop_plan_markdown,
      guide.risks_and_pitfalls_markdown
    ]
      .filter(Boolean)
      .join("\n"),
    localPreviews: localContext.previews
  });

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

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/95 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Leitura operacional
            </p>
            <h2 className="mt-2 text-xl font-semibold">Técnica, monitorização, drogas e riscos na mesma sequência</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta página deve ser usada como guia de consulta rápida: técnica principal, monitorização mínima,
              medicações usuais, adjuvantes, profilaxias e armadilhas do procedimento.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <GuideQuickFact
              label="Contextos"
              value={contexts.length ? contexts.map((context) => contextLabels[context] ?? context).join(" · ") : "—"}
            />
            <GuideQuickFact
              label="Perfis"
              value={patientTypes.length ? patientTypes.map((type) => patientLabels[type] ?? type).join(" · ") : "—"}
            />
            <GuideQuickFact label="Anos sugeridos" value={suggestedYears.length ? suggestedYears.join(" · ") : "—"} />
            <GuideQuickFact label="Variantes" value={`${variants.length}`} />
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
            <LocalSourceInlineCallout title="Apoio local para este guia" previews={localContext.previews} />
            <EditorialSynthesisPanel title="Síntese clínica do guia" synthesis={synthesis} />
            <div className="grid gap-4 md:grid-cols-2">
              <GuideAnestheticPlanCard
                title="Técnica mais recomendada"
                accent="Estratégia principal"
                content={guide.anesthetic_approach_markdown}
              />
              <GuideAnestheticPlanCard
                title="Monitorização mínima e avançada"
                accent="Segurança perioperatória"
                content={guide.monitoring_markdown}
              />
              <GuideAnestheticPlanCard
                title="Medicações e doses usuais"
                accent="Indução, manutenção e vasoativos"
                content={guide.medication_strategy_markdown}
              />
              <GuideAnestheticPlanCard
                title="Analgesia, adjuvantes e profilaxias"
                accent="Conforto, PONV, antibiótico e tromboprofilaxia"
                content={guide.analgesia_plan_markdown}
              />
            </div>
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
            <GuideReferenceList references={references} localHighlights={localContext.previews} />
            <LocalSourceList
              title="Biblioteca local relacionada"
              description="Fontes da content-library com uso sugerido para este procedimento."
              sources={localContext.recommendedSources}
            />
            <LocalSourceExcerptPanel
              title="Trechos locais recomendados"
              description="Excertos da biblioteca local que podem complementar este guia."
              previews={localContext.previews}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function GuideQuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/90 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
