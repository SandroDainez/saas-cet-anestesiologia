import type {
  HybridEditorialPolicy,
  HybridGenerationPlan,
  LocalLibraryUsage,
  TraineeYearCode
} from "@/types/database";
import { findContentLibrarySourcesByUsage } from "@/services/content-library/library-index";

const hybridEditorialPolicy: HybridEditorialPolicy = {
  priorityOrder: [
    "published_internal_content",
    "content_library_local_sources",
    "external_ai_research",
    "ai_structured_generation"
  ],
  behaviorNotes: [
    "Se houver fonte local relevante, ela deve ser considerada antes da pesquisa externa.",
    "Pesquisa externa pode complementar lacunas, mas não deve ignorar material local existente.",
    "Conteúdo gerado deve registrar de onde vieram as fontes principais e complementares.",
    "Conflitos entre biblioteca local e geração complementar devem seguir para revisão editorial."
  ],
  requiresLocalSourcesFirst: true,
  allowExternalResearchWhenLocalExists: true
};

export async function buildHybridGenerationPlan(input: {
  objective: string;
  preferredYears?: TraineeYearCode[];
  recommendedUsage: LocalLibraryUsage[];
}): Promise<HybridGenerationPlan> {
  const preferredYears = input.preferredYears ?? [];

  const localSources = (
    await Promise.all(
      input.recommendedUsage.map((usage) => findContentLibrarySourcesByUsage(usage, preferredYears))
    )
  )
    .flat()
    .filter((source, index, array) => array.findIndex((item) => item.id === source.id) === index)
    .sort((left, right) => {
      const score = { critical: 4, high: 3, medium: 2, low: 1 };
      return score[right.priority] - score[left.priority];
    });

  return {
    objective: input.objective,
    preferredYears,
    recommendedUsage: input.recommendedUsage,
    localSources,
    policy: hybridEditorialPolicy
  };
}

export function getHybridEditorialPolicy() {
  return hybridEditorialPolicy;
}
