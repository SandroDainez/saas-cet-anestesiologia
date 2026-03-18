import type { TraineeYearCode } from "@/types/database";

export interface CompetencyTrack {
  id: string;
  title: string;
  description: string;
  year: TraineeYearCode;
  category: "knowledge" | "clinical_reasoning" | "technical" | "safety" | "professionalism";
  evidence: string[];
}

export interface CurriculumCoverageDomain {
  id: string;
  title: string;
  summary: string;
  requiredTopics: string[];
}

export interface CompetencyYearSummary {
  year: TraineeYearCode;
  heading: string;
  focus: string;
  requiredRotations: string[];
  coverageDomains: CurriculumCoverageDomain[];
  assessmentTargets: string[];
  competencies: CompetencyTrack[];
}

const competencyMatrix: CompetencyYearSummary[] = [
  {
    year: "ME1",
    heading: "Fundação clínica e segurança anestésica",
    focus:
      "Base teórica SBA, avaliação pré-anestésica, farmacologia, monitorização, técnica básica e segurança no perioperatório.",
    requiredRotations: ["Centro cirúrgico geral", "Pré-anestésico", "RPA", "Simulação básica", "Dor aguda inicial"],
    coverageDomains: [
      {
        id: "me1-preop-domain",
        title: "Avaliação pré-anestésica",
        summary: "Risco, comorbidades, jejum, via aérea, exames complementares e plano inicial.",
        requiredTopics: [
          "Consulta pré-anestésica",
          "Classificação ASA",
          "Jejum e medicações crônicas",
          "Avaliação de via aérea",
          "Estratificação cardiovascular e respiratória"
        ]
      },
      {
        id: "me1-pharm-domain",
        title: "Farmacologia essencial",
        summary: "Hipnóticos, opioides, bloqueadores neuromusculares, reversores, anestésicos locais e vasoativos básicos.",
        requiredTopics: [
          "Propofol, etomidato, cetamina",
          "Opioides e analgesia multimodal",
          "Bloqueadores neuromusculares",
          "Anticolinesterásicos e sugamadex",
          "Vasopressores e inotrópicos iniciais"
        ]
      },
      {
        id: "me1-monitoring-domain",
        title: "Monitorização e segurança",
        summary: "Monitorização mínima, checagem de aparelho, checklist e prevenção de eventos básicos.",
        requiredTopics: [
          "ECG, PANI, oximetria e capnografia",
          "Checklist pré-indução",
          "Segurança de medicações",
          "RPA e critérios de alta",
          "Reconhecimento precoce de deterioração"
        ]
      },
      {
        id: "me1-tech-domain",
        title: "Técnicas fundamentais",
        summary: "Via aérea básica, indução, ventilação, anestesia geral inicial e princípios de neuroeixo.",
        requiredTopics: [
          "Ventilação sob máscara",
          "Laringoscopia direta",
          "Intubação orotraqueal supervisionada",
          "Indução venosa balanceada",
          "Introdução ao bloqueio de neuroeixo"
        ]
      }
    ],
    assessmentTargets: [
      "Questões de base SBA por tema",
      "Provas trimestrais do ano",
      "Logbook de procedimentos iniciais",
      "Emergências básicas e autoavaliação"
    ],
    competencies: [
      {
        id: "me1-preop",
        title: "Avaliação pré-anestésica completa",
        description: "Estratificar risco, jejum, medicações, comorbidades e plano anestésico inicial.",
        year: "ME1",
        category: "clinical_reasoning",
        evidence: ["Pré-anestésico", "Questões SBA", "Casos supervisionados"]
      },
      {
        id: "me1-monitoring",
        title: "Monitorização mínima obrigatória",
        description: "Aplicar monitorização básica, reconhecer desvios e comunicar deterioração precocemente.",
        year: "ME1",
        category: "safety",
        evidence: ["Trilhas de monitorização", "Logbook", "Checklist intraoperatório"]
      },
      {
        id: "me1-airway",
        title: "Via aérea básica e resgate inicial",
        description: "Manejo inicial de máscara, laringoscopia direta e algoritmo de falha inicial.",
        year: "ME1",
        category: "technical",
        evidence: ["Logbook de via aérea", "Emergências", "Autoavaliação"]
      },
      {
        id: "me1-pharm",
        title: "Fármacos anestésicos essenciais",
        description: "Entender classes, doses usuais, efeitos hemodinâmicos e interações críticas.",
        year: "ME1",
        category: "knowledge",
        evidence: ["Conteúdo SBA", "Questões", "Provas trimestrais"]
      },
      {
        id: "me1-rpa",
        title: "Recuperação pós-anestésica segura",
        description: "Reconhecer dor, náusea, dessaturação, agitação e critérios de alta supervisionada.",
        year: "ME1",
        category: "safety",
        evidence: ["RPA", "Checklist pós-operatório", "Simulações curtas"]
      }
    ]
  },
  {
    year: "ME2",
    heading: "Expansão técnica e tomada de decisão",
    focus:
      "Bloqueios, obstetrícia, pediatria, monitorização avançada, analgesia e manejo de complicações intermediárias.",
    requiredRotations: ["Obstetrícia", "Pediatria", "Anestesia regional", "UTI perioperatória", "Cirurgia ambulatorial"],
    coverageDomains: [
      {
        id: "me2-regional-domain",
        title: "Anestesia regional e neuroeixo",
        summary: "Indicação, contraindicação, técnica, falhas e complicações das principais abordagens regionais.",
        requiredTopics: [
          "Raquianestesia e peridural",
          "Cefaleia pós-punção",
          "Bloqueios periféricos básicos",
          "Toxicidade sistêmica de anestésicos locais",
          "Analgesia regional pós-operatória"
        ]
      },
      {
        id: "me2-ob-domain",
        title: "Obstetrícia e urgências maternas",
        summary: "Cesárea, analgesia de parto, hemorragia, hipertensão e falha de neuroeixo.",
        requiredTopics: [
          "Cesárea eletiva e urgente",
          "Analgesia de parto",
          "Hemorragia obstétrica",
          "Pré-eclâmpsia e eclâmpsia",
          "Falha de bloqueio neuraxial"
        ]
      },
      {
        id: "me2-ped-domain",
        title: "Pediatria e diferenças fisiológicas",
        summary: "Planejamento anestésico, monitorização, fluidos, dor e via aérea pediátrica.",
        requiredTopics: [
          "Avaliação pediátrica",
          "Via aérea pediátrica",
          "Reposição volêmica",
          "Dor e profilaxias",
          "Recuperação pós-anestésica em pediatria"
        ]
      },
      {
        id: "me2-hemo-domain",
        title: "Monitorização avançada e hemodinâmica",
        summary: "Interpretar instabilidade, escolher suporte e antecipar deterioração perioperatória.",
        requiredTopics: [
          "Linha arterial",
          "Gasometria e lactato",
          "Vasoativos e inotrópicos",
          "Choque e hipoperfusão",
          "Estratégias transfusionais iniciais"
        ]
      }
    ],
    assessmentTargets: [
      "Questões temáticas por sistema",
      "Provas trimestrais do ano",
      "Validação de logbook regional e obstétrico",
      "Emergências intermediárias"
    ],
    competencies: [
      {
        id: "me2-regional",
        title: "Bloqueios neuraxiais e periféricos",
        description: "Indicação, contraindicação, técnica, falhas e complicações das técnicas regionais.",
        year: "ME2",
        category: "technical",
        evidence: ["Guias anestésicos", "Logbook", "Validação preceptor"]
      },
      {
        id: "me2-obstetric",
        title: "Anestesia obstétrica segura",
        description: "Plano anestésico para cesárea, analgesia de parto e complicações materno-fetais.",
        year: "ME2",
        category: "clinical_reasoning",
        evidence: ["Provas", "Emergências obstétricas", "Guias cirúrgicos"]
      },
      {
        id: "me2-hemo",
        title: "Instabilidade hemodinâmica perioperatória",
        description: "Interpretação clínica, expansão volêmica, vasoativos e monitorização avançada.",
        year: "ME2",
        category: "safety",
        evidence: ["Emergências", "Questões SBA", "Simulações"]
      },
      {
        id: "me2-pain",
        title: "Analgesia multimodal e profilaxias",
        description: "Planejar analgesia, antiemese, antibiótico e adjuvantes conforme procedimento.",
        year: "ME2",
        category: "knowledge",
        evidence: ["Guias por cirurgia", "Pré-anestésico", "Provas trimestrais"]
      },
      {
        id: "me2-ped",
        title: "Adaptação anestésica em pediatria",
        description: "Ajustar técnica, monitorização, doses e recuperação a faixas etárias pediátricas.",
        year: "ME2",
        category: "clinical_reasoning",
        evidence: ["Pediatria", "Questões", "Logbook supervisionado"]
      }
    ]
  },
  {
    year: "ME3",
    heading: "Casos complexos, crise e autonomia supervisionada",
    focus:
      "Cardiovascular, neuro, trauma, centro cirúrgico complexo, liderança, crise anestésica e consolidação da autonomia supervisionada.",
    requiredRotations: ["Cardiovascular", "Neurocirurgia", "Trauma", "Coordenação de sala", "Anestesia fora do centro cirúrgico"],
    coverageDomains: [
      {
        id: "me3-complex-domain",
        title: "Planejamento anestésico avançado",
        summary: "Escolha de técnica, contingência, hemodinâmica complexa e monitorização ampliada.",
        requiredTopics: [
          "Cirurgia cardiovascular",
          "Neurocirurgia",
          "Grandes cirurgias abdominais",
          "Anestesia fora do centro cirúrgico",
          "Doente crítico no intraoperatório"
        ]
      },
      {
        id: "me3-crisis-domain",
        title: "Crises anestésicas maiores",
        summary: "Reconhecer e conduzir eventos raros, mas de alto risco, com liderança e rastreabilidade.",
        requiredTopics: [
          "Hipertermia maligna",
          "LAST",
          "Anafilaxia grave",
          "Via aérea difícil extrema",
          "Colapso hemodinâmico intraoperatório"
        ]
      },
      {
        id: "me3-trauma-domain",
        title: "Trauma e instabilidade extrema",
        summary: "Reanimação, controle de dano, transfusão maciça e tomada de decisão em ambiente crítico.",
        requiredTopics: [
          "Trauma hemorrágico",
          "Transfusão maciça",
          "Via aérea no trauma",
          "Choque refratário",
          "Perioperatório do paciente grave"
        ]
      },
      {
        id: "me3-lead-domain",
        title: "Liderança, comunicação e governança",
        summary: "Briefing, debriefing, priorização de sala, segurança e comunicação com equipe e preceptoria.",
        requiredTopics: [
          "Briefing operatório",
          "Escalonamento precoce",
          "Debrief estruturado",
          "Documentação crítica",
          "Supervisão de colegas mais novos"
        ]
      }
    ],
    assessmentTargets: [
      "Provas anuais SBA",
      "Casos integradores complexos",
      "Logbook de alta complexidade e validações",
      "Emergências avançadas com debrief"
    ],
    competencies: [
      {
        id: "me3-crisis",
        title: "Crises anestésicas complexas",
        description: "Via aérea difícil grave, LAST, hipertermia maligna, anafilaxia e colapso hemodinâmico.",
        year: "ME3",
        category: "safety",
        evidence: ["Emergências avançadas", "Debriefing", "Autoavaliação longitudinal"]
      },
      {
        id: "me3-complex-cases",
        title: "Planejamento anestésico de alta complexidade",
        description: "Definir técnica principal, alternativas, monitorização, drogas e contingências.",
        year: "ME3",
        category: "clinical_reasoning",
        evidence: ["Guias por cirurgia", "Provas anuais", "Discussão com preceptor"]
      },
      {
        id: "me3-leadership",
        title: "Comunicação e liderança em sala",
        description: "Conduzir briefing, escalonar ajuda e manter rastreabilidade clínica em cenários críticos.",
        year: "ME3",
        category: "professionalism",
        evidence: ["Checklist operatório", "Emergências", "Avaliação do preceptor"]
      },
      {
        id: "me3-procedures",
        title: "Autonomia supervisionada em procedimentos-chave",
        description: "Consolidar procedimentos obrigatórios com segurança, indicação e análise crítica do resultado.",
        year: "ME3",
        category: "technical",
        evidence: ["Logbook", "Validações", "Meta de maturidade clínica"]
      },
      {
        id: "me3-governance",
        title: "Priorização e governança clínica",
        description: "Gerenciar múltiplas demandas, riscos simultâneos e comunicação interdisciplinar.",
        year: "ME3",
        category: "professionalism",
        evidence: ["Coordenação de sala", "Relatórios", "Feedback institucional"]
      }
    ]
  }
];

export function getCompetencyMatrix() {
  return competencyMatrix;
}

export function getCompetencyYearSummary(year: TraineeYearCode) {
  return competencyMatrix.find((item) => item.year === year) ?? null;
}
