import { Metadata } from "next";

import { LocalInsightPanel } from "@/components/content-management/local-insight-panel";
import { Badge } from "@/components/ui/badge";
import { SurgeryGuideCard } from "@/components/surgery-guides/surgery-guide-card";
import { SurgeryGuideFilter } from "@/components/surgery-guides/surgery-guide-filter";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { getRecommendedLocalContext } from "@/services/content-library/library-context";
import { buildLocalEditorialInsights } from "@/services/content-library/library-editorial-insights";
import { fetchCurriculumYears, fetchSurgeryGuides } from "@/services/db/modules";
import type {
  DifficultyLevel,
  SurgeryGuideFilters,
  SurgeryGuideSummary,
  SurgerySpecialty
} from "@/types/database";

export const metadata: Metadata = {
  title: "Guias anestésicos por cirurgia"
};

const specialtyLabels: Record<SurgerySpecialty, string> = {
  general: "Cirúrgica geral",
  ortho: "Ortopedia",
  obstetric: "Obstetrícia",
  urology: "Urologia",
  thoracic: "Torácica",
  cardiac: "Cardíaca",
  neuro: "Neurocirurgia",
  pediatric: "Pediátrica",
  ent: "Otorrino",
  ophthalmology: "Oftalmologia",
  plastic: "Plástica",
  other: "Outras"
};

const complexityLabels: Record<DifficultyLevel, string> = {
  basic: "Básica",
  intermediate: "Intermediária",
  advanced: "Avançada"
};

const patientTypeOptions = [
  { value: "adult", label: "Adulto" },
  { value: "obstetric", label: "Obstétrica" },
  { value: "pediatric", label: "Pediátrica" }
];

const contextOptions = [
  { value: "elective", label: "Eletiva" },
  { value: "urgent", label: "Urgência" },
  { value: "ambulatory", label: "Ambulatório" },
  { value: "inpatient", label: "Internação" }
];

interface SurgeryGuidesPageProps {
  searchParams?: Promise<{
    specialty?: string | string[];
    complexity?: string | string[];
    suggestedYear?: string | string[];
    patientType?: string | string[];
    context?: string | string[];
    q?: string | string[];
  }>;
}

const firstValue = (value?: string | string[]) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

export default async function SurgeryGuidesPage({ searchParams }: SurgeryGuidesPageProps) {
  const profile = await requireModuleAccess("surgery-guides");
  const resolvedSearchParams = (await (searchParams ?? Promise.resolve({}))) as {
    specialty?: string | string[];
    complexity?: string | string[];
    suggestedYear?: string | string[];
    patientType?: string | string[];
    context?: string | string[];
    q?: string | string[];
  };
  const filters: SurgeryGuideFilters = {
    specialty: firstValue(resolvedSearchParams.specialty) as SurgerySpecialty | undefined,
    complexity: firstValue(resolvedSearchParams.complexity) as DifficultyLevel | undefined,
    suggestedYear: firstValue(resolvedSearchParams.suggestedYear) as SurgeryGuideFilters["suggestedYear"],
    patientType: firstValue(resolvedSearchParams.patientType),
    context: firstValue(resolvedSearchParams.context),
    query: firstValue(resolvedSearchParams.q)
  };

  const guides = await fetchSurgeryGuides(filters);
  const years = await fetchCurriculumYears();
  const localContext = await getRecommendedLocalContext({
    usage: "surgery-guides",
    preferredYears: profile.training_year ? [profile.training_year] : [],
    keywords: [
      filters.specialty ?? "",
      filters.query ?? "",
      filters.context ?? "",
      filters.patientType ?? "",
      "tecnica",
      "monitorizacao",
      "profilaxia"
    ],
    limit: 4
  });
  const localInsights = buildLocalEditorialInsights(localContext.previews, 3);
  const yearOptions = years.map((year) => ({ value: year.code, label: year.name }));

  const specialtyOptions = Object.entries(specialtyLabels).map(([value, label]) => ({
    value: value as SurgerySpecialty,
    label
  }));

  const complexityOptions = Object.entries(complexityLabels).map(([value, label]) => ({
    value: value as DifficultyLevel,
    label
  }));

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <section className="space-y-3">
          <Badge>Guias anestésicos</Badge>
          <h1 className="text-3xl font-semibold">Decisões guiadas por cirurgia</h1>
          <p className="text-sm text-muted-foreground">
            Módulo editorial com foco em protocolos e governança clínica. Escolha filtros e acesse referências.
          </p>
        </section>

        <section>
          <SurgeryGuideFilter
            specialtyOptions={specialtyOptions}
            complexityOptions={complexityOptions}
            yearOptions={yearOptions}
            patientTypeOptions={patientTypeOptions}
            contextOptions={contextOptions}
            selected={filters}
          />
        </section>

        <LocalInsightPanel
          title="Destaques da biblioteca local"
          description="Trechos úteis para apoiar a leitura dos guias por cirurgia."
          insights={localInsights}
        />

        <section className="space-y-4">
          {guides.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
              Nenhum guia encontrado com os filtros selecionados. Ajuste os critérios ou tente novamente mais tarde.
            </div>
          ) : (
            <div className="space-y-4">
              {guides.map((guide) => (
                <SurgeryGuideCard key={guide.guide.id} summary={guide} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
