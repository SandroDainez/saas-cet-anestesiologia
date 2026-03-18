import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  ContentLibraryIndex,
  ContentLibrarySnapshot,
  ContentLibrarySourceSummary,
  LocalLibraryUsage,
  TraineeYearCode
} from "@/types/database";

const CONTENT_LIBRARY_ROOT = path.join(process.cwd(), "content-library");
const CONTENT_LIBRARY_INDEX = path.join(CONTENT_LIBRARY_ROOT, "index.json");

const emptyUsageStats: Record<LocalLibraryUsage, number> = {
  theory: 0,
  "interactive-study": 0,
  questions: 0,
  exams: 0,
  emergencies: 0,
  "surgery-guides": 0,
  review: 0
};

const emptyApplicabilityStats: Record<TraineeYearCode, number> = {
  ME1: 0,
  ME2: 0,
  ME3: 0
};

const emptyIndex: ContentLibraryIndex = {
  version: 1,
  lastUpdated: new Date().toISOString().slice(0, 10),
  sources: []
};

async function fileExists(absolutePath: string) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

export async function readContentLibraryIndex(): Promise<ContentLibraryIndex> {
  try {
    const raw = await fs.readFile(CONTENT_LIBRARY_INDEX, "utf8");
    const parsed = JSON.parse(raw) as ContentLibraryIndex;
    return {
      version: parsed.version ?? 1,
      lastUpdated: parsed.lastUpdated ?? emptyIndex.lastUpdated,
      sources: parsed.sources ?? []
    };
  } catch {
    return emptyIndex;
  }
}

export async function getContentLibrarySnapshot(): Promise<ContentLibrarySnapshot> {
  const index = await readContentLibraryIndex();

  const sources: ContentLibrarySourceSummary[] = await Promise.all(
    index.sources.map(async (source) => {
      const absolutePath = path.join(CONTENT_LIBRARY_ROOT, source.filePath);
      const exists = await fileExists(absolutePath);
      const normalized = source.filePath.replaceAll("\\", "/");
      const topLevelFolder = normalized.split("/")[0] ?? "unknown";

      return {
        ...source,
        absolutePath,
        fileExists: exists,
        fileExtension: path.extname(source.filePath).replace(".", "").toLowerCase(),
        topLevelFolder
      };
    })
  );

  const stats = {
    totalIndexedSources: sources.length,
    existingFiles: sources.filter((source) => source.fileExists).length,
    missingFiles: sources.filter((source) => !source.fileExists).length,
    byUsage: { ...emptyUsageStats },
    byApplicability: { ...emptyApplicabilityStats }
  };

  for (const source of sources) {
    for (const usage of source.usage) {
      stats.byUsage[usage] += 1;
    }
    for (const applicability of source.applicability) {
      stats.byApplicability[applicability] += 1;
    }
  }

  return {
    index,
    sources,
    stats
  };
}

export async function findContentLibrarySourcesByUsage(
  usage: LocalLibraryUsage,
  preferredYears: TraineeYearCode[] = []
) {
  const snapshot = await getContentLibrarySnapshot();

  return snapshot.sources.filter((source) => {
    if (!source.fileExists) {
      return false;
    }

    if (!source.usage.includes(usage)) {
      return false;
    }

    if (preferredYears.length === 0) {
      return true;
    }

    return preferredYears.some((year) => source.applicability.includes(year));
  });
}
