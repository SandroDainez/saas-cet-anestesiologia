import type { EmergencyCategory, TraineeYearCode } from "@/types/database";

export interface EmergencyCoverageItem {
  id: string;
  title: string;
  category: EmergencyCategory;
  severity: "high" | "critical";
  years: TraineeYearCode[];
  focus: string;
}

export const emergencyCoverageMatrix: EmergencyCoverageItem[] = [
  {
    id: "airway-cico",
    title: "Via aérea difícil e CICO",
    category: "airway",
    severity: "critical",
    years: ["ME1", "ME2", "ME3"],
    focus: "Pré-oxigenação, SGA, videolaringoscopia, plano frontal do pescoço e comunicação de crise."
  },
  {
    id: "anaphylaxis",
    title: "Anafilaxia perioperatória",
    category: "allergic",
    severity: "critical",
    years: ["ME1", "ME2", "ME3"],
    focus: "Adrenalina, volume, via aérea, broncoespasmo, documentação e investigação posterior."
  },
  {
    id: "hemodynamic-collapse",
    title: "Colapso hemodinâmico intraoperatório",
    category: "hemodynamic",
    severity: "critical",
    years: ["ME2", "ME3"],
    focus: "Choque, causas reversíveis, monitorização avançada, vasopressores e reanimação."
  },
  {
    id: "last",
    title: "Toxicidade sistêmica de anestésico local",
    category: "regional",
    severity: "critical",
    years: ["ME2", "ME3"],
    focus: "Reconhecimento precoce, emulsão lipídica, controle de convulsões e suporte circulatório."
  },
  {
    id: "malignant-hyperthermia",
    title: "Hipertermia maligna",
    category: "other",
    severity: "critical",
    years: ["ME2", "ME3"],
    focus: "Diagnóstico sindrômico, suspensão de gatilhos, dantrolene, resfriamento e UTI."
  },
  {
    id: "bronchospasm",
    title: "Broncoespasmo e hipoxemia perioperatória",
    category: "respiratory",
    severity: "high",
    years: ["ME1", "ME2", "ME3"],
    focus: "Profundidade anestésica, diferenciação diagnóstica, broncodilatadores e ventilação segura."
  },
  {
    id: "obstetric-hemorrhage",
    title: "Hemorragia obstétrica e choque",
    category: "obstetric",
    severity: "critical",
    years: ["ME2", "ME3"],
    focus: "Protocolo transfusional, uterotônicos, ácido tranexâmico e coordenação multiprofissional."
  },
  {
    id: "pediatric-laryngospasm",
    title: "Laringoespasmo e falência ventilatória pediátrica",
    category: "pediatric",
    severity: "critical",
    years: ["ME2", "ME3"],
    focus: "Reconhecimento imediato, pressão positiva, aprofundamento anestésico e succinilcolina."
  }
];

export function getEmergencyCoverageByYear(year?: TraineeYearCode) {
  if (!year) {
    return emergencyCoverageMatrix;
  }

  return emergencyCoverageMatrix.filter((item) => item.years.includes(year));
}
