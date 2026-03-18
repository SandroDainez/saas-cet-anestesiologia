"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import type {
  CurriculumSubtopic,
  CurriculumTopic,
  CurriculumYear,
  QuestionDifficulty,
  QuestionTypeEnum,
  TraineeYearCode
} from "@/types/database";

interface QuestionFilterProps {
  years: CurriculumYear[];
  topics: CurriculumTopic[];
  subtopics: CurriculumSubtopic[];
  currentFilters: {
    curriculum_year_code?: TraineeYearCode;
    topicId?: string;
    subtopicId?: string;
    difficulty?: QuestionDifficulty;
    questionType?: QuestionTypeEnum;
  };
}

const difficultyOptions: QuestionDifficulty[] = ["easy", "medium", "hard"];

const questionTypeOptions: QuestionTypeEnum[] = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "matching",
  "case_sequential",
  "image_based"
];

export function QuestionFilter({ years, topics, subtopics, currentFilters }: QuestionFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topicOptions = useMemo(() => {
    if (!currentFilters.curriculum_year_code) {
      return topics;
    }
    return topics.filter((topic) => topic.curriculum_year_id === years.find((year) => year.code === currentFilters.curriculum_year_code)?.id);
  }, [currentFilters.curriculum_year_code, topics, years]);

  const updateFilters = useCallback(
    (changes: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const queryString = params.toString();
      router.push(queryString ? `/question-bank?${queryString}` : "/question-bank");
    },
    [router, searchParams]
  );

  const handleYearChange = (value: string) => {
    updateFilters({
      year: value || undefined,
      topicId: undefined,
      subtopicId: undefined
    });
  };

  const handleTopicChange = (value: string) => {
    updateFilters({
      topicId: value || undefined,
      subtopicId: undefined
    });
  };

  const handleSubtopicChange = (value: string) => {
    updateFilters({
      subtopicId: value || undefined
    });
  };

  return (
    <section className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/90 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <button
          type="button"
          className="text-xs font-semibold uppercase tracking-[0.4em] text-primary"
          onClick={() =>
            updateFilters({
              year: undefined,
              topicId: undefined,
              subtopicId: undefined,
              difficulty: undefined,
              questionType: undefined
            })
          }
        >
          Limpar
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Ano de formação
          <select
            value={currentFilters.curriculum_year_code ?? ""}
            className={cn("w-full rounded-xl border border-border/70 bg-transparent px-3 py-2 text-sm")}
            onChange={(event) => handleYearChange(event.target.value)}
          >
            <option value="">Todos os anos</option>
            {years.map((year) => (
              <option key={year.id} value={year.code}>
                {year.code}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Tópico SBA
          <select
            value={currentFilters.topicId ?? ""}
            className={cn("w-full rounded-xl border border-border/70 bg-transparent px-3 py-2 text-sm")}
            onChange={(event) => handleTopicChange(event.target.value)}
          >
            <option value="">Todos os tópicos</option>
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Subtema
          <select
            value={currentFilters.subtopicId ?? ""}
            className={cn("w-full rounded-xl border border-border/70 bg-transparent px-3 py-2 text-sm")}
            onChange={(event) => handleSubtopicChange(event.target.value)}
            disabled={!currentFilters.topicId}
          >
            <option value="">{currentFilters.topicId ? "Selecione um subtema" : "Selecione um tópico primeiro"}</option>
            {subtopics.map((subtopic) => (
              <option key={subtopic.id} value={subtopic.id}>
                {subtopic.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Dificuldade
          <select
            value={currentFilters.difficulty ?? ""}
            className={cn("w-full rounded-xl border border-border/70 bg-transparent px-3 py-2 text-sm")}
            onChange={(event) => updateFilters({ difficulty: event.target.value || undefined })}
          >
            <option value="">Todas</option>
            {difficultyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Tipo de questão
          <select
            value={currentFilters.questionType ?? ""}
            className={cn("w-full rounded-xl border border-border/70 bg-transparent px-3 py-2 text-sm")}
            onChange={(event) => updateFilters({ questionType: event.target.value || undefined })}
          >
            <option value="">Todos</option>
            {questionTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
