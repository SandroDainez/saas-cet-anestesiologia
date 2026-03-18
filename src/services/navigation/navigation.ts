import type { NavigationItem } from "@/types/navigation";
import type { DashboardScope } from "@/types/auth";

const items: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Visao geral",
    description: "Resumo inicial por perfil",
    scope: "shared"
  },
  {
    href: "/dashboard/trainee",
    label: "Trainee",
    description: "Trilha, progresso e proximos passos",
    scope: "trainee"
  },
  {
    href: "/dashboard/preceptor",
    label: "Preceptor",
    description: "Supervisao e feedback dos estagiarios",
    scope: "preceptor"
  },
  {
    href: "/dashboard/admin",
    label: "Instituicao",
    description: "Governanca, usuarios e operacao",
    scope: "admin"
  }
];

export function getNavigationByScope(scope: DashboardScope) {
  return items.filter((item) => item.scope === "shared" || item.scope === scope);
}
