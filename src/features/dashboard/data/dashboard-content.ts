import { Activity, BookOpenCheck, Building2, ClipboardList, ShieldCheck, Stethoscope, Users } from "lucide-react";

import type { DashboardScope, UserProfile } from "@/types/auth";
import type { ModuleCounts } from "@/types/database";

export interface StatCardData {
  title: string;
  value: string;
  description: string;
}

export interface HighlightCardData {
  title: string;
  body: string;
  icon: typeof Activity;
}

export interface DashboardContent {
  heading: string;
  intro: string;
  stats: StatCardData[];
  highlights: HighlightCardData[];
}

const formatCount = (value?: number) => (value === undefined ? "—" : value.toString());

export function getDashboardContent(scope: DashboardScope, profile: UserProfile, moduleCounts?: ModuleCounts): DashboardContent {
  if (scope === "trainee") {
    return {
      heading: `Plano de progresso ${profile.training_year ?? "ME1"}`,
      intro: "Painel inicial para estudo, acompanhamento trimestral e visibilidade do percurso de formacao.",
      stats: [
        { title: "Instituicao", value: profile.institution_name, description: `Tenant ativo: ${profile.institution_id}` },
        {
          title: "Tópicos SBA",
          value: formatCount(moduleCounts?.curriculumTopics),
          description: "O índice oficial do currículo já está pronto para ligar com as trilhas."
        },
        {
          title: "Questões em preparação",
          value: formatCount(moduleCounts?.questionBankEntries),
          description: "Banco de questões aguardando conexão com provas e simulados."
        }
      ],
      highlights: [
        {
          title: "Trilha de estudo",
          body: `As ${formatCount(moduleCounts?.learningTracks)} trilhas planetadas podem guiar o ano ${profile.training_year ?? "ME1"}.`,
          icon: BookOpenCheck
        },
        {
          title: "Avaliações",
          body: "Integração pronta com provas trimestrais, banco de questões e autoavaliações.",
          icon: ClipboardList
        },
        {
          title: "Identidade institucional",
          body: "Todos os dados do usuário já respeitam o institution_id e a governança multi-tenant.",
          icon: Building2
        }
      ]
    };
  }

  if (scope === "preceptor") {
    return {
      heading: "Supervisão de estagiários",
      intro: "Painel para acompanhar progresso, validações e coordenação assistida por tenant.",
      stats: [
        { title: "Instituição", value: profile.institution_name, description: `Tenant ativo: ${profile.institution_id}` },
        {
          title: "Procedimentos logbook",
          value: formatCount(moduleCounts?.procedureLogs),
          description: "Registro de procedimentos pronto para conectar validações e feedback."
        },
        {
          title: "Cenários de emergência",
          value: formatCount(moduleCounts?.emergencyScenarios),
          description: "Cenários disponíveis para treino supervisionado."
        }
      ],
      highlights: [
        {
          title: "Supervisão segura",
          body: "O middleware e o filtro por tenant evitam mistura de dados entre instituições.",
          icon: ShieldCheck
        },
        {
          title: "Feedback e validação",
          body: "As validações clínicas ficam prontas para alimentar os checkpoints do preceptor.",
          icon: Stethoscope
        },
        {
          title: "Visão operacional",
          body: "Resumo mobile-friendly pensado para uso rápido durante o plantão hospitalar.",
          icon: Activity
        }
      ]
    };
  }

  return {
    heading: "Operação institucional",
    intro: "Governança, usuários e plano de expansão multi-institucional.",
    stats: [
      {
        title: "Instituição",
        value: profile.institution_name,
        description: `Tenant ativo: ${profile.institution_id}`
      },
      {
        title: "Provas planejadas",
        value: formatCount(moduleCounts?.exams),
        description: "Trimestrais, anuais e simulados derivados do schema oficial."
      },
      {
        title: "Conteúdo SBA",
        value: formatCount(moduleCounts?.curriculumTopics),
        description: "Base curricular alinhada ao PRD, pronta para triagem editorial."
      }
    ],
    highlights: [
      {
        title: "Gestão multi-tenant",
        body: "institution_id presente desde a autenticação até os filtros das queries.",
        icon: Building2
      },
      {
        title: "Controle de acesso",
        body: "Middleware, tipos e políticas de RLS espelham as funções do PRD.",
        icon: Users
      },
      {
        title: "Governança de dados",
        body: "Versão editorial e auditoria já estão previstos pelo schema inicial.",
        icon: ShieldCheck
      }
    ]
  };
}
