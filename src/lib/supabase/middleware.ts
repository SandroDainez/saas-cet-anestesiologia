import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";

import { env } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  if (!isSupabaseConfigured()) {
    return { response, user: null };
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { response, user };
}
