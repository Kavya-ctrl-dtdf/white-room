"use server";

import { redirect } from "next/navigation";
import { autoReplyTemplate } from "@/lib/help/autoReply";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

const TOPICS = ["stay", "owner", "booking", "other"] as const;

export async function sendMessage(formData: FormData) {
  // Honeypot: real people never fill this hidden field.
  if (String(formData.get("company") ?? "") !== "") redirect("/contact?sent=1");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const topicRaw = String(formData.get("topic") ?? "stay");
  const topic = (TOPICS as readonly string[]).includes(topicRaw) ? topicRaw : "other";
  const listing = String(formData.get("listing") ?? "").trim().slice(0, 40);
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || message.length < 5) redirect("/contact?error=missing");
  if (!supabaseConfigured) redirect("/contact?error=send");

  // One database call saves the query, makes the reference number and stores the automated reply.
  const supabase = await createClient();
  const { data: ref, error } = await supabase.rpc("submit_help_query", {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_topic: topic,
    p_listing: listing,
    p_message: message,
    p_auto_reply: autoReplyTemplate(topic),
  });

  if (!error && typeof ref === "string") {
    redirect(`/contact?${new URLSearchParams({ sent: "1", ref, topic }).toString()}`);
  }

  // The database function isn't installed yet: fall back to a plain save, without a reference number.
  const missingFunction = error?.code === "PGRST202" || /submit_help_query/.test(error?.message ?? "");
  if (missingFunction) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("contact_messages").insert({
      user_id: user?.id ?? null,
      name,
      email,
      phone: phone || null,
      topic,
      listing_id: listing || null,
      message,
    });
    if (!insertError) redirect(`/contact?${new URLSearchParams({ sent: "1", topic }).toString()}`);
  }

  redirect("/contact?error=send");
}
