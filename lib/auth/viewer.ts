import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured, type Role } from "@/lib/supabase/config";

export type { Role };

/** The signed-in person for this request, looked up once and shared by the header, footer and pages. */
export const getViewer = cache(async () => {
  const none = { user: null as User | null, role: null as Role | null, name: null as string | null };
  if (!supabaseConfigured) return none;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return none;

    const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();

    return {
      user,
      role: (profile?.role ?? "guest") as Role,
      name: (profile?.full_name || user.email || null) as string | null,
    };
  } catch {
    return none;
  }
});
