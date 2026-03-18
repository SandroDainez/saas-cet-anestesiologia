import type { LocalLibraryExtractionPreview } from "@/types/database";

export interface EditorialSynthesis {
  keyPoints: string[];
  cautions: string[];
  nextActions: string[];
}

function normalizeSentences(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .split(/[\n\.]+/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 20);
}

function unique(items: string[]) {
  return items.filter((item, index) => items.findIndex((candidate) => candidate === item) === index);
}

export function buildEditorialSynthesis(input: {
  primaryText?: string | null;
  localPreviews?: LocalLibraryExtractionPreview[];
}): EditorialSynthesis {
  const primarySentences = normalizeSentences(input.primaryText ?? "");
  const localSentences = (input.localPreviews ?? [])
    .flatMap((preview) => preview.sections)
    .flatMap((section) => normalizeSentences(section.excerpt));

  const all = unique([...primarySentences, ...localSentences]);

  return {
    keyPoints: all.slice(0, 3),
    cautions: all.filter((item) => /risco|cuidado|evit|falha|complica|instabil|revis/i.test(item)).slice(0, 3),
    nextActions: all.filter((item) => /monitor|revis|planej|avali|chec|profil|conduta/i.test(item)).slice(0, 3)
  };
}
