import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireModuleAccess } from "@/services/auth/require-module-access";
import { getCompetencyMatrix } from "@/services/curriculum/competency-matrix";

export const metadata = {
  title: "Habilidades e Competências"
};

const categoryLabels = {
  knowledge: "Conhecimento",
  clinical_reasoning: "Raciocínio clínico",
  technical: "Habilidade técnica",
  safety: "Segurança",
  professionalism: "Profissionalismo"
} as const;

export default async function CurriculumCompetenciesPage() {
  await requireModuleAccess("curriculum");
  const matrix = getCompetencyMatrix();
  const totalCompetencies = matrix.reduce((sum, yearBlock) => sum + yearBlock.competencies.length, 0);
  const totalDomains = matrix.reduce((sum, yearBlock) => sum + yearBlock.coverageDomains.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="container space-y-8 py-10">
        <header className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge>Habilidades exigidas</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Matriz de competências ME1, ME2 e ME3</h1>
                <p className="max-w-3xl text-sm text-muted-foreground">
                  Esta é a referência canônica do produto para teoria, segurança, prática, raciocínio clínico e
                  profissionalismo. Tudo o que existir em trilhas, logbook, questões, provas e emergências deve se
                  alinhar a esta matriz.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <MatrixStat label="Anos" value={`${matrix.length}`} />
                <MatrixStat label="Domínios" value={`${totalDomains}`} />
                <MatrixStat label="Competências" value={`${totalCompetencies}`} />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm lg:max-w-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Leitura recomendada</p>
              <div className="mt-3 space-y-3">
                <ReadingStep label="1. Conferir o ano" description="Verifique o bloco ME1, ME2 ou ME3 sem misturar escopo." />
                <ReadingStep label="2. Validar cobertura" description="Cheque domínios obrigatórios, rotações e avaliação." />
                <ReadingStep label="3. Cobrar evidência" description="Tudo precisa aparecer em prática, prova ou validação." />
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <HubCard
            title="Logbook e validação"
            description="Use os procedimentos para comprovar execução, progressão e maturidade clínica."
            href="/logbook"
            action="Abrir logbook"
          />
          <HubCard
            title="Autoavaliação"
            description="Acompanhe confiança, reflexão e prontidão clínica após emergências e prática supervisionada."
            href="/emergencies/self-assessment"
            action="Abrir autoavaliação"
          />
          <HubCard
            title="Guias por cirurgia"
            description="Relacione competências com técnica anestésica, monitorização, drogas e profilaxias."
            href="/surgery-guides"
            action="Abrir guias"
          />
        </section>

        <section className="space-y-6">
          {matrix.map((yearBlock) => (
            <article key={yearBlock.year} className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{yearBlock.year}</p>
                  <h2 className="text-2xl font-semibold">{yearBlock.heading}</h2>
                  <p className="max-w-3xl text-sm text-muted-foreground">{yearBlock.focus}</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Cenários obrigatórios</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {yearBlock.requiredRotations.map((rotation) => (
                      <span key={rotation} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                        {rotation}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.95fr]">
                <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Cobertura obrigatória</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {yearBlock.coverageDomains.map((domain) => (
                      <div key={domain.id} className="rounded-[1.25rem] border border-border/70 bg-card/70 p-4">
                        <p className="text-base font-semibold">{domain.title}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{domain.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {domain.requiredTopics.map((topic) => (
                            <span key={topic} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Como comprovar domínio</p>
                  <div className="mt-4 space-y-3">
                    {yearBlock.assessmentTargets.map((target) => (
                      <div key={target} className="rounded-[1.25rem] border border-border/70 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
                        {target}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {yearBlock.competencies.map((competency) => (
                  <div key={competency.id} className="rounded-[1.5rem] border border-border/70 bg-background/80 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold">{competency.title}</p>
                      <span className="rounded-full bg-secondary/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-foreground">
                        {categoryLabels[competency.category]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{competency.description}</p>
                    <div className="mt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Evidências esperadas</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {competency.evidence.map((item) => (
                          <span key={item} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function MatrixStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ReadingStep({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function HubCard({
  title,
  description,
  href,
  action
}: {
  title: string;
  description: string;
  href: Parameters<typeof Link>[0]["href"];
  action: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <Link href={href} className="mt-4 inline-flex">
        <Button variant="outline" size="sm">
          {action}
        </Button>
      </Link>
    </article>
  );
}
