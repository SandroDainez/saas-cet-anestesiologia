"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { key: string; label: string }[];
  selected?: string;
  onSelect: (value: string) => void;
}

export function PreanestheticCategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category.key}
          type="button"
          className={cn(
            "rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition",
            selected === category.key
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/70 text-muted-foreground"
          )}
          onClick={() => onSelect(category.key)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
