"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

const TOPICS = ["stay", "owner", "booking", "other"] as const;

export async function sendMessage(formData: FormData) {
  // Honeypot: real people never fill this hidden field.
  if (String(formData.get("company") ?? "") !== "") redirect("/contact?sent=1");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const topicRaw = String(formData.get("topic") ?? "stay");
  const topic = (TOPICS as readonly string[]).includes(topicRaw) ? topicRaw : "other";
  const listing = String(formData.get("listing") ?? "").trim().slice(0, 40) || null;
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || message.length < 5) redirect("/contact?error=missing");
  if (!supabaseConfigured) redirect("/contact?error=send");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No .select() after the insert: visitors may write messages but not read them back.
  const { error } = await supabase.from("contact_messages").insert({
    user_id: user?.id ?? null,
    name,
    email,
    phone,
    topic,
    listing_id: listing,
    message,
  });

  if (error) redirect("/contact?error=send");
  redirect("/contact?sent=1");
}
