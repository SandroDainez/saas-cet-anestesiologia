"use client";

import { cn } from "@/lib/utils";

interface Option {
  key: string;
  label: string;
}

interface EmergencyActionSelectorProps {
  options: Option[];
  selectedKey?: string;
  onSelect: (key: string) => void;
}

export function EmergencyActionSelector({ options, selectedKey, onSelect }: EmergencyActionSelectorProps) {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={cn(
            "w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
            selectedKey === option.key
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/70 bg-background hover:border-primary"
          )}
          onClick={() => onSelect(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
