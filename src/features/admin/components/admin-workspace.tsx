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
  sections
}: AdminWorkspaceProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Admin institucional</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{heading}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{intro}</p>
      </div>

      <div className="flex snap-x gap-3 overflow-x-auto pb-1">
        {sections.map((section, index) => (
          <a
            key={section.href}
            href={section.href}
            className="min-w-[220px] snap-start rounded-[1.25rem] border border-stone-200 bg-white px-4 py-4 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{section.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{section.description}</p>
          </a>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <Card className="border-stone-200 shadow-sm">
            <CardContent className="px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Instituicao</p>
              <p className="mt-3 text-base font-semibold text-slate-900">{institutionName}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Tenant ativo: {institutionId}</p>
            </CardContent>
          </Card>

          <Card id="contexto" className="border-stone-200 shadow-sm">
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Tenant atual</p>
              </div>
              <p className="mt-3 text-base font-semibold text-slate-900">{institutionName}</p>
              <p className="mt-2 break-all text-xs leading-5 text-slate-500">{institutionId}</p>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm">
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Users className="h-4 w-4 text-emerald-600" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Usuarios</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{users.length}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Equipe vinculada a este tenant.</p>
            </CardContent>
          </Card>

          {stats
            .filter((item) => item.title === "Provas planejadas")
            .map((item) => (
              <Card key={item.title} className="border-stone-200 shadow-sm">
                <CardContent className="px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.title}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                </CardContent>
              </Card>
            ))}

          <Card id="permissoes" className="border-stone-200 shadow-sm">
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Regras</p>
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <p>`institution_id` e papel sao definidos automaticamente.</p>
                <p>Ano so existe para trainees.</p>
                <p>Promocao natural: ME1, depois ME2, depois ME3.</p>
              </div>
            </CardContent>
          </Card>

          <Card id="novo-usuario" className="border-emerald-200 bg-emerald-50/70 shadow-sm">
            <CardContent className="px-4 py-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <UserPlus className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Novo usuario</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">Onboarding por modal</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Defina papel, vinculo institucional e dados iniciais sem poluir o restante da tela.
              </p>
              <div className="mt-4">
                <UserOnboardingPanel isAdminConfigured={isAdminConfigured} compact />
              </div>
            </CardContent>
          </Card>
        </aside>

        <main id="equipe" className="space-y-5" />

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
