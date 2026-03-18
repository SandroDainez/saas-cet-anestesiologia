import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            CET
          </div>
          <div>
            <p className="text-sm font-semibold">SaaS CET Anestesiologia</p>
            <p className="text-xs text-muted-foreground">Base multi-institucional</p>
          </div>
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-6 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:flex">
          <Link href="/curriculum" className="text-muted-foreground transition hover:text-primary">
            Currículo SBA
          </Link>
          <Link href="/trilhas" className="text-muted-foreground transition hover:text-primary">
            Trilhas de estudo
          </Link>
          <Link href="/question-bank" className="text-muted-foreground transition hover:text-primary">
            Banco de questões
          </Link>
          <Link href="/exams" className="text-muted-foreground transition hover:text-primary">
            Provas
          </Link>
          <Link href="/logbook" className="text-muted-foreground transition hover:text-primary">
            Logbook
          </Link>
          <Link href="/emergencies" className="text-muted-foreground transition hover:text-primary">
            Emergências
          </Link>
          <Link href="/preanesthetic" className="text-muted-foreground transition hover:text-primary">
            Pré-anestésico
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Badge className="hidden sm:inline-flex">mobile-first</Badge>
          <Link href="/login">
            <Button size="sm">Entrar</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
