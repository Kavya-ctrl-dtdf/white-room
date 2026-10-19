"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { EmptyState, ListingStatusPill, PageHeader, PlanThumb, StatusPill } from "@/components/ui";
import { HOSTS } from "@/lib/data";
import { addStay, formatDate, formatINR, layoutLabel, stayLabel } from "@/lib/format";
import { ownerPayout } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export default function HostPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-page px-5 py-16 text-graphite">Loading dashboard</div>}>
      <Host />
    </Suspense>
  );
}

function Host() {
  const { listings, bookings, updateBooking, toast, ready } = useStore();
  const sp = useSearchParams();
  const asParam = sp.get("as");
  const [hostId, setHostId] = useState<string>(HOSTS.some((h) => h.id === asParam) ? (asParam as string) : "h1");
  const [locked, setLocked] = useState(!!asParam);

  // Once saved data has loaded, open as the owner of the newest waiting request.
  useEffect(() => {
    if (!ready || locked) return;
    const newest = bookings.find((b) => b.status === "requested");
    const owner = newest ? listings.find((l) => l.id === newest.listingId)?.hostId : undefined;
    if (owner) setHostId(owner);
    setLocked(true);
  }, [ready, locked, bookings, listings]);

  const host = HOSTS.find((h) => h.id === hostId) ?? HOSTS[0];
  const myListings = listings.filter((l) => l.hostId === host.id);
  const mine = bookings.flatMap((b) => {
    const l = myListings.find((x) => x.id === b.listingId);
    return l ? [{ b, l }] : [];
  });

  const waiting = mine.filter((x) => x.b.status === "requested");
  const active = mine.filter((x) => ["confirmed", "moved_in", "issue", "resolved"].includes(x.b.status));
  const payout = active.reduce((sum, x) => sum + ownerPayout(x.l.rent, x.b.months).net, 0);

  const stats = [
    { label: "Requests waiting", value: String(waiting.length) },
    { label: "Active stays", value: String(active.length) },
    { label: "Payout for active stays", value: formatINR(payout) },
    { label: "Homes listed", value: String(myListings.length) },
  ];

  return (
    <div className="mx-auto max-w-page px-5 py-10">
      <PageHeader title="Owner dashboard">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="viewing" className="label">Viewing as (demo)</label>
            <select
              id="viewing"
              className="field w-auto"
              value={host.id}
              onChange={(e) => {
                setHostId(e.target.value);
                setLocked(true);
              }}
            >
              {HOSTS.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <Link href="/host/new" className="btn btn-primary">List a property</Link>
        </div>
      </PageHeader>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-5">
            <dt className="text-sm text-graphite">{s.label}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold tracking-tight tnum">{s.value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 text-2xl">Booking requests</h2>
      <div className="mt-4 space-y-4">
        {waiting.length === 0 ? (
          <p className="panel p-6 text-graphite">No requests waiting. New requests from guests show up here.</p>
        ) : (
          waiting.map(({ b, l }) => {
            const p = ownerPayout(l.rent, b.months);
            return (
              <div key={b.id} className="panel flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="flex-1">
                  <p className="text-sm text-graphite tnum">{b.id}</p>
                  <p className="font-display text-lg font-semibold">{l.title}</p>
                  <p className="text-sm text-graphite tnum">
                    {b.guestName}
                    {b.forSomeoneElse && b.relation ? ` (${b.relation})` : ""}, {formatDate(b.moveIn)} to {formatDate(addStay(b.moveIn, b.months))}, {stayLabel(b.months)}
                  </p>
                  <p className="mt-1 text-sm tnum">
                    You receive <span className="font-semibold">{formatINR(p.net)}</span> after the {formatINR(p.commission)} commission
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-seal btn-sm"
                    onClick={() => {
                      updateBooking(b.id, { status: "confirmed" });
                      toast(`Accepted ${b.id}. The guest has been told`);
                    }}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => {
                      updateBooking(b.id, { status: "declined" });
                      toast(`Declined ${b.id}. The guest is refunded`);
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <h2 className="mt-12 text-2xl">Stays</h2>
      {active.length === 0 ? (
        <p className="panel mt-4 p-6 text-graphite">No active stays yet.</p>
      ) : (
        <div className="panel mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-graphite">
              <tr>
                {["Booking", "Home", "Guest", "Dates", "Status", "You receive"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line tnum">
              {active.map(({ b, l }) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">{b.id}</td>
                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3">{b.guestName}</td>
                  <td className="px-4 py-3">{formatDate(b.moveIn)} to {formatDate(addStay(b.moveIn, b.months))}</td>
                  <td className="px-4 py-3"><StatusPill status={b.status} /></td>
                  <td className="px-4 py-3 font-semibold">{formatINR(ownerPayout(l.rent, b.months).net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-2xl">Your homes</h2>
      {myListings.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No homes listed" text="List a property and we will visit it within a few days.">
            <Link href="/host/new" className="btn btn-primary">List a property</Link>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((l) => (
            <Link key={l.id} href={`/stays/${l.id}`} className="panel block overflow-hidden transition-colors hover:border-ink">
              <PlanThumb listing={l} className="aspect-[4/3] rounded-none" />
              <div className="p-4">
                <ListingStatusPill status={l.status} />
                <h3 className="mt-2 text-lg leading-snug">{l.title}</h3>
                <p className="text-sm text-graphite tnum">{layoutLabel[l.layout]}, {l.area}, {formatINR(l.rent)} rent a month</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
