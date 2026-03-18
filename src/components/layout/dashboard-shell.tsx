import type { ReactNode } from "react";
import Link from "next/link";
import { Building2, Compass, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { getNavigationByScope } from "@/services/navigation/navigation";
import type { DashboardScope, UserProfile } from "@/types/auth";

interface DashboardShellProps {
  profile: UserProfile;
  scope: DashboardScope;
  children: ReactNode;
}

const scopeLabel: Record<DashboardScope, string> = {
  trainee: "Painel do trainee",
  preceptor: "Painel do preceptor",
  admin: "Painel institucional"
};

const scopeMessage: Record<DashboardScope, string> = {
  trainee: "Estudo, prática e progresso longitudinal em uma visão única.",
  preceptor: "Supervisão clínica e feedback com foco em prioridade e risco.",
  admin: "Governança, acompanhamento institucional e operação multiusuário."
};

export function DashboardShell({ profile, scope, children }: DashboardShellProps) {
  const navigation = getNavigationByScope(scope);

  return (
    <div className="dashboard-grid min-h-screen overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top_left,rgba(15,118,201,0.26),transparent_34%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.22),transparent_26%),linear-gradient(180deg,rgba(9,18,38,0.98),rgba(17,24,39,0.84))]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <LayoutDashboard className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-[0.18em] text-cyan-100/85">
                  {profile.institution_name}
                </p>
                <p className="truncate text-xs text-slate-300">
                  {profile.full_name} · {scopeLabel[scope]}
                </p>
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 xl:px-8">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.65)]">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-cyan-300/20 bg-cyan-300/12 text-cyan-100">{scopeLabel[scope]}</Badge>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Longitudinal analytics
              </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    Navegação clínica e educacional com leitura rápida no desktop e no celular.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    {scopeMessage[scope]} Dados, ações e permissões permanecem intactos; o foco aqui é hierarquia
                    visual, organização e leitura operacional.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Perfil</p>
                    <p className="mt-2 text-base font-semibold">{profile.role}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Instituição</p>
                    <p className="mt-2 text-base font-semibold">{profile.institution_name}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Ano</p>
                    <p className="mt-2 text-base font-semibold">{profile.training_year ?? "Gestão"}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.75rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(15,23,42,0.18))] p-5">
                  <div className="flex items-center gap-2 text-cyan-100">
                    <Compass className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.24em]">Leitura rápida</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Cards compactos, contraste mais forte e blocos pensados para leitura em plantão e acompanhamento em mobile.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    <p className="text-xs uppercase tracking-[0.24em]">Tenant seguro</p>
                  </div>
                  <p className="mt-3 break-all text-xs leading-5 text-slate-300">{profile.institution_id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur">
              <div className="flex items-center gap-2 text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Contexto</p>
              </div>
              <p className="mt-4 text-lg font-semibold">{profile.institution_name}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ambiente preparado para admin e usuários finais com experiência consistente entre telas.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Acesso rápido</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-border/80 bg-background px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/35 hover:bg-secondary/45"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="order-2 space-y-4 lg:order-1">
            <div className="rounded-[2rem] border border-white/70 bg-white/82 p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.38)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-accent/70 text-accent-foreground">Navegação</Badge>
                <span className="text-xs text-muted-foreground">{navigation.length} áreas</span>
              </div>
              <nav className="mt-4 space-y-3">
                {navigation.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group block rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4 hover:border-primary/30 hover:bg-secondary/35"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="order-1 space-y-6 lg:order-2">{children}</main>
        </div>
      </div>
    </div>
  );
}
