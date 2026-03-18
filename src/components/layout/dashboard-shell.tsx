import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getNavigationByScope } from "@/services/navigation/navigation";
import type { DashboardScope, UserProfile } from "@/types/auth";

interface DashboardShellProps {
  profile: UserProfile;
  scope: DashboardScope;
  children: ReactNode;
}

export function DashboardShell({ profile, scope, children }: DashboardShellProps) {
  const navigation = getNavigationByScope(scope);

  if (scope === "admin") {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">{profile.institution_name}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.full_name} · {profile.role} · institution_id: {profile.institution_id}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="container space-y-4 py-6">
          <div className="flex snap-x gap-3 overflow-x-auto pb-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-w-[220px] snap-start rounded-[1.25rem] border border-border/80 bg-card/90 px-4 py-4 shadow-sm transition-colors hover:bg-accent"
              >
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="rounded-[1.25rem] border border-border/80 bg-card/90 px-4 py-4 shadow-sm">
            <p className="text-sm leading-6 text-muted-foreground">
              Base pronta para conectar trilhas SBA, avaliacoes, logbook e modulos clinicos sem quebrar o isolamento multi-tenant.
            </p>
          </div>

          <main>{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">{profile.institution_name}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {profile.full_name} · {profile.role} · institution_id: {profile.institution_id}
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>
      <div className="container grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[1.5rem] border border-border/80 bg-card/90 p-4">
          <Badge className="mb-4">Navegacao</Badge>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-3 py-3 text-sm transition-colors hover:bg-accent"
              >
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </nav>
          <Separator className="my-4" />
          <p className="text-xs leading-5 text-muted-foreground">
            Base pronta para conectar trilhas SBA, avaliacoes, logbook e modulos clinicos sem quebrar o isolamento
            multi-tenant.
          </p>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
