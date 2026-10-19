"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Icon } from "@/components/Icons";
import { EmptyState, PageHeader, PlanThumb, StatusPill } from "@/components/ui";
import { addStay, formatDate, formatINR, layoutLabel, stayLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Booking, Listing } from "@/lib/types";

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-page px-5 py-16 text-graphite">Loading your stays</div>}>
      <Trips />
    </Suspense>
  );
}

function Trips() {
  const { bookings, listings } = useStore();
  const sp = useSearchParams();
  const newId = sp.get("new");
  const fresh = bookings.find((b) => b.id === newId);

  return (
    <div className="mx-auto max-w-page px-5 py-10">
      <PageHeader title="My stays" />

      {fresh && (
        <div className="mb-6 flex gap-3 rounded-2xl bg-sealsoft p-5" role="status">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-seal text-white">
            <Icon.Check size={15} />
          </span>
          <div>
            <p className="font-semibold">Request sent. You paid {formatINR(fresh.paidNow)}.</p>
            <p className="text-sm text-graphite">
              Booking {fresh.id} is with the owner now. If they do not accept in 24 hours, you are refunded automatically.
            </p>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <EmptyState title="No stays yet" text="When you request a home, it shows up here with its status and next steps.">
          <Link href="/stays" className="btn btn-primary">Find a stay</Link>
        </EmptyState>
      ) : (
        <div className="space-y-5">
          {bookings.map((b) => {
            const l = listings.find((x) => x.id === b.listingId);
            return l ? <BookingCard key={b.id} booking={b} listing={l} /> : null;
          })}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, listing: l }: { booking: Booking; listing: Listing }) {
  const { updateBooking, toast } = useStore();
  const [reporting, setReporting] = useState(false);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const tooShort = note.trim().length < 10;

  function submitIssue(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (tooShort) return;
    updateBooking(b.id, { status: "issue", issue: { note: note.trim(), at: new Date().toISOString() } });
    setReporting(false);
    toast("Problem reported. We will call you within 2 hours");
  }

  return (
    <article className="panel grid gap-5 p-5 md:grid-cols-[220px_1fr]">
      <PlanThumb listing={l} className="h-44 md:h-full md:min-h-[170px]" />
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={b.status} />
          <span className="text-sm text-graphite tnum">{b.id}</span>
        </div>
        <h2 className="mt-2 text-xl leading-snug">
          <Link href={`/stays/${l.id}`} className="hover:underline">{l.title}</Link>
        </h2>
        <p className="text-sm text-graphite">{layoutLabel[l.layout]}, {l.area}</p>
        <p className="mt-2 text-sm tnum">
          {formatDate(b.moveIn)} to {formatDate(addStay(b.moveIn, b.months))}, {stayLabel(b.months)}
        </p>
        <p className="text-sm text-graphite">
          For {b.guestName}
          {b.forSomeoneElse && b.relation ? ` (${b.relation})` : ""}
        </p>
        <p className="mt-1 text-sm text-graphite tnum">
          Paid {formatDate(b.createdAt)}: <span className="font-semibold text-ink">{formatINR(b.paidNow)}</span> of {formatINR(b.total)}
        </p>

        {b.status === "requested" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ambersoft p-4 text-sm text-amber">
            <p className="font-medium">Waiting for the owner to accept. You are refunded automatically if they do not.</p>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => {
                updateBooking(b.id, { status: "cancelled" });
                toast("Request cancelled. Your payment is being refunded");
              }}
            >
              Cancel request
            </button>
          </div>
        )}

        {b.status === "confirmed" && (
          <div className="mt-4 rounded-xl bg-sealsoft p-4">
            <p className="text-sm font-medium">
              On move-in day: confirm the home matches, or report a problem within 24 hours.
            </p>
            {!reporting ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-seal btn-sm"
                  onClick={() => {
                    updateBooking(b.id, { status: "moved_in" });
                    toast("Welcome home. Enjoy your stay");
                  }}
                >
                  Everything matches
                </button>
                <button type="button" className="btn btn-quiet btn-sm" onClick={() => setReporting(true)}>
                  Report a problem
                </button>
              </div>
            ) : (
              <form onSubmit={submitIssue} className="mt-3" noValidate>
                <label htmlFor={`note-${b.id}`} className="label">What is different from the listing?</label>
                <textarea
                  id={`note-${b.id}`}
                  rows={3}
                  className="field"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="For example: the geyser in the bathroom does not work"
                />
                {tried && tooShort && (
                  <p className="mt-1 text-xs font-medium text-alert" role="alert">Write at least 10 characters so we can help.</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">Send report</button>
                  <button type="button" className="btn btn-quiet btn-sm" onClick={() => setReporting(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {b.status === "moved_in" && (
          <p className="mt-4 rounded-xl bg-sealsoft p-4 text-sm font-medium">You confirmed the home matches. Enjoy your stay.</p>
        )}

        {b.status === "issue" && b.issue && (
          <div className="mt-4 rounded-xl bg-alertsoft p-4 text-sm">
            <p className="text-alert">
              <Icon.Alert size={16} className="mr-1.5 inline align-[-3px]" />
              <span className="font-semibold">You reported:</span> “{b.issue.note}”
            </p>
            <p className="mt-2 text-ink">We will call you within 2 hours to refund your first month or move you to another home.</p>
          </div>
        )}

        {b.status === "resolved" && b.issue && (
          <div className="mt-4 rounded-xl bg-sealsoft p-4 text-sm">
            <p className="text-graphite">You reported: “{b.issue.note}”</p>
            <p className="mt-2 font-semibold">{b.issue.resolution}</p>
          </div>
        )}

        {(b.status === "declined" || b.status === "cancelled") && (
          <p className="mt-4 rounded-xl bg-wall p-4 text-sm tnum">
            {b.status === "declined" ? "The owner could not host this stay. " : "You cancelled this request. "}
            {formatINR(b.paidNow)} goes back to your {b.method === "upi" ? "UPI account" : "card"} automatically.
          </p>
        )}
      </div>
    </article>
  );
}
