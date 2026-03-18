import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProcedureLogForm } from "@/components/logbook/procedure-log-form";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { fetchInstitutionReviewers, fetchInstitutionUnits, fetchProcedureCatalogEntries, fetchSurgeryCatalogEntries } from "@/services/db/modules";

export const metadata = {
  title: "Novo registro"
};

export default async function NewLogbookPage() {
  const profile = await requireModuleAccess("logbook", { allowedScopes: ["trainee"] });
  const [procedures, surgeries, units, reviewers] = await Promise.all([
    fetchProcedureCatalogEntries(),
    fetchSurgeryCatalogEntries(),
    fetchInstitutionUnits(profile.institution_id),
    fetchInstitutionReviewers(profile.institution_id)
  ]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="space-y-3">
          <Badge>Logbook</Badge>
          <h1 className="text-3xl font-semibold">Registrar novo procedimento</h1>
          <p className="text-sm text-muted-foreground">
            Preencha os campos obrigatórios, descreva a técnica e registre como você avalia sua confiança no caso.
          </p>
          <Link href="/logbook">
            <Button variant="outline" size="sm">
              Voltar ao logbook
            </Button>
          </Link>
        </header>

        <ProcedureLogForm procedures={procedures} surgeries={surgeries} units={units} reviewers={reviewers} />
      </main>
    </div>
  );
}
