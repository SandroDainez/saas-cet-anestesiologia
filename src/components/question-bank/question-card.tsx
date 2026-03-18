import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { DifficultyBadge } from "./difficulty-badge";

import type { QuestionBankEntry, QuestionTypeEnum, TraineeYearCode } from "@/types/database";

const questionTypeLabels: Record<QuestionTypeEnum, string> = {
  case_sequential: "Caso sequencial",
  image_based: "Imagem",
  matching: "Relacionamento",
  multiple_choice: "Múltipla escolha",
  single_choice: "Escolha única",
  sba_true_false: "SBA V ou F",
  true_false: "V ou F"
};

interface QuestionCardProps {
  question: QuestionBankEntry;
  yearCode?: TraineeYearCode;
  topicLabel?: string;
  subtopicLabel?: string;
}

export function QuestionCard({ question, yearCode, topicLabel, subtopicLabel }: QuestionCardProps) {
  const scopeLabel = subtopicLabel ? `${topicLabel ? `${topicLabel} · ` : ""}${subtopicLabel}` : topicLabel ?? "Tópico geral";

  return (
    <Card className="space-y-3">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {yearCode ? (
            <span className="rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground">{yearCode}</span>
          ) : null}
          <span className="rounded-full border border-border px-3 py-1 text-[10px] text-muted-foreground">
            {questionTypeLabels[question.question_type]}
          </span>
        </div>
        <CardTitle className="text-base">{question.title ?? "Questão sem título"}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3">{question.stem}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">{scopeLabel}</span>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
          Escopo atual: <span className="font-semibold text-foreground">{scopeLabel}</span>
        </div>
        <Link href={`/question-bank/question/${question.id}`} className="inline-flex">
          <Button variant="secondary" className={cn("w-full justify-center")} size="sm">
            Resolver questão
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
