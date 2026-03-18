"use client";

import { FormEvent, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { SurgeryGuideFilters, TraineeYearCode } from "@/types/database";

interface Option {
  value: string;
  label: string;
}

interface SurgeryGuideFilterProps {
  specialtyOptions: Option[];
  complexityOptions: Option[];
  yearOptions: { value: TraineeYearCode; label: string }[];
  patientTypeOptions: Option[];
  contextOptions: Option[];
  selected: SurgeryGuideFilters & { query?: string };
}

export function SurgeryGuideFilter({
  specialtyOptions,
  complexityOptions,
  yearOptions,
  patientTypeOptions,
  contextOptions,
  selected
}: SurgeryGuideFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      router.push(query ? `/surgery-guides?${query}` : "/surgery-guides");
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const query = formData.get("search")?.toString().trim() ?? "";
      updateParam("q", query || undefined);
    },
    [updateParam]
  );

  const handleReset = () => {
    router.push("/surgery-guides");
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card/80 p-4 shadow-sm">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="search"
          defaultValue={selected.query}
          placeholder="Buscar por procedimento ou objetivo"
          className="flex-1 rounded-2xl border border-border px-4 py-2 text-sm"
        />
        <Button type="submit" className="rounded-2xl px-4 py-2 text-sm">
          Buscar
        </Button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Especialidade
          <select
            value={selected.specialty ?? ""}
            onChange={(event) => updateParam("specialty", event.target.value || undefined)}
            className="w-full rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {specialtyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Complexidade
          <select
            value={selected.complexity ?? ""}
            onChange={(event) => updateParam("complexity", event.target.value || undefined)}
            className="w-full rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm"
          >
            <option value="">Qualquer</option>
            {complexityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Ano sugerido
          <select
            value={selected.suggestedYear ?? ""}
            onChange={(event) => updateParam("suggestedYear", event.target.value || undefined)}
            className="w-full rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Tipo de paciente
          <select
            value={selected.patientType ?? ""}
            onChange={(event) => updateParam("patientType", event.target.value || undefined)}
            className="w-full rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {patientTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Contexto
          <select
            value={selected.context ?? ""}
            onChange={(event) => updateParam("context", event.target.value || undefined)}
            className="w-full rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {contextOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          Filtros aplicados:{" "}
          {Object.keys(selected).filter(
            (key) => key !== "query" && (selected as Record<string, unknown>)[key]
          ).length}
        </span>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
