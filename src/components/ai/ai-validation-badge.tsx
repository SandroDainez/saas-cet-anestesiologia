import { Badge } from "@/components/ui/badge";
import type { CheckResult } from "@/types/database";

const resultStyles: Record<CheckResult, string> = {
  pass: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  fail: "bg-rose-100 text-rose-800"
};

export function AIValidationBadge({ result }: { result: CheckResult }) {
  return (
    <Badge className={`text-xs font-semibold uppercase tracking-[0.3em] ${resultStyles[result]}`}>
      {result}
    </Badge>
  );
}
