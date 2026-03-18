"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm() {
  const router = useRouter();
  const isConfigured = isSupabaseConfigured();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    if (!isConfigured) {
      setError("Configure as variaveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    const supabase = createBrowserClient();
    const email = String(formData.get("login_email") ?? "");
    const password = String(formData.get("login_password") ?? "");

    setError(null);

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    startTransition(async () => {
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      const profileSyncResult = await supabase.rpc("ensure_session_profile", {
        _user_id: result.data.user.id
      });

      if (profileSyncResult.error && profileSyncResult.error.code !== "PGRST202") {
        setError(profileSyncResult.error.message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle>Acesso institucional</CardTitle>
        <CardDescription>
          Entre com Supabase Auth. O `institution_id` e o papel do usuario sao lidos do metadata da conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4" autoComplete="off" data-form-type="other">
          <div className="space-y-2">
            <Label htmlFor="login_email">E-mail</Label>
            <Input
              id="login_email"
              name="login_email"
              type="email"
              placeholder="voce@instituicao.br"
              autoComplete="email"
              data-lpignore="true"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login_password">Senha</Label>
            <Input
              id="login_password"
              name="login_password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              data-lpignore="true"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!isConfigured ? (
            <p className="text-sm text-muted-foreground">
              Preencha `.env.local` antes de autenticar com o Supabase.
            </p>
          ) : null}
          <Button className="w-full" type="submit" disabled={isPending || !isConfigured}>
            {isPending ? "Processando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
