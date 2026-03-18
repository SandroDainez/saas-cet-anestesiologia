import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminActivityItem } from "@/services/admin/fetch-admin-activity-feed";

const toneClasses: Record<AdminActivityItem["tone"], string> = {
  neutral: "border-border/60 bg-background/80 text-foreground",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900"
};

const categoryLabels: Record<AdminActivityItem["category"], string> = {
  study: "Estudo",
  question: "Questões",
  exam: "Provas",
  logbook: "Logbook",
  validation: "Validação",
  emergency: "Emergência",
  refresh: "Refresh"
};

export function AdminActivityFeedCard({ items }: { items: AdminActivityItem[] }) {
  return (
    <Card className="space-y-4">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Tempo real</p>
            <CardTitle>Atividade recente dos usuários</CardTitle>
          </div>
          <Badge className="bg-secondary/10 text-secondary-foreground">{items.length} eventos</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Últimas ações de estudo, provas, logbook, emergências e refresh individual de conteúdo.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
            Nenhuma atividade recente registrada.
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className={`rounded-2xl border px-4 py-4 ${toneClasses[item.tone]}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-border/70 bg-background/80 text-muted-foreground">
                    {categoryLabels[item.category]}
                  </Badge>
                  <p className="text-sm font-semibold">{item.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.occurredAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
              <p className="mt-2 text-sm">
                <span className="font-semibold">{item.actorName}</span> · {item.detail}
              </p>
            </article>
          ))
        )}
        <div className="pt-2">
          <Link href="/reports" className="text-sm font-semibold text-primary">
            Abrir relatórios completos
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
