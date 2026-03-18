import { buildHybridGenerationPlan } from "@/services/ai/hybrid-source-policy";
import { discoverContentLibraryFiles } from "@/services/content-library/library-discovery";
import type { AIGenerationJob, ContentLibraryCatalogSuggestion } from "@/types/database";

const LIBRARY_INGESTION_PREFIX = "library-ingest-";

function toSyntheticJob(suggestion: ContentLibraryCatalogSuggestion): AIGenerationJob {
  return {
    id: `${LIBRARY_INGESTION_PREFIX}${suggestion.id}`,
    institution_id: null,
    content_item_id: null,
    requested_by: "content-library:auto-discovery",
    job_type: "summarize_sources",
    status: "queued",
    input_payload: {
      source: "content-library",
      suggestion,
      flow: "local_library_ingestion"
    },
    output_payload: null,
    model_name: "hybrid-library-policy",
    generation_prompt_version: "library-discovery-v1",
    started_at: null,
    completed_at: null,
    error_message: null,
    created_at: new Date().toISOString()
  };
}

export async function fetchLibraryIngestionJobs(): Promise<AIGenerationJob[]> {
  const report = await discoverContentLibraryFiles();
  return report.suggestions.map(toSyntheticJob);
}

export async function fetchLibraryIngestionJobById(jobId: string) {
  if (!jobId.startsWith(LIBRARY_INGESTION_PREFIX)) {
    return null;
  }

  const report = await discoverContentLibraryFiles();
  const suggestionId = jobId.replace(LIBRARY_INGESTION_PREFIX, "");
  const suggestion = report.suggestions.find((item) => item.id === suggestionId);

  if (!suggestion) {
    return null;
  }

  const job = toSyntheticJob(suggestion);
  const plan = await buildHybridGenerationPlan({
    objective: `Catalogar e integrar a fonte local "${suggestion.title}"`,
    preferredYears: suggestion.applicability,
    recommendedUsage: suggestion.usage
  });

  return {
    job,
    suggestion,
    plan
  };
}
