import { Badge } from "@/components/ui/badge";
import type { EditorialStatus, ReviewStatus } from "@/types/database";

const badgeStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-800",
  reviewed: "bg-blue-100 text-blue-800",
  rejected: "bg-rose-100 text-rose-800"
};

export function EditorialStatusBadge({ status }: { status: EditorialStatus | ReviewStatus }) {
  const label = status.replace("_", " ").toUpperCase();
  const style = badgeStyles[status] ?? "bg-muted text-muted-foreground";

  return (
    <Badge className={`text-xs font-semibold uppercase tracking-[0.3em] ${style}`}>{label}</Badge>
  );
}
