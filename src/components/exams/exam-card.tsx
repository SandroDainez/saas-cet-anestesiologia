import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Exam, TraineeYearCode } from "@/types/database";

const typeLabels: Record<string, string> = {
  quarterly: "Prova trimestral",
  annual: "Prova anual",
  mock: "Simulado"
};

const statusStyles: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-700",
  scheduled: "bg-amber-50 text-amber-700",
  closed: "bg-rose-50 text-rose-700",
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-50 text-emerald-700"
};

interface ExamCardProps {
  exam: Exam;
  href: string;
  yearCode?: TraineeYearCode;
}

export function ExamCard({ exam, href, yearCode }: ExamCardProps) {
  return (
    <Card className="space-y-4">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-secondary/10 text-secondary-foreground">
            {typeLabels[exam.exam_type] ?? exam.exam_type}
          </Badge>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em]",
              statusStyles[exam.status] ?? "border-border text-muted-foreground"
            )}
          >
            {exam.status.toUpperCase()}
          </span>
          {yearCode ? (
            <span className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {yearCode}
            </span>
          ) : null}
        </div>
        <CardTitle>{exam.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{exam.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Duração</p>
            <p className="text-sm">{exam.duration_minutes ? `${exam.duration_minutes} min` : "Indefinido"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Questões</p>
            <p className="text-sm">{exam.total_questions ?? "Não informado"}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Link href={{ pathname: href }}>
            <Button variant="outline" size="sm">
              Ver detalhes
            </Button>
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Disponível até{" "}
            {exam.available_until ? new Date(exam.available_until).toLocaleDateString("pt-BR") : "indefinido"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
