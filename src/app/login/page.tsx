import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { getSessionProfile } from "@/services/auth/get-session-profile";
import { getDefaultDashboardPath } from "@/lib/auth/profile";

export default async function LoginPage() {
  const profile = await getSessionProfile();

  if (profile) {
    redirect(getDefaultDashboardPath(profile.role));
  }

  return (
    <main className="container flex min-h-screen items-center py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Supabase Auth</p>
          <h1 className="text-4xl font-semibold tracking-tight">Acesso inicial por perfil institucional</h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            O app ja trata o papel do usuario e o `institution_id` a partir do metadata da conta. Isso prepara o
            isolamento entre CETs desde a primeira etapa da plataforma.
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
