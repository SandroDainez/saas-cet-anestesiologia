import type { NavigationItem } from "@/types/navigation";
import type { DashboardScope } from "@/types/auth";

const items: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Visao geral",
    description: "Resumo inicial por perfil",
    scope: "shared"
  },
  {
    href: "/curriculum",
    label: "Curriculo SBA",
    description: "Cobertura do ano, tópicos e provas",
    scope: "shared"
  },
  {
    href: "/curriculum/competencies",
    label: "Habilidades",
    description: "Competências e evidências por ME1, ME2 e ME3",
    scope: "shared"
  },
  {
    href: "/trilhas",
    label: "Trilhas",
    description: "Estudo interativo e próximos blocos",
    scope: "shared"
  },
  {
    href: "/question-bank",
    label: "Questoes",
    description: "Banco oficial para prática e revisão",
    scope: "shared"
  },
  {
    href: "/exams",
    label: "Provas",
    description: "Avaliações trimestrais, anuais e treinos curtos",
    scope: "shared"
  },
  {
    href: "/logbook",
    label: "Logbook",
    description: "Procedimentos, validações e metas clínicas",
    scope: "shared"
  },
  {
    href: "/emergencies",
    label: "Emergencias",
    description: "Crises anestésicas, complicações e treino",
    scope: "shared"
  },
  {
    href: "/emergencies/self-assessment",
    label: "Autoavaliacao",
    description: "Confiança, reflexão e prontidão em emergências",
    scope: "shared"
  },
  {
    href: "/preanesthetic",
    label: "Pre-anestesico",
    description: "Avaliação, medicações, jejum e risco",
    scope: "shared"
  },
  {
    href: "/surgery-guides",
    label: "Guias por cirurgia",
    description: "Técnica, monitorização, drogas e profilaxias",
    scope: "shared"
  },
  {
    href: "/dashboard/trainee",
    label: "Trainee",
    description: "Trilha, progresso e proximos passos",
    scope: "trainee"
  },
  {
    href: "/dashboard/preceptor",
    label: "Preceptor",
    description: "Supervisao e feedback dos estagiarios",
    scope: "preceptor"
  },
  {
    href: "/dashboard/admin",
    label: "Instituicao",
    description: "Governanca, usuarios e operacao",
    scope: "admin"
  }
];

export function getNavigationByScope(scope: DashboardScope) {
  return items.filter((item) => item.scope === "shared" || item.scope === scope);
}
