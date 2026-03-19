import Link from "next/link";

import { cn } from "@/lib/utils";

const defaultItems = [
  { href: "/curriculum", label: "Currículo" },
  { href: "/trilhas", label: "Trilhas" },
  { href: "/question-bank", label: "Questões" },
  { href: "/exams", label: "Provas" },
  { href: "/logbook", label: "Logbook" },
  { href: "/emergencies", label: "Emergências" },
  { href: "/surgery-guides", label: "Guias" },
  { href: "/dashboard/admin", label: "Admin" }
] as const;

interface ModuleNavigationStripProps {
  activeHref?: string;
}

export function ModuleNavigationStrip({ activeHref }: ModuleNavigationStripProps) {
  return (
    <nav
      aria-label="Navegação principal do módulo"
      className="flex gap-2 overflow-x-auto rounded-[1.25rem] border border-border/70 bg-card/85 p-2 shadow-sm"
    >
      {defaultItems.map((item) => {
        const isActive = activeHref === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-background/80 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
