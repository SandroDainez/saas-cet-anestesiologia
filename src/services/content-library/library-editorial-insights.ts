import type { LocalLibraryExtractionPreview } from "@/types/database";

export interface LocalEditorialInsight {
  label: string;
  detail: string;
}

export function buildLocalEditorialInsights(previews: LocalLibraryExtractionPreview[], limit = 3): LocalEditorialInsight[] {
  return previews
    .flatMap((preview) =>
      preview.sections.slice(0, 2).map((section, index) => ({
        label: index === 0 ? section.title : `${section.label} · ${section.title}`,
        detail: section.excerpt
      }))
    )
    .filter((item) => item.label.trim().length > 0 && item.detail.trim().length > 0)
    .slice(0, limit);
}
