"use client";

import { useActionState, useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { onboardInstitutionUser, type UserOnboardingState } from "@/features/admin/actions/user-onboarding";

interface UserOnboardingPanelProps {
  isAdminConfigured: boolean;
  compact?: boolean;
}

const fieldClassName =
  "flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function UserOnboardingPanel({ isAdminConfigured, compact = false }: UserOnboardingPanelProps) {
  const [state, formAction, isPending] = useActionState(onboardInstitutionUser, {
    status: "idle",
    message: null
  } satisfies UserOnboardingState);
  const [mode, setMode] = useState<"invite" | "create">("invite");
  const [role, setRole] = useState<"trainee" | "preceptor" | "coordinator" | "institution_admin">("trainee");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      setIsOpen(false);
    }
  }, [state.status]);

  return (
    <>
      {compact ? (
        <div className="space-y-3">
          {!isAdminConfigured ? (
            <p className="text-sm text-destructive">
              Configure `SUPABASE_SERVICE_ROLE_KEY` para habilitar criacao e convite automaticos.
            </p>
          ) : null}
          <Button type="button" onClick={() => setIsOpen(true)} disabled={!isAdminConfigured} className="w-full">
            Abrir onboarding
          </Button>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Novo usuario</CardTitle>
            <CardDescription>
              Abra o onboarding em um modal dedicado para criar ou convidar usuarios sem poluir a barra lateral.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              Defina papel, vinculo institucional e dados iniciais em um fluxo unico. O backend sincroniza Auth e perfis automaticamente.
            </div>
            {!isAdminConfigured ? (
              <p className="text-sm text-destructive">
                Configure `SUPABASE_SERVICE_ROLE_KEY` para habilitar criacao e convite automaticos.
              </p>
            ) : null}
            <Button type="button" onClick={() => setIsOpen(true)} disabled={!isAdminConfigured} className="w-full">
              Abrir onboarding
            </Button>
          </CardContent>
        </Card>
      )}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          <Card className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden">
            <CardHeader className="border-b border-border/70">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>Onboarding institucional</CardTitle>
                  <CardDescription>
                    Crie ou convide usuarios sem painel manual do Supabase. O backend define `institution_id`, papel e perfis automaticamente.
                  </CardDescription>
                </div>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                  Fechar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[calc(90vh-110px)] overflow-y-auto pt-6">
              <form action={formAction} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="onboarding_mode">Modo</Label>
                  <select
                    id="onboarding_mode"
                    name="onboarding_mode"
                    value={mode}
                    onChange={(event) => setMode(event.target.value as "invite" | "create")}
                    className={fieldClassName}
                    disabled={isPending || !isAdminConfigured}
                    autoComplete="off"
                  >
                    <option value="invite">Convidar por e-mail</option>
                    <option value="create">Criar com senha</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_role">Papel</Label>
                  <select
                    id="user_role"
                    name="user_role"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as "trainee" | "preceptor" | "coordinator" | "institution_admin")
                    }
                    className={fieldClassName}
                    disabled={isPending || !isAdminConfigured}
                    autoComplete="off"
                  >
                    <option value="trainee">Trainee</option>
                    <option value="preceptor">Preceptor</option>
                    <option value="coordinator">Coordenador</option>
                    <option value="institution_admin">Admin institucional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_full_name">Nome completo</Label>
                  <Input
                    id="user_full_name"
                    name="user_full_name"
                    placeholder="Nome do usuario"
                    disabled={isPending || !isAdminConfigured}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_email">E-mail</Label>
                  <Input
                    id="user_email"
                    name="user_email"
                    type="email"
                    placeholder="usuario@instituicao.br"
                    disabled={isPending || !isAdminConfigured}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_phone">Telefone</Label>
                  <Input id="user_phone" name="user_phone" placeholder="(11) 99999-9999" disabled={isPending || !isAdminConfigured} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_cpf">CPF</Label>
                  <Input id="user_cpf" name="user_cpf" placeholder="000.000.000-00" disabled={isPending || !isAdminConfigured} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_crm">CRM</Label>
                  <Input id="user_crm" name="user_crm" placeholder="CRM opcional" disabled={isPending || !isAdminConfigured} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_address_text">Endereco</Label>
                  <Input id="user_address_text" name="user_address_text" placeholder="Endereco opcional" disabled={isPending || !isAdminConfigured} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_avatar_url">Foto</Label>
                  <Input id="user_avatar_url" name="user_avatar_url" placeholder="URL da foto" disabled={isPending || !isAdminConfigured} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_training_year">Ano</Label>
                  <select
                    id="user_training_year"
                    name="user_training_year"
                    className={fieldClassName}
                    disabled={role !== "trainee" || isPending || !isAdminConfigured}
                    defaultValue="ME1"
                    autoComplete="off"
                  >
                    <option value="ME1">ME1</option>
                    <option value="ME2">ME2</option>
                    <option value="ME3">ME3</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial_password">Senha inicial</Label>
                  <Input
                    id="initial_password"
                    name="initial_password"
                    type="password"
                    placeholder={mode === "invite" ? "Nao obrigatoria no convite" : "Minimo de 8 caracteres"}
                    disabled={mode !== "create" || isPending || !isAdminConfigured}
                    autoComplete="new-password"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Convite envia acesso por e-mail. Criacao direta gera conta pronta para login imediato.
                  </p>
                  {!isAdminConfigured ? (
                    <p className="text-sm text-destructive">
                      Configure `SUPABASE_SERVICE_ROLE_KEY` para habilitar criacao e convite automaticos.
                    </p>
                  ) : null}
                  {state.message ? (
                    <p
                      className={cn(
                        "text-sm",
                        state.status === "success" ? "text-emerald-600" : state.status === "error" ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {state.message}
                    </p>
                  ) : null}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isPending || !isAdminConfigured}>
                      {isPending ? "Processando..." : mode === "invite" ? "Enviar convite" : "Criar usuario"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
