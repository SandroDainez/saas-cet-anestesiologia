import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Smartphone } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    title: "Arquitetura multi-tenant",
    body: "Estrutura pensada para isolamento por institution_id desde a autenticacao ate a camada de dashboards.",
    icon: Building2
  },
  {
    title: "Governanca de acesso",
    body: "Papéis iniciais cobertos com redirecionamento por perfil e base pronta para RLS no Supabase.",
    icon: ShieldCheck
  },
  {
    title: "Mobile first",
    body: "Layout pensado para a rotina do CET no celular, sem perder legibilidade em telas maiores.",
    icon: Smartphone
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10 sm:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <Badge>Fundacao do projeto</Badge>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Plataforma SaaS para treinamento, avaliacao e operacao de CETs de anestesiologia.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Esta primeira entrega prepara autenticacao com Supabase, estrutura modular em `src/`, dashboards por
              perfil e suporte inicial a multi-tenant.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Entrar na plataforma
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver roteamento protegido
                </Button>
              </Link>
            </div>
          </div>
          <Card className="overflow-hidden border-primary/10 bg-card/90">
            <CardHeader>
              <CardTitle>Ponto de partida desta etapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Sem modulos clinicos completos nesta fase.</p>
              <p>Com autenticacao, estrutura de pastas, middleware e dashboards iniciais ja acoplados.</p>
              <p>Pronto para conectar curriculo SBA, banco de questoes, logbook e simulacoes nas proximas fases.</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ title, body, icon: Icon }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="rounded-2xl bg-accent p-3 text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
