"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LocalLibrarySourceType, LocalLibraryUsage, TraineeYearCode } from "@/types/database";

const sourceTypeOptions: LocalLibrarySourceType[] = [
  "book",
  "guideline",
  "protocol",
  "sba_document",
  "exam_reference",
  "article",
  "handout",
  "mixed"
];

const usageOptions: LocalLibraryUsage[] = [
  "theory",
  "interactive-study",
  "questions",
  "exams",
  "emergencies",
  "surgery-guides",
  "review"
];

const applicabilityOptions: TraineeYearCode[] = ["ME1", "ME2", "ME3"];

interface ContentLibraryUploadPanelProps {
  action: (formData: FormData) => Promise<void>;
}

export function ContentLibraryUploadPanel({ action }: ContentLibraryUploadPanelProps) {
  const [selectedUsage, setSelectedUsage] = useState<Set<LocalLibraryUsage>>(new Set());
  const [selectedApplicability, setSelectedApplicability] = useState<Set<TraineeYearCode>>(new Set());

  const toggleUsage = (usage: LocalLibraryUsage) => {
    setSelectedUsage((prev) => {
      const next = new Set(prev);
      next.has(usage) ? next.delete(usage) : next.add(usage);
      return next;
    });
  };

  const toggleApplicability = (year: TraineeYearCode) => {
    setSelectedApplicability((prev) => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });
  };

  return (
    <form
      action={action}
      method="post"
      encType="multipart/form-data"
      className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Título
          <Input name="title" required />
        </label>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Tipo de fonte
          <select name="sourceType" className="rounded-xl border border-border/70 bg-transparent px-3 py-2 text-sm" required>
            {sourceTypeOptions.map((type) => (
              <option value={type} key={type}>
                {type.replace("-", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
        Arquivo (PDF, DOC, Markdown etc.)
        <Input name="file" type="file" accept=".pdf,.doc,.docx,.md,.txt" required />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Uso principal</p>
          <div className="flex flex-wrap gap-2">
            {usageOptions.map((usage) => (
              <label
                key={usage}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${selectedUsage.has(usage) ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground"}`}
              >
                <input
                  type="checkbox"
                  name="usage"
                  value={usage}
                  className="sr-only"
                  checked={selectedUsage.has(usage)}
                  onChange={() => toggleUsage(usage)}
                />
                {usage}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Aplicabilidade</p>
          <div className="flex flex-wrap gap-2">
            {applicabilityOptions.map((year) => (
              <label
                key={year}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${selectedApplicability.has(year) ? "border-secondary bg-secondary/10 text-secondary-foreground" : "border-border/70 text-muted-foreground"}`}
              >
                <input
                  type="checkbox"
                  name="applicability"
                  value={year}
                  className="sr-only"
                  checked={selectedApplicability.has(year)}
                  onChange={() => toggleApplicability(year)}
                />
                {year}
              </label>
            ))}
          </div>
        </div>
        <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground md:col-span-3">
          Tópicos-chave
          <Input name="topics" placeholder="Ex: vias aéreas, farmacologia" />
        </label>
      </div>
      <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
        Observações
        <textarea
          name="notes"
          rows={3}
          placeholder="Contexto, uso sugerido, revisão editorial..."
          className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button type="submit">Enviar para biblioteca</Button>
      </div>
    </form>
  );
}
