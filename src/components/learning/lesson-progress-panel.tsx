"use client";

import Link from "next/link";
import { useActionState } from "react";

import { completeLessonProgressAction } from "@/features/education/actions";
import { Button } from "@/components/ui/button";

interface LessonProgressPanelProps {
  lessonId: string;
  moduleId: string;
  currentStatus?: string | null;
  nextLessonHref?: Parameters<typeof Link>[0]["href"] | null;
}

export function LessonProgressPanel({
  lessonId,
  moduleId,
  currentStatus,
  nextLessonHref
}: LessonProgressPanelProps) {
  const nextPathValue = typeof nextLessonHref === "string" ? nextLessonHref : "";
  const [state, formAction, isPending] = useActionState(completeLessonProgressAction, {
    ok: false,
    message: ""
  });

  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Progresso da lição</p>
        <h3 className="text-lg font-semibold">
          {currentStatus === "completed" ? "Lição concluída" : "Marcar como concluída"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Registre a conclusão para atualizar seu progresso no módulo e retomar de onde parou.
        </p>
      </div>

      <form action={formAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="lesson_id" value={lessonId} />
        <input type="hidden" name="module_id" value={moduleId} />
        <input type="hidden" name="next_path" value={nextPathValue} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : currentStatus === "completed" ? "Atualizar conclusão" : "Concluir lição"}
        </Button>
        {nextLessonHref ? (
          <Link href={nextLessonHref}>
            <Button type="button" variant="outline">
              Próxima lição
            </Button>
          </Link>
        ) : null}
      </form>

      {state?.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
    </div>
  );
}
