import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes = [
  "/dashboard",
  "/reports",
  "/curriculum",
  "/trilhas",
  "/question-bank",
  "/exams",
  "/logbook",
  "/emergencies",
  "/preanesthetic",
  "/surgery-guides",
  "/content-management",
  "/ai"
];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reports/:path*",
    "/curriculum/:path*",
    "/trilhas/:path*",
    "/question-bank/:path*",
    "/exams/:path*",
    "/logbook/:path*",
    "/emergencies/:path*",
    "/preanesthetic/:path*",
    "/surgery-guides/:path*",
    "/content-management/:path*",
    "/ai/:path*",
    "/login"
  ]
};
