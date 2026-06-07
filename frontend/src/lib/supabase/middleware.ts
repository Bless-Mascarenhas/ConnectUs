import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/auth");
  const isOnboardingRoute = path.startsWith("/onboarding");

  if (!user && !isAuthRoute && !path.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Redirect to onboarding if logged in but not completed
  if (user && !isOnboardingRoute && !isAuthRoute && !path.startsWith("/api")) {
    const onboardingCookie = request.cookies.get("onboarding_complete");
    if (onboardingCookie?.value !== "true") {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = { 
          cookie: request.headers.get("cookie") || "" 
        };
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const res = await fetch(`${request.nextUrl.origin}/api/users/me/onboarding-status`, {
          headers,
        });
        if (res.ok) {
          const { onboardingComplete } = await res.json();
          if (!onboardingComplete) {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding";
            return NextResponse.redirect(url);
          }
          // Cache the completed status
          supabaseResponse.cookies.set("onboarding_complete", "true", {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
      } catch (err) {
        console.error("Onboarding check error:", err);
      }
    }
  }

  return supabaseResponse;
}
