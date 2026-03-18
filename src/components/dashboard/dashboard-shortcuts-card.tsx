import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShortcutItem {
  id: string;
  href: Parameters<typeof Link>[0]["href"];
  title: string;
  description: string;
}

export function DashboardShortcutsCard({
  title,
  description,
  items
}: {
  title: string;
  description: string;
  items: ShortcutItem[];
}) {
  return (
    <Card className="space-y-3">
      <CardHeader className="space-y-2">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group rounded-2xl border border-border/60 bg-background/70 px-4 py-4 transition hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
