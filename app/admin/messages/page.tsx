import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Messages: White Room" };
export const dynamic = "force-dynamic";

export default async function Messages() {
  let messages: {
    id: string;
    ref: string | null;
    name: string;
    email: string;
    phone: string | null;
    topic: string;
    listing_id: string | null;
    message: string;
    status: string;
    created_at: string;
  }[] = [];

  if (supabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("id, ref, name, email, phone, topic, listing_id, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    messages = data ?? [];
  }

  return (
    <div className="mx-auto max-w-page px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl md:text-4xl">Messages</h1>
        <Link href="/admin" className="btn btn-quiet btn-sm">
          Back to the verification desk
        </Link>
      </div>

      {messages.length === 0 && (
        <div className="drafting rounded-2xl border border-line px-6 py-14 text-center">
          <p className="text-graphite">No messages yet. New ones from the Contact us page appear here.</p>
        </div>
      )}

      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id} className="panel p-5">
            {m.ref && <p className="mb-1 text-sm font-semibold tnum">{m.ref}</p>}
            <p className="font-semibold">
              {m.name},{" "}
              <a href={`mailto:${m.email}`} className="text-seal hover:underline">
                {m.email}
              </a>
              {m.phone && <span className="font-normal text-graphite">, {m.phone}</span>}
            </p>
            <p className="mt-1 text-sm text-graphite tnum">
              {m.topic}
              {m.listing_id && `, about ${m.listing_id}`}, {new Date(m.created_at).toLocaleString("en-IN")}
            </p>
            <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
