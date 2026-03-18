import { getContentLibraryExtractionPreviewById } from "@/services/content-library/library-extraction";
import { recommendContentLibrarySources } from "@/services/content-library/library-recommendations";
import type { LocalLibraryUsage, TraineeYearCode } from "@/types/database";

export async function getRecommendedLocalContext(input: {
  usage: LocalLibraryUsage;
  preferredYears?: TraineeYearCode[];
  keywords?: string[];
  limit?: number;
}) {
  const recommendedSources = await recommendContentLibrarySources(input);
  const previews = (
    await Promise.all(recommendedSources.map((source) => getContentLibraryExtractionPreviewById(source.id)))
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  return {
    recommendedSources,
    previews
  };
}
