"use server";

import { redirect } from "next/navigation";
import { autoReplyTemplate, fillReference } from "@/lib/help/autoReply";
import { sendHelpEmails } from "@/lib/help/email";
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

  // 1. Save the query. One database call stores it, makes the reference number and the automated reply.
  const supabase = await createClient();
  const { data: rpcRef, error } = await supabase.rpc("submit_help_query", {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_topic: topic,
    p_listing: listing,
    p_message: message,
    p_auto_reply: autoReplyTemplate(topic),
  });

  let saved = !error && typeof rpcRef === "string";
  const ref = saved ? (rpcRef as string) : null;

  // If the database function isn't installed, fall back to a plain save without a reference number.
  const missingFunction = error?.code === "PGRST202" || /submit_help_query/.test(error?.message ?? "");
  if (!saved && missingFunction) {
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
    saved = !insertError;
  }

  if (!saved) redirect("/contact?error=send");

  // 2. Email the owner and send the automatic acknowledgement. Awaited so it finishes before the
  //    server function stops; a failure here never loses the query, which is already saved.
  const mail = await sendHelpEmails({
    ref,
    name,
    email,
    phone,
    topic,
    listing,
    message,
    autoReply: fillReference(autoReplyTemplate(topic), ref),
  });

  const params = new URLSearchParams({ sent: "1", topic });
  if (ref) params.set("ref", ref);
  if (mail.ack) params.set("mailed", "1");
  redirect(`/contact?${params.toString()}`);
}
