import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmergencyConfidenceCard } from "@/components/emergencies/emergency-confidence-card";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchEmergencyAttemptsByTrainee, fetchEmergencySelfAssessments } from "@/services/db/modules";

export const metadata = {
  title: "Autoavaliação de emergências"
};

export default async function EmergencySelfAssessmentPage() {
  const profile = await requireModuleAccess("emergencies-run");
  const [assessments, attempts] = await Promise.all([
    fetchEmergencySelfAssessments(profile.id, profile.id, "trainee"),
    fetchEmergencyAttemptsByTrainee(profile.id, 1)
  ]);
  const latestAttempt = attempts[0];

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <Badge>Autoavaliação</Badge>
          <h1 className="text-3xl font-semibold">Confiança em emergências</h1>
          <p className="text-sm text-muted-foreground">
            Compare a confiança antes e depois das simulações e registre reflexões.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={latestAttempt ? `/emergencies/result/${latestAttempt.id}` : "/emergencies"}>
              <Button size="sm">Ver último resultado</Button>
            </Link>
            <Link href="/emergencies">
              <Button variant="outline" size="sm">
                Voltar aos cenários
              </Button>
            </Link>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Histórico de autoavaliações</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Confiança antes e depois</span>
          </div>

          {assessments.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
              Nenhuma autoavaliação registrada ainda. Resolve uma simulação para gerar o relatório.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assessments.map((assessment) => (
                <EmergencyConfidenceCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
