import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { EmergencyScenario } from "@/types/database";

const categoryLabels: Record<string, string> = {
  airway: "Via aérea",
  hemodynamic: "Hemodinâmica",
  respiratory: "Respiratória",
  allergic: "Anafilaxia",
  regional: "Neuroeixo",
  obstetric: "Obstétrica",
  pediatric: "Pediátrica",
  other: "Outros"
};

interface EmergencyScenarioCardProps {
  scenario: EmergencyScenario;
  attempts?: number;
}

export function EmergencyScenarioCard({ scenario, attempts = 0 }: EmergencyScenarioCardProps) {
  return (
    <Card className="space-y-4">
      <CardHeader className="space-y-2">
        <Badge className="bg-secondary/10 text-secondary-foreground">{categoryLabels[scenario.category] ?? "Emergência"}</Badge>
        <CardTitle>{scenario.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
          <span>Dificuldade {scenario.difficulty_level}</span>
          <span>{scenario.universal_access ? "Acesso universal" : "Restrito"}</span>
          <span>{attempts} tentativa{attempts === 1 ? "" : "s"}</span>
        </div>
        <Link href={`/emergencies/${scenario.id}`}>
          <Button variant="outline" size="sm">
            Ver cenário
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
