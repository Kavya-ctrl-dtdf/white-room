import { getViewer } from "@/lib/auth/viewer";
import { supabaseConfigured, type AccountState } from "./config";

/** Who is signed in, for the header and footer. Safe to call when Supabase is not set up. */
export async function getAccount(): Promise<AccountState> {
  if (!supabaseConfigured) return { configured: false, signedIn: false, name: null, role: null };
  const { user, role, name } = await getViewer();
  return { configured: true, signedIn: !!user, name, role };
}
