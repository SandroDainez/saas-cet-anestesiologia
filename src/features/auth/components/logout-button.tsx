"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={isPending}>
      {isPending ? "Saindo..." : "Sair"}
    </Button>
  );
}
