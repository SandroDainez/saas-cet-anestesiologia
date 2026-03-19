import type { ProcedureLog, TraineeYearCode } from "@/types/database";

const YEAR_TARGETS: Record<TraineeYearCode, number> = {
  ME1: 24,
  ME2: 60,
  ME3: 110
};

export function LogbookYearSummary({ logs }: { logs: ProcedureLog[] }) {
  const counts = {
    ME1: 0,
    ME2: 0,
    ME3: 0
  };

  logs.forEach((log) => {
    const year = log.trainee_year_snapshot as TraineeYearCode;
    if (year in counts) {
      counts[year] += 1;
    }
  });

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {Object.entries(counts).map(([year, count]) => (
        <article key={year} className="rounded-[1.5rem] border border-border/70 bg-card/95 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">{year}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{count}</p>
          <p className="text-xs text-muted-foreground">
            Esperado: {YEAR_TARGETS[year as TraineeYearCode]} procedimentos ·
            {YEAR_TARGETS[year as TraineeYearCode] ? ` ${Math.round((count / YEAR_TARGETS[year as TraineeYearCode]) * 100) || 0}%` : "—"}
          </p>
        </article>
      ))}
    </section>
  );
}
