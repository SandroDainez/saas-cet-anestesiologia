"use server";

import { createServerClient } from "@/lib/supabase/server";
import { discoverContentLibraryFiles } from "@/services/content-library/library-discovery";
import { getContentLibraryExtractionPreviewById } from "@/services/content-library/library-extraction";
import { revalidatePath } from "next/cache";

export async function publishContentLibrarySource(formData: FormData) {
  const suggestionId = formData.get("suggestionId");
  if (!suggestionId || typeof suggestionId !== "string") {
    throw new Error("Sugestão inválida.");
  }

  const discovery = await discoverContentLibraryFiles();
  const suggestion = discovery.suggestions.find((item) => item.id === suggestionId);
  if (!suggestion) {
    throw new Error("Sugestão não encontrada.");
  }

  const supabase = await createServerClient();
  const now = new Date().toISOString();
  const sourceId = `local-${suggestionId}`;

  await supabase.from("content_sources").upsert(
    {
      id: sourceId,
      title: suggestion.title,
      source_type: `local_${suggestion.sourceType}`,
      publisher: "Admin upload",
      source_url: suggestion.filePath,
      trust_level: suggestion.priority,
      active: true,
      created_at: now,
      updated_at: now
    },
    { onConflict: "id" }
  );

  const preview = await getContentLibraryExtractionPreviewById(suggestionId);
  const sections =
    preview && preview.sections.length
      ? preview.sections.map((section, index) => ({
          id: `${sourceId}-section-${section.id}`,
          content_source_id: sourceId,
          section_label: section.label,
          section_title: section.title,
          excerpt_text: section.excerpt,
          page_start: index + 1,
          page_end: index + 1,
          metadata_jsonb: {
            extraction_status: preview.status,
            extraction_method: preview.method,
            file_path: preview.filePath
          },
          created_at: now
        }))
      : [
          {
            id: `${sourceId}-section-placeholder`,
            content_source_id: sourceId,
            section_label: "Prévia local",
            section_title: "Aguardando extração",
            excerpt_text: preview?.note ?? "Nenhum trecho disponível.",
            metadata_jsonb: {
              extraction_status: preview?.status ?? "missing_file",
              file_path: preview?.filePath ?? suggestion.filePath
            },
            created_at: now
          }
        ];

  await supabase.from("content_source_sections").upsert(sections, { onConflict: "id" });
  revalidatePath("/ai/sources");
  revalidatePath("/dashboard/admin");
}
