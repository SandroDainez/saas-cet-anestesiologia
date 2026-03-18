import { promises as fs } from "node:fs";

import { getContentLibrarySnapshot } from "@/services/content-library/library-index";
import type {
  ContentLibrarySourceSummary,
  LocalLibraryExtractedSection,
  LocalLibraryExtractionPreview
} from "@/types/database";

const TEXT_EXTENSIONS = new Set(["txt", "md", "markdown", "csv", "json"]);

function splitIntoSections(text: string): LocalLibraryExtractedSection[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const blocks = normalized
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  return blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const title = lines[0]?.slice(0, 90) ?? `Trecho ${index + 1}`;
    const excerpt = block.slice(0, 420);

    return {
      id: `section-${index + 1}`,
      label: `Trecho ${index + 1}`,
      title,
      excerpt
    };
  });
}

async function extractPreview(source: ContentLibrarySourceSummary): Promise<LocalLibraryExtractionPreview> {
  if (!source.fileExists) {
    return {
      sourceId: source.id,
      filePath: source.filePath,
      status: "missing_file",
      method: "unsupported",
      sectionCount: 0,
      sections: [],
      note: "Arquivo ausente no disco."
    };
  }

  if (!TEXT_EXTENSIONS.has(source.fileExtension)) {
    return {
      sourceId: source.id,
      filePath: source.filePath,
      status: "unsupported",
      method: "unsupported",
      sectionCount: 0,
      sections: [],
      note: "Prévia textual indisponível para esta extensão no pipeline atual."
    };
  }

  try {
    const raw = await fs.readFile(source.absolutePath, "utf8");
    const text = source.fileExtension === "json" ? JSON.stringify(JSON.parse(raw), null, 2) : raw;
    const sections = splitIntoSections(text);

    return {
      sourceId: source.id,
      filePath: source.filePath,
      status: "ready",
      method: source.fileExtension === "json" ? "json_stringify" : "plain_text",
      sectionCount: sections.length,
      sections,
      note: sections.length ? "Prévia local gerada a partir do arquivo do workspace." : "Arquivo lido, mas sem trechos úteis."
    };
  } catch (error) {
    return {
      sourceId: source.id,
      filePath: source.filePath,
      status: "error",
      method: "unsupported",
      sectionCount: 0,
      sections: [],
      note: error instanceof Error ? error.message : "Falha ao gerar prévia local."
    };
  }
}

export async function getContentLibraryExtractionPreviews() {
  const snapshot = await getContentLibrarySnapshot();

  return Promise.all(snapshot.sources.map((source) => extractPreview(source)));
}

export async function getContentLibraryExtractionPreviewById(sourceId: string) {
  const snapshot = await getContentLibrarySnapshot();
  const source = snapshot.sources.find((item) => item.id === sourceId);
  if (!source) {
    return null;
  }

  return extractPreview(source);
}
