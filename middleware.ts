import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// Next.js 15 uses middleware.ts. (On Next.js 16 this file is renamed proxy.ts and exports `proxy`.)
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
