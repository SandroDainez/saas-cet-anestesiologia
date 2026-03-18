import { findContentLibrarySourcesByUsage } from "@/services/content-library/library-index";
import type { GenerationReadinessItem, LocalLibraryUsage } from "@/types/database";

const generationTracks: Array<{
  id: string;
  title: string;
  description: string;
  usage: LocalLibraryUsage[];
}> = [
  {
    id: "preanesthetic",
    title: "Pré-anestésico",
    description: "Geração e refinamento de tópicos, resumo clínico, quick reference e árvore de decisão.",
    usage: ["theory", "review"]
  },
  {
    id: "interactive-study",
    title: "Estudo interativo",
    description: "Pacotes curtos, revisão diária, metas de 10–15 minutos e progressão adaptativa.",
    usage: ["interactive-study", "theory", "review"]
  },
  {
    id: "question-bank",
    title: "Banco de questões",
    description: "Questões comentadas, explicação de resposta, tags e vínculo com caderno de erros.",
    usage: ["questions", "review"]
  },
  {
    id: "exams",
    title: "Provas formais e treino",
    description: "Trimestrais, anuais e treinos curtos com atualização controlada.",
    usage: ["exams", "questions", "review"]
  },
  {
    id: "emergencies",
    title: "Emergências",
    description: "Cenários, algoritmos, debrief, autoavaliação e revisão de crises.",
    usage: ["emergencies", "interactive-study", "review"]
  },
  {
    id: "surgery-guides",
    title: "Guias por cirurgia",
    description: "Técnica, monitorização, drogas, adjuvantes, profilaxias e riscos por procedimento.",
    usage: ["surgery-guides", "theory", "review"]
  }
];

function resolveMode(localSourceCount: number): GenerationReadinessItem["mode"] {
  if (localSourceCount === 0) return "internal_only";
  if (localSourceCount < 3) return "hybrid_optional";
  return "local_augmented";
}

export async function fetchGenerationReadiness(): Promise<GenerationReadinessItem[]> {
  return Promise.all(
    generationTracks.map(async (track) => {
      const sources = (
        await Promise.all(track.usage.map((usage) => findContentLibrarySourcesByUsage(usage)))
      )
        .flat()
        .filter((source, index, array) => array.findIndex((item) => item.id === source.id) === index);

      return {
        id: track.id,
        title: track.title,
        description: track.description,
        mode: resolveMode(sources.length),
        localSourceCount: sources.length,
        supportedWithoutLibrary: true,
        recommendedUsage: track.usage
      };
    })
  );
}
