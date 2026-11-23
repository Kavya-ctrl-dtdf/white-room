import nodemailer from "nodemailer";
import { TOPIC_LABELS } from "./autoReply";

// Gmail with an app password. Server-only: these variables must never have a NEXT_PUBLIC_ prefix.
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const NOTIFY_TO = process.env.CONTACT_NOTIFY_TO || GMAIL_USER;

export const emailConfigured = Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);

export interface HelpQueryEmail {
  ref: string | null;
  name: string;
  email: string;
  phone: string;
  topic: string;
  listing: string;
  message: string;
  autoReply: string;
}

/**
 * Sends the owner notification and the automatic acknowledgement.
 * Never throws: a failed email must not lose the query, which is already saved in Supabase.
 */
export async function sendHelpEmails(q: HelpQueryEmail): Promise<{ owner: boolean; ack: boolean }> {
  if (!emailConfigured) return { owner: false, ack: false };

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  const topic = TOPIC_LABELS[q.topic] ?? "Something else";
  const refLine = q.ref ? `Reference: ${q.ref}\n` : "";
  const from = `"White Room" <${GMAIL_USER}>`;

  const owner = transport.sendMail({
    from,
    to: NOTIFY_TO,
    replyTo: q.email,
    subject: `New help query${q.ref ? ` ${q.ref}` : ""}: ${topic}`,
    text:
      `${refLine}` +
      `From: ${q.name} <${q.email}>\n` +
      (q.phone ? `Phone: ${q.phone}\n` : "") +
      `Topic: ${topic}\n` +
      (q.listing ? `Home: ${q.listing}\n` : "") +
      `\n${q.message}\n\n` +
      `Reply to this email to answer ${q.name} directly. All queries: https://white-room-delta.vercel.app/admin/messages\n`,
  });

  const ack = transport.sendMail({
    from,
    to: q.email,
    subject: q.ref ? `We have your message (${q.ref})` : "We have your message",
    text:
      `Hi ${q.name},\n\n` +
      `${q.autoReply}\n\n` +
      `Your message:\n"${q.message}"\n\n` +
      `White Room\nhttps://white-room-delta.vercel.app\n\n` +
      `This is an automatic reply. You can answer this email if you want to add something.\n`,
  });

  const [o, a] = await Promise.allSettled([owner, ack]);
  if (o.status === "rejected") console.error("Owner notification email failed:", (o.reason as Error)?.message);
  if (a.status === "rejected") console.error("Acknowledgement email failed:", (a.reason as Error)?.message);
  return { owner: o.status === "fulfilled", ack: a.status === "fulfilled" };
}
