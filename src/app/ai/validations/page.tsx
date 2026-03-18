import { Metadata } from "next";

import { AIValidationBadge } from "@/components/ai/ai-validation-badge";
import { fetchAllAIValidationChecks } from "@/services/db/modules";

export const metadata: Metadata = {
  title: "Validações automáticas IA"
};

export default async function AIValidationsPage() {
  const validations = await fetchAllAIValidationChecks();

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-6 py-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold">Validações automáticas de IA</h1>
          <p className="text-sm text-muted-foreground">
            Todas as checagens são registradas antes que qualquer conteúdo crítico siga para revisão humana.
          </p>
        </section>
        <section className="space-y-3">
          {validations.length ? (
            validations.map((validation) => (
              <div
                key={validation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{validation.check_type}</p>
                  <p className="text-xs text-muted-foreground">{validation.details ?? "Sem detalhes"}</p>
                </div>
                <AIValidationBadge result={validation.result} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground">Sem validações registradas.</div>
          )}
        </section>
      </main>
    </div>
  );
}
