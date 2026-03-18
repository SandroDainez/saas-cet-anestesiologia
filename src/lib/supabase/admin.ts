import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env, isSupabaseAdminConfigured } from "@/lib/env";

export function createAdminClient() {
  if (!isSupabaseAdminConfigured() || !env.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin onboarding.");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
