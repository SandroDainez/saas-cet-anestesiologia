"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COMMANDS = [
  { label: "Git push", value: "git push origin main" },
  { label: "Supabase", value: "supabase db push" },
  { label: "Vercel deploy", value: "vercel deploy" }
];

export function CommandQuickActions() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (command: string) => {
    await navigator.clipboard.writeText(command);
    setCopied(command);
    setTimeout(() => setCopied((prev) => (prev === command ? null : prev)), 2000);
  };

  return (
    <Card className="space-y-3 border border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>Atualizar deploy</CardTitle>
        <p className="text-sm text-muted-foreground">
          Execute estes comandos no terminal do workspace para sincronizar Git, banco e Vercel.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {COMMANDS.map((command) => (
          <div key={command.value} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{command.label}</p>
              <p className="text-sm font-semibold text-foreground">{command.value}</p>
            </div>
              <Button size="sm" variant="outline" onClick={() => handleCopy(command.value)}>
              {copied === command.value ? "Copiado" : "Copiar"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
