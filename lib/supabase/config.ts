export type Role = "guest" | "host" | "admin";

export interface AccountState {
  configured: boolean;
  signedIn: boolean;
  name: string | null;
  role: Role | null;
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Sign-in switches on only when both Supabase variables are set. Without them the
 * site runs as the open demo it was before, so a deploy never breaks for lack of keys.
 */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Only allow same-site paths as a sign-in return address (blocks open redirects). */
export function safeNext(value: string | null | undefined, fallback = "/trips"): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : fallback;
}
