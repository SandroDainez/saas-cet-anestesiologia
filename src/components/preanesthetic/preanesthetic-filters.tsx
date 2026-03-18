"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PreanestheticCategoryFilter } from "./preanesthetic-category-filter";

interface PreanestheticFiltersProps {
  categories: { key: string; label: string }[];
  selectedCategory?: string;
  initialQuery?: string;
}

export function PreanestheticFilters({ categories, selectedCategory, initialQuery }: PreanestheticFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === selectedCategory) {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/preanesthetic?${params.toString()}`);
  };

  const handleSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const query = formData.get("query")?.toString().trim() ?? "";
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.push(`/preanesthetic?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <input
          name="query"
          defaultValue={initialQuery}
          placeholder="Buscar tópicos ou termos (ex: jejum)"
          className="flex-1 rounded-2xl border border-border px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Buscar
        </button>
      </form>
      <PreanestheticCategoryFilter categories={categories} selected={selectedCategory} onSelect={handleCategory} />
    </div>
  );
}
