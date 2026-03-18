"use client";

import { Building2, ShieldCheck, UserPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InstitutionUsersCard } from "@/features/admin/components/institution-users-card";
import { UserOnboardingPanel } from "@/features/admin/components/user-onboarding-panel";
import type { InstitutionUserSummary } from "@/services/admin/fetch-institution-users";

interface AdminSectionLink {
  href: string;
  label: string;
  description: string;
}

interface AdminStat {
  title: string;
  value: string;
  description: string;
}

interface AdminWorkspaceProps {
  heading: string;
  intro: string;
  institutionName: string;
  institutionId: string;
  currentUserId: string;
  users: InstitutionUserSummary[];
  stats: AdminStat[];
  isAdminConfigured: boolean;
  sections: readonly AdminSectionLink[];
  children?: React.ReactNode;
}

export function AdminWorkspace({
  heading,
  intro,
  institutionName,
  institutionId,
  currentUserId,
  users,
  stats,
  isAdminConfigured,
  sections,
  children
}: AdminWorkspaceProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <Badge className="bg-accent/80 text-accent-foreground">Admin institucional</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{heading}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{intro}</p>
      </div>

      <div className="flex snap-x gap-3 overflow-x-auto pb-1">
        {sections.map((section, index) => (
          <a
            key={section.href}
            href={section.href}
            className="min-w-[220px] snap-start rounded-[1.5rem] border border-white/70 bg-white/82 px-4 py-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.35)] transition hover:border-primary/30 hover:bg-secondary/45"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">{section.label}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.description}</p>
          </a>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardContent className="px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Instituicao</p>
              <p className="mt-3 text-base font-semibold text-foreground">{institutionName}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Tenant ativo: {institutionId}</p>
            </CardContent>
          </Card>

          <Card id="contexto">
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Tenant atual</p>
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">{institutionName}</p>
              <p className="mt-2 break-all text-xs leading-5 text-muted-foreground">{institutionId}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Usuarios</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{users.length}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Equipe vinculada a este tenant.</p>
            </CardContent>
          </Card>

          {stats
            .filter((item) => item.title === "Provas planejadas")
            .map((item) => (
              <Card key={item.title}>
                <CardContent className="px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.title}</p>
                  <p className="mt-3 text-2xl font-semibold text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}

          <Card id="permissoes">
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Regras</p>
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <p>`institution_id` e papel sao definidos automaticamente.</p>
                <p>Ano so existe para trainees.</p>
                <p>Promocao natural: ME1, depois ME2, depois ME3.</p>
              </div>
            </CardContent>
          </Card>

          <Card id="novo-usuario" className="border-primary/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.9))]">
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-primary">
                <UserPlus className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Novo usuario</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Onboarding por modal</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Defina papel, vinculo institucional e dados iniciais sem poluir o restante da tela.
              </p>
              <div className="mt-4">
                <UserOnboardingPanel isAdminConfigured={isAdminConfigured} compact />
              </div>
            </CardContent>
          </Card>
        </aside>

        <main id="equipe" className="space-y-5">{children}</main>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <InstitutionUsersCard
            users={users}
            currentUserId={currentUserId}
            institutionName={institutionName}
            institutionId={institutionId}
          />
        </aside>
      </div>
    </section>
  );
}
