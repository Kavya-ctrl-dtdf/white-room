import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext, supabaseConfigured } from "@/lib/supabase/config";

// Where Google and email links send people back after signing in.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (supabaseConfigured && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
