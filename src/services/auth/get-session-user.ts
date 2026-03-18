import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";

export const getSessionUser = cache(async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});
