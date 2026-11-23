import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext, supabaseConfigured, type Role } from "./config";

// Any signed-in user.
const SIGNED_IN = ["/trips", "/my-queries"];
// Hosts and admins. This includes /host/new.
const HOST_ONLY = ["/host"];
const ADMIN_ONLY = ["/admin"];

const startsWithAny = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(p + "/"));

export async function updateSession(request: NextRequest) {
  // No Supabase keys: leave the site open, as the demo has always been.
  if (!supabaseConfigured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Do not put code between createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsHost = startsWithAny(path, HOST_ONLY);
  const needsAdmin = startsWithAny(path, ADMIN_ONLY);
  const needsAuth = startsWithAny(path, SIGNED_IN) || needsHost || needsAdmin;

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  if (user && (needsHost || needsAdmin)) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role: Role = (profile?.role as Role | undefined) ?? "guest";
    const allowed = needsAdmin ? role === "admin" : role === "host" || role === "admin";

    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/not-allowed";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // Signed-in users who open /login go where they were headed, or to My stays.
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = safeNext(request.nextUrl.searchParams.get("next"));
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
