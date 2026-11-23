"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNext, supabaseConfigured } from "@/lib/supabase/config";

async function siteUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;
}

const back = (params: Record<string, string>, next: string) =>
  `/login?${new URLSearchParams({ ...params, next }).toString()}`;

export async function signInWithPassword(formData: FormData) {
  const next = safeNext(formData.get("next") as string | null);
  if (!supabaseConfigured) redirect(back({ error: "setup" }, next));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect(back({ error: "credentials" }, next));
  redirect(next);
}

export async function signUp(formData: FormData) {
  const next = safeNext(formData.get("next") as string | null);
  if (!supabaseConfigured) redirect(back({ error: "setup" }, next));

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: {
      data: { full_name: String(formData.get("full_name") ?? "") },
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) redirect(back({ mode: "signup", error: "signup" }, next));
  redirect(back({ sent: "confirm" }, next));
}

export async function sendMagicLink(formData: FormData) {
  const next = safeNext(formData.get("next") as string | null);
  if (!supabaseConfigured) redirect(back({ error: "setup" }, next));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: String(formData.get("email")),
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) redirect(back({ error: "send" }, next));
  redirect(back({ sent: "link" }, next));
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(formData.get("next") as string | null);
  if (!supabaseConfigured) redirect(back({ error: "setup" }, next));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) redirect(back({ error: "google" }, next));
  redirect(data.url);
}
