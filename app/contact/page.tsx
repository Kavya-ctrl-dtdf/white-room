import Link from "next/link";
import { getViewer } from "@/lib/auth/viewer";
import { autoReplyTemplate, cleanReference, fillReference } from "@/lib/help/autoReply";
import { sendMessage } from "./actions";

export const metadata = { title: "Contact us: White Room" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; ref?: string; mailed?: string; error?: string; topic?: string; listing?: string }>;
}) {
  const { sent, ref: refParam, mailed, error, topic = "stay", listing = "" } = await searchParams;
  const { user, name } = await getViewer();

  if (sent) {
    const ref = cleanReference(refParam);
    return (
      <div className="mx-auto max-w-xl px-5 py-16 md:py-20">
        <div className="drafting rounded-[28px] border border-line px-6 py-10 md:px-10">
          <h1 className="text-3xl md:text-4xl">Message sent</h1>
          {ref && (
            <p className="mt-3 text-sm text-graphite">
              Your reference number is <span className="font-semibold text-ink tnum">{ref}</span>. Keep it if you write to us again.
            </p>
          )}

          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <p className="text-sm font-semibold text-seal">Automated reply</p>
            <p className="mt-2 leading-relaxed">{fillReference(autoReplyTemplate(topic), ref)}</p>
            {mailed && <p className="mt-3 text-sm text-graphite">We have also emailed you a copy of this reply.</p>}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <Link href="/my-queries" className="btn btn-primary">
                View my help queries
              </Link>
            ) : (
              <Link href="/login?next=/my-queries" className="btn btn-primary">
                Sign in to track your queries
              </Link>
            )}
            <Link href="/stays" className="btn btn-quiet">
              Find a stay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl">Contact us</h1>
      <p className="mt-3 text-graphite">
        Questions about a home, a booking or listing your property. You get an automated reply with a reference number right
        away, and a person replies within one working day.
      </p>

      {error === "missing" && (
        <p role="alert" className="mt-6 rounded-xl bg-alertsoft p-4 text-sm font-medium text-alert">
          Add your name, email and a message, then send again.
        </p>
      )}
      {error === "send" && (
        <p role="alert" className="mt-6 rounded-xl bg-alertsoft p-4 text-sm font-medium text-alert">
          The message didn&apos;t send. Check your email address and try again.
        </p>
      )}

      <form action={sendMessage} className="panel relative mt-6 space-y-4 p-5 md:p-6">
        <div>
          <label htmlFor="c-name" className="label">Your name</label>
          <input id="c-name" name="name" autoComplete="name" required maxLength={120} defaultValue={name ?? ""} className="field" />
        </div>
        <div>
          <label htmlFor="c-email" className="label">Email</label>
          <input
            id="c-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            defaultValue={user?.email ?? ""}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="c-phone" className="label">Phone (optional)</label>
          <input id="c-phone" name="phone" type="tel" autoComplete="tel" maxLength={20} placeholder="+91" className="field" />
        </div>
        <div>
          <label htmlFor="c-topic" className="label">What is it about?</label>
          <select id="c-topic" name="topic" defaultValue={topic} className="field">
            <option value="stay">Finding a stay</option>
            <option value="booking">A booking I&apos;ve made</option>
            <option value="owner">Listing my property</option>
            <option value="other">Something else</option>
          </select>
        </div>
        {listing && <input type="hidden" name="listing" value={listing} />}
        <div>
          <label htmlFor="c-message" className="label">Message</label>
          <textarea id="c-message" name="message" required minLength={5} maxLength={4000} rows={6} className="field" />
        </div>
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
          <label>
            Company
            <input name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Send message
        </button>
      </form>
    </div>
  );
}
