import { createClient } from "./server";
import { supabaseConfigured, type AccountState, type Role } from "./config";

/** Who is signed in, for the header. Safe to call when Supabase is not set up. */
export async function getAccount(): Promise<AccountState> {
  if (!supabaseConfigured) return { configured: false, signedIn: false, name: null, role: null };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { configured: true, signedIn: false, name: null, role: null };

    const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
    return {
      configured: true,
      signedIn: true,
      name: profile?.full_name || user.email || null,
      role: (profile?.role as Role | undefined) ?? "guest",
    };
  } catch {
    return { configured: true, signedIn: false, name: null, role: null };
  }
}
