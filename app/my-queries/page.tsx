import Link from "next/link";
import { TOPIC_LABELS } from "@/lib/help/autoReply";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "My help queries: White Room" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Received", cls: "bg-ambersoft text-amber" },
  replied: { label: "Replied", cls: "bg-sealsoft text-seal" },
  closed: { label: "Closed", cls: "bg-wall text-graphite" },
};

interface Query {
  id: string;
  ref: string | null;
  topic: string;
  listing_id: string | null;
  message: string;
  auto_reply: string | null;
  status: string;
  created_at: string;
}

export default async function MyQueries() {
  let queries: Query[] = [];

  if (supabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("id, ref, topic, listing_id, message, auto_reply, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    queries = (data ?? []) as Query[];
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl md:text-4xl">My help queries</h1>
        <Link href="/contact" className="btn btn-primary btn-sm">
          Ask something new
        </Link>
      </div>

      {queries.length === 0 ? (
        <div className="drafting rounded-2xl border border-line px-6 py-14 text-center">
          <h2 className="text-2xl">No queries yet</h2>
          <p className="mx-auto mt-2 max-w-md text-graphite">
            When you send us a question, it shows up here with its reference number and our automated reply.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/contact" className="btn btn-primary">
              Contact us
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {queries.map((q) => {
            const s = STATUS[q.status] ?? STATUS.new;
            return (
              <li key={q.id} className="panel p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                  {q.ref && <span className="text-sm font-semibold tnum">{q.ref}</span>}
                  <span className="text-sm text-graphite tnum">{new Date(q.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <p className="mt-2 text-sm text-graphite">
                  {TOPIC_LABELS[q.topic] ?? "Something else"}
                  {q.listing_id && (
                    <>
                      , about{" "}
                      <Link href={`/stays/${q.listing_id}`} className="font-semibold text-seal hover:underline">
                        {q.listing_id}
                      </Link>
                    </>
                  )}
                </p>
                <p className="mt-3 whitespace-pre-wrap">{q.message}</p>
                {q.auto_reply && (
                  <div className="mt-4 rounded-xl bg-sealsoft p-4 text-sm">
                    <p className="font-semibold text-seal">Automated reply</p>
                    <p className="mt-1 leading-relaxed text-ink">{q.auto_reply}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
