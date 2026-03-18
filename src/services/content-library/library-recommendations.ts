import { getContentLibrarySnapshot } from "@/services/content-library/library-index";
import type { ContentLibrarySourceSummary, LocalLibraryUsage, TraineeYearCode } from "@/types/database";

function scoreTopicMatch(source: ContentLibrarySourceSummary, keywords: string[]) {
  const haystack = `${source.title} ${source.filePath} ${source.topics.join(" ")}`.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) continue;
    if (haystack.includes(normalized)) {
      score += 2;
    }
  }

  return score;
}

export async function recommendContentLibrarySources(input: {
  usage: LocalLibraryUsage;
  preferredYears?: TraineeYearCode[];
  keywords?: string[];
  limit?: number;
}) {
  const snapshot = await getContentLibrarySnapshot();
  const preferredYears = input.preferredYears ?? [];
  const keywords = input.keywords ?? [];
  const limit = input.limit ?? 4;

  return snapshot.sources
    .filter((source) => {
      if (!source.fileExists) return false;
      if (!source.usage.includes(input.usage)) return false;
      if (preferredYears.length > 0 && !preferredYears.some((year) => source.applicability.includes(year))) {
        return false;
      }
      return true;
    })
    .map((source) => ({
      source,
      score: scoreTopicMatch(source, keywords) + (source.priority === "critical" ? 4 : source.priority === "high" ? 3 : source.priority === "medium" ? 2 : 1)
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.source);
}
