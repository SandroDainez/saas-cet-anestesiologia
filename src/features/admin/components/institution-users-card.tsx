"use client";

import { useActionState, useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  deleteInstitutionUser,
  promoteInstitutionTrainee,
  toggleInstitutionUserActive,
  triggerInstitutionUserAccessAction,
  type UserOnboardingState,
  updateInstitutionUser
} from "@/features/admin/actions/user-onboarding";
import type { InstitutionUserSummary } from "@/services/admin/fetch-institution-users";
import type { TraineeYearCode } from "@/types/database";

interface InstitutionUsersCardProps {
  users: InstitutionUserSummary[];
  currentUserId: string;
  institutionName: string;
  institutionId: string;
}

type ManagedRole = "trainee" | "preceptor" | "coordinator" | "institution_admin";

function toManagedRole(role: InstitutionUserSummary["role"]): ManagedRole {
  if (role === "preceptor" || role === "coordinator" || role === "institution_admin") {
    return role;
  }

  return "trainee";
}

function roleLabel(role: InstitutionUserSummary["role"]) {
  switch (role) {
    case "institution_admin":
      return "Admin institucional";
    case "coordinator":
      return "Coordenador";
    case "preceptor":
      return "Preceptor";
    case "trainee_me1":
      return "Trainee ME1";
    case "trainee_me2":
      return "Trainee ME2";
    case "trainee_me3":
      return "Trainee ME3";
    default:
      return "Perfil indefinido";
  }
}

function roleOrder(role: InstitutionUserSummary["role"]) {
  switch (role) {
    case "institution_admin":
      return 1;
    case "coordinator":
      return 2;
    case "preceptor":
      return 3;
    case "trainee_me1":
      return 4;
    case "trainee_me2":
      return 5;
    case "trainee_me3":
      return 6;
    default:
      return 99;
  }
}

function statusLabel(active: boolean) {
  return active ? "Ativo" : "Inativo";
}

function ExpandableSection({
  title,
  description,
  children,
  defaultOpen = false
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-2xl border border-border/70 bg-muted/20 open:bg-muted/35"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <span className="mt-0.5 text-xs font-medium text-muted-foreground transition group-open:rotate-180">
          v
        </span>
      </summary>
      <div className="border-t border-border/60 px-4 py-4">{children}</div>
    </details>
  );
}

function HiddenContextFields({
  user,
  role,
  trainingYear
}: {
  user: InstitutionUserSummary;
  role: ManagedRole;
  trainingYear: TraineeYearCode | "";
}) {
  return (
    <>
      <input type="hidden" name="managed_user_id" value={user.id} />
      <input type="hidden" name="managed_full_name" value={user.fullName} />
      <input type="hidden" name="managed_email" value={user.email} />
      <input type="hidden" name="managed_role" value={role} />
      <input type="hidden" name="managed_training_year" value={trainingYear} />
    </>
  );
}

function SummaryChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function UserRow({
  user,
  index,
  currentUserId,
  institutionName,
  institutionId
}: {
  user: InstitutionUserSummary;
  index: number;
  currentUserId: string;
  institutionName: string;
  institutionId: string;
}) {
  const initialRole = toManagedRole(user.role);
  const [role, setRole] = useState<ManagedRole>(initialRole);
  const [trainingYear, setTrainingYear] = useState<TraineeYearCode | "">(user.trainingYear ?? "");

  const [updateState, updateAction, isUpdating] = useActionState(updateInstitutionUser, {
    status: "idle",
    message: null
  } satisfies UserOnboardingState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteInstitutionUser, {
    status: "idle",
    message: null
  } satisfies UserOnboardingState);
  const [promoteState, promoteAction, isPromoting] = useActionState(promoteInstitutionTrainee, {
    status: "idle",
    message: null
  } satisfies UserOnboardingState);
  const [toggleState, toggleAction, isToggling] = useActionState(toggleInstitutionUserActive, {
    status: "idle",
    message: null
  } satisfies UserOnboardingState);
  const [accessState, accessAction, isTriggeringAccess] = useActionState(triggerInstitutionUserAccessAction, {
    status: "idle",
    message: null
  } satisfies UserOnboardingState);

  const isSelf = user.id === currentUserId;
  const isBusy = isUpdating || isDeleting || isPromoting || isToggling || isTriggeringAccess;
  const canPromote = user.role === "trainee_me1" || user.role === "trainee_me2";
  const nextYear = user.role === "trainee_me1" ? "ME2" : user.role === "trainee_me2" ? "ME3" : null;
  const effectiveTrainingYear = role === "trainee" ? trainingYear || "ME1" : "";

  const summaryMeta = useMemo(
    () => [
      roleLabel(user.role),
      user.trainingYear ?? null,
      statusLabel(user.active)
    ].filter(Boolean),
    [user.active, user.role, user.trainingYear]
  );

  return (
    <details className="rounded-[1.5rem] border border-border/80 bg-card/95 shadow-sm open:shadow-md">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">{String(index).padStart(2, "0")}.</span>
            <h3 className="truncate text-sm font-semibold tracking-tight">{user.fullName}</h3>
          </div>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
          {summaryMeta.map((item) => (
            <SummaryChip key={item}>{item}</SummaryChip>
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground">Abrir</span>
      </summary>

      <div className="border-t border-border/70 px-5 py-5">
        <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
          {summaryMeta.map((item) => (
            <SummaryChip key={item}>{item}</SummaryChip>
          ))}
        </div>

        <div className="mb-4 grid min-w-0 gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Instituicao</p>
            <p className="text-sm font-medium">{institutionName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tenant</p>
            <p className="break-all text-sm text-muted-foreground">{institutionId}</p>
          </div>
        </div>

        <div className="grid gap-3">
          <ExpandableSection
            title="Credenciais e Acesso"
            description="Nome, e-mail, papel e ano. Mantem o escopo do usuario coerente com o tenant."
            defaultOpen={false}
          >
            <form action={updateAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="managed_user_id" value={user.id} />
              <input type="hidden" name="managed_phone" value={user.phone ?? ""} />
              <input type="hidden" name="managed_cpf" value={user.cpf ?? ""} />
              <input type="hidden" name="managed_crm" value={user.crm ?? ""} />
              <input type="hidden" name="managed_address_text" value={user.addressText ?? ""} />
              <input type="hidden" name="managed_avatar_url" value={user.avatarUrl ?? ""} />

              <div className="space-y-2">
                <Label htmlFor={`managed_full_name_${user.id}`}>Nome</Label>
                <Input
                  id={`managed_full_name_${user.id}`}
                  name="managed_full_name"
                  defaultValue={user.fullName}
                  disabled={isBusy}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`managed_email_${user.id}`}>E-mail</Label>
                <Input
                  id={`managed_email_${user.id}`}
                  name="managed_email"
                  type="email"
                  defaultValue={user.email}
                  disabled={isBusy}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`managed_role_${user.id}`}>Papel</Label>
                <select
                  id={`managed_role_${user.id}`}
                  name="managed_role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as ManagedRole)}
                  className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={isBusy}
                >
                  <option value="trainee">Trainee</option>
                  <option value="preceptor">Preceptor</option>
                  <option value="coordinator">Coordenador</option>
                  <option value="institution_admin">Admin institucional</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`managed_training_year_${user.id}`}>Ano</Label>
                {role === "trainee" ? (
                  <select
                    id={`managed_training_year_${user.id}`}
                    name="managed_training_year"
                    value={effectiveTrainingYear}
                    onChange={(event) => setTrainingYear(event.target.value as TraineeYearCode)}
                    className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isBusy}
                  >
                    <option value="ME1">ME1</option>
                    <option value="ME2">ME2</option>
                    <option value="ME3">ME3</option>
                  </select>
                ) : (
                  <div className="flex h-11 items-center rounded-2xl border border-input bg-muted/30 px-4 text-sm text-muted-foreground">
                    Nao aplicavel para este papel
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="outline" disabled={isBusy}>
                  {isUpdating ? "Salvando..." : "Salvar acesso"}
                </Button>
              </div>
            </form>
          </ExpandableSection>

          <ExpandableSection
            title="Dados pessoais"
            description="Telefone, CPF, CRM, endereco e foto. Tudo opcional e mantido fora da visao principal."
            defaultOpen={false}
          >
            <form action={updateAction} className="grid gap-3 md:grid-cols-2">
              <HiddenContextFields user={user} role={role} trainingYear={effectiveTrainingYear} />

              <div className="space-y-2">
                <Label htmlFor={`managed_phone_${user.id}`}>Telefone</Label>
                <Input
                  id={`managed_phone_${user.id}`}
                  name="managed_phone"
                  defaultValue={user.phone ?? ""}
                  disabled={isBusy}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`managed_cpf_${user.id}`}>CPF</Label>
                <Input
                  id={`managed_cpf_${user.id}`}
                  name="managed_cpf"
                  defaultValue={user.cpf ?? ""}
                  disabled={isBusy}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`managed_crm_${user.id}`}>CRM</Label>
                <Input
                  id={`managed_crm_${user.id}`}
                  name="managed_crm"
                  defaultValue={user.crm ?? ""}
                  disabled={isBusy}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`managed_address_text_${user.id}`}>Endereco</Label>
                <Input
                  id={`managed_address_text_${user.id}`}
                  name="managed_address_text"
                  defaultValue={user.addressText ?? ""}
                  disabled={isBusy}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`managed_avatar_url_${user.id}`}>Foto</Label>
                <Input
                  id={`managed_avatar_url_${user.id}`}
                  name="managed_avatar_url"
                  defaultValue={user.avatarUrl ?? ""}
                  disabled={isBusy}
                  autoComplete="off"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="outline" disabled={isBusy}>
                  {isUpdating ? "Salvando..." : "Salvar informacoes"}
                </Button>
              </div>
            </form>
          </ExpandableSection>

          <ExpandableSection
            title="Status do usuario"
            description="Visualiza situacao atual, progressao e acoes administrativas do perfil."
            defaultOpen={false}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Situacao</p>
                  <p className="mt-2 text-sm font-medium">{statusLabel(user.active)}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Progressao</p>
                  <p className="mt-2 text-sm font-medium">
                    {canPromote ? `Elegivel para ${nextYear}` : user.trainingYear ?? "Sem progressao"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Escopo</p>
                  <p className="mt-2 text-sm font-medium">{roleLabel(user.role)}</p>
                </div>
              </div>

              <div className="flex flex-col items-stretch justify-start gap-3">
                {canPromote ? (
                  <form action={promoteAction}>
                    <input type="hidden" name="managed_user_id" value={user.id} />
                    <Button type="submit" variant="secondary" disabled={isBusy} className="w-full">
                      {isPromoting ? "Promovendo..." : `Promover para ${nextYear}`}
                    </Button>
                  </form>
                ) : null}

                <form action={toggleAction}>
                  <input type="hidden" name="managed_user_id" value={user.id} />
                  <input type="hidden" name="managed_active" value={String(!user.active)} />
                  <Button type="submit" variant="outline" disabled={isSelf || isBusy} className="w-full">
                    {isToggling ? "Salvando..." : user.active ? "Desativar usuario" : "Ativar usuario"}
                  </Button>
                </form>

                <form action={accessAction}>
                  <input type="hidden" name="managed_user_id" value={user.id} />
                  <input type="hidden" name="managed_access_action" value="invite" />
                  <Button type="submit" variant="outline" disabled={isBusy} className="w-full">
                    {isTriggeringAccess ? "Processando..." : "Reenviar convite"}
                  </Button>
                </form>

                <form action={accessAction}>
                  <input type="hidden" name="managed_user_id" value={user.id} />
                  <input type="hidden" name="managed_access_action" value="reset_password" />
                  <Button type="submit" variant="outline" disabled={isBusy} className="w-full">
                    {isTriggeringAccess ? "Processando..." : "Redefinir senha"}
                  </Button>
                </form>

                <form action={deleteAction}>
                  <input type="hidden" name="managed_user_id" value={user.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    disabled={isSelf || isBusy}
                    className="w-full text-destructive hover:text-destructive"
                  >
                    {isDeleting ? "Excluindo..." : isSelf ? "Usuario atual" : "Excluir usuario"}
                  </Button>
                </form>
              </div>
            </div>
          </ExpandableSection>
        </div>

        {updateState.message ? (
          <p
            className={cn(
              "text-sm",
              updateState.status === "success" ? "text-emerald-600" : "text-destructive"
            )}
          >
            {updateState.message}
          </p>
        ) : null}

        {promoteState.message ? (
          <p
            className={cn(
              "text-sm",
              promoteState.status === "success" ? "text-emerald-600" : "text-destructive"
            )}
          >
            {promoteState.message}
          </p>
        ) : null}

        {deleteState.message ? (
          <p
            className={cn(
              "text-sm",
              deleteState.status === "success" ? "text-emerald-600" : "text-destructive"
            )}
          >
            {deleteState.message}
          </p>
        ) : null}

        {toggleState.message ? (
          <p
            className={cn(
              "text-sm",
              toggleState.status === "success" ? "text-emerald-600" : "text-destructive"
            )}
          >
            {toggleState.message}
          </p>
        ) : null}

        {accessState.message ? (
          <p
            className={cn(
              "text-sm",
              accessState.status === "success" ? "text-emerald-600" : "text-destructive"
            )}
          >
            {accessState.message}
          </p>
        ) : null}
      </div>
    </details>
  );
}

export function InstitutionUsersCard({
  users,
  currentUserId,
  institutionName,
  institutionId
}: InstitutionUsersCardProps) {
  const orderedUsers = [...users]
    .filter((user) => user.id !== currentUserId)
    .sort((left, right) => {
      const byRole = roleOrder(left.role) - roleOrder(right.role);
      if (byRole !== 0) {
        return byRole;
      }

      return left.fullName.localeCompare(right.fullName, "pt-BR");
    });

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Usuarios da instituicao</CardTitle>
        <CardDescription>
          Lista numerada e organizada por hierarquia institucional. Clique para abrir acesso, dados pessoais e status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orderedUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum usuario encontrado para esta instituicao.</p>
        ) : (
          <div className="space-y-4">
            {orderedUsers.map((user, index) => (
              <UserRow
                key={user.id}
                user={user}
                index={index + 1}
                currentUserId={currentUserId}
                institutionName={institutionName}
                institutionId={institutionId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
