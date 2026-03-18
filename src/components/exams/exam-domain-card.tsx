import { cn } from "@/lib/utils";

interface DomainCardProps {
  title: string;
  scorePercent?: number | null;
  correct: number;
  total: number;
}

export function ExamDomainCard({ title, scorePercent, correct, total }: DomainCardProps) {
  const percent = scorePercent ?? Math.round((correct / total) * 100);
  return (
    <article className="space-y-2 rounded-[1.5rem] border border-border/70 bg-card/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full border border-border/60 bg-background/70">
        <div
          className={cn("h-full rounded-full bg-primary transition-all")}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {correct} acertos · {total - correct} erros
      </p>
    </article>
  );
}
