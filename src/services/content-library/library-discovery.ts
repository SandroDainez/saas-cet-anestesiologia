import { promises as fs } from "node:fs";
import path from "node:path";

import { getContentLibrarySnapshot } from "@/services/content-library/library-index";
import type {
  ContentLibraryCatalogSuggestion,
  ContentLibraryDiscoveryItem,
  ContentLibraryDiscoveryReport,
  LibraryPriority,
  LocalLibrarySourceType,
  LocalLibraryUsage,
  TraineeYearCode
} from "@/types/database";

const CONTENT_LIBRARY_ROOT = path.join(process.cwd(), "content-library");
const IGNORED_FILES = new Set(["README.md", "index.json", ".DS_Store"]);
const IGNORED_EXTENSIONS = new Set(["json", "md", "gitkeep"]);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(absolute);
      }
      return [absolute];
    })
  );

  return files.flat();
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferSourceType(folder: string, filename: string): LocalLibrarySourceType {
  const text = `${folder} ${filename}`.toLowerCase();
  if (folder === "books") return "book";
  if (folder === "sba") return "sba_document";
  if (folder === "emergencies") return "protocol";
  if (folder === "questions") return "question_reference";
  if (text.includes("prova") || text.includes("exam")) return "exam_reference";
  if (text.includes("guideline") || text.includes("diretriz")) return "guideline";
  if (text.includes("artigo") || text.includes("article")) return "article";
  if (text.includes("apostila") || text.includes("handout")) return "handout";
  return "mixed";
}

function inferUsage(folder: string, filename: string): LocalLibraryUsage[] {
  const text = `${folder} ${filename}`.toLowerCase();
  const usage = new Set<LocalLibraryUsage>();

  if (folder === "books" || folder === "references" || folder === "sba") {
    usage.add("theory");
  }
  if (folder === "emergencies") {
    usage.add("emergencies");
    usage.add("interactive-study");
  }
  if (folder === "surgery-guides" || text.includes("cirurgia") || text.includes("procedimento")) {
    usage.add("surgery-guides");
  }
  if (folder === "questions" || text.includes("quest")) {
    usage.add("questions");
  }
  if (text.includes("prova") || text.includes("exam")) {
    usage.add("exams");
    usage.add("questions");
  }

  usage.add("review");

  if (usage.size === 1 && usage.has("review")) {
    usage.add("theory");
  }

  return Array.from(usage);
}

function inferApplicability(filename: string): TraineeYearCode[] {
  const text = filename.toLowerCase();
  const years: TraineeYearCode[] = [];

  if (text.includes("me1")) years.push("ME1");
  if (text.includes("me2")) years.push("ME2");
  if (text.includes("me3")) years.push("ME3");

  return years.length ? years : ["ME1", "ME2", "ME3"];
}

function inferTopics(filename: string, folder: string) {
  const text = `${folder} ${filename}`.toLowerCase();
  const topicMap = [
    "via-aerea",
    "obstetricia",
    "pediatria",
    "monitorizacao",
    "farmacologia",
    "analgesia",
    "hemodinamica",
    "trauma",
    "cardiovascular",
    "neuroeixo",
    "last",
    "anafilaxia",
    "hipertermia-maligna"
  ];

  return topicMap.filter((topic) => text.includes(topic.replaceAll("-", " ")) || text.includes(topic));
}

function inferPriority(folder: string, filename: string): LibraryPriority {
  const text = `${folder} ${filename}`.toLowerCase();
  if (folder === "emergencies" || text.includes("critico") || text.includes("crise")) return "critical";
  if (folder === "sba" || folder === "books" || text.includes("prova")) return "high";
  if (folder === "protocols" || folder === "surgery-guides") return "high";
  return "medium";
}

function buildSuggestion(item: ContentLibraryDiscoveryItem): ContentLibraryCatalogSuggestion {
  const filename = path.basename(item.relativePath, path.extname(item.relativePath));
  const title = filename
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sourceType = inferSourceType(item.topLevelFolder, filename);
  const usage = inferUsage(item.topLevelFolder, filename);
  const applicability = inferApplicability(filename);
  const topics = inferTopics(filename, item.topLevelFolder);
  const priority = inferPriority(item.topLevelFolder, filename);

  return {
    id: toSlug(filename),
    title: title.charAt(0).toUpperCase() + title.slice(1),
    filePath: item.relativePath,
    sourceType,
    usage,
    applicability,
    topics,
    priority,
    reason: `Inferido por pasta "${item.topLevelFolder}" e nome do arquivo.`
  };
}

export async function discoverContentLibraryFiles(): Promise<ContentLibraryDiscoveryReport> {
  const snapshot = await getContentLibrarySnapshot();
  const allFiles = await walk(CONTENT_LIBRARY_ROOT);

  const normalizedIndexed = new Set(snapshot.sources.map((source) => source.filePath.replaceAll("\\", "/")));

  const discovered: ContentLibraryDiscoveryItem[] = allFiles
    .map((absolutePath) => {
      const relativePath = path.relative(CONTENT_LIBRARY_ROOT, absolutePath).replaceAll("\\", "/");
      const fileExtension = path.extname(relativePath).replace(".", "").toLowerCase();
      const topLevelFolder = relativePath.split("/")[0] ?? "unknown";

      return {
        relativePath,
        absolutePath,
        fileExtension,
        topLevelFolder,
        isIndexed: normalizedIndexed.has(relativePath)
      };
    })
    .filter((item) => {
      const basename = path.basename(item.relativePath);
      if (IGNORED_FILES.has(basename)) return false;
      if (IGNORED_EXTENSIONS.has(item.fileExtension)) return false;
      return true;
    });

  const unindexedFiles = discovered.filter((item) => !item.isIndexed);
  const suggestions = unindexedFiles.map(buildSuggestion);

  return {
    indexed: snapshot.sources,
    unindexedFiles,
    suggestions
  };
}
