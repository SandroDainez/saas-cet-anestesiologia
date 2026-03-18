import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/types/database";

const statusStyles: Record<JobStatus, string> = {
  queued: "bg-amber-100 text-amber-800",
  running: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  blocked_no_source: "bg-slate-100 text-slate-600"
};

export function AIJobStatusBadge({ status }: { status: JobStatus }) {
  const label = status.replace(/_/g, " ").toUpperCase();
  return <Badge className={`text-xs font-semibold uppercase tracking-[0.3em] ${statusStyles[status]}`}>{label}</Badge>;
}
