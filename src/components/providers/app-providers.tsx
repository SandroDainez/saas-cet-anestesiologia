"use client";

import { type ReactNode, useState } from "react";
import { type Session } from "@supabase/supabase-js";

import { createBrowserClient } from "@/lib/supabase/client";

interface AppProvidersProps {
  children: ReactNode;
  initialSession: Session | null;
}

export function AppProviders({ children, initialSession }: AppProvidersProps) {
  const [supabase] = useState(() => createBrowserClient());

  return (
    <div data-session={initialSession ? "authenticated" : "anonymous"} data-supabase-ready={Boolean(supabase)}>
      {children}
    </div>
  );
}
