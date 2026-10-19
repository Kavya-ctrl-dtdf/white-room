"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { EmptyState, ListingStatusPill, PageHeader, StatusPill } from "@/components/ui";
import { CHECKLIST, CHECK_COUNT, hostById } from "@/lib/data";
import { addStay, formatDate, formatINR, layoutLabel, nowISO, todayISO } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";

type Tab = "queue" | "problems" | "all";

export default function AdminPage() {
  const { listings, bookings } = useStore();
  const [tab, setTab] = useState<Tab>("queue");

  const queue = listings.filter((l) => l.status === "pending");
  const sentBack = listings.filter((l) => l.status === "changes");
  const problems = bookings.filter((b) => b.status === "issue");

  const tabs: { key: Tab; label: string; n: number }[] = [
    { key: "queue", label: "Verification queue", n: queue.length },
    { key: "problems", label: "Move-in problems", n: problems.length },
    { key: "all", label: "All bookings", n: bookings.length },
  ];

  return (
    <div className="mx-auto max-w-page px-5 py-10">
      <PageHeader title="Verification desk" />

      <div className="flex flex-wrap gap-2 border-b border-line pb-4" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`chip ${tab === t.key ? "chip-on" : ""}`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-xs tnum ${tab === t.key ? "bg-white/20" : "bg-wall"}`}>{t.n}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "queue" && (
          <div className="space-y-5">
            {queue.length === 0 ? (
              <EmptyState title="Nothing waiting" text="Every listed home has been visited. New submissions from owners appear here." />
            ) : (
              queue.map((l) => <QueueCard key={l.id} listing={l} />)
            )}
            {sentBack.length > 0 && (
              <div className="pt-4">
                <h2 className="text-lg">Sent back to owner</h2>
                <ul className="mt-3 space-y-2">
                  {sentBack.map((l) => (
                    <li key={l.id} className="panel flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                      <span>{l.title}, {hostById(l.hostId).name}</span>
                      <ListingStatusPill status={l.status} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "problems" && <Problems />}
        {tab === "all" && <AllBookings />}
      </div>
    </div>
  );
}

function QueueCard({ listing: l }: { listing: Listing }) {
  const { updateListing, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [wifi, setWifi] = useState(l.wifiMbps ? String(l.wifiMbps) : "");
  const host = hostById(l.hostId);
  const count = ticked.size;
  const wifiN = Number(wifi);
  const wifiOk = wifi.trim() !== "" && wifiN > 0;

  const toggle = (key: string) =>
    setTicked((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const markAll = () => setTicked(new Set(CHECKLIST.flatMap((g) => g.items.map((i) => `${g.group}:${i}`))));

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <ListingStatusPill status={l.status} />
          <h2 className="mt-2 text-xl leading-snug">{l.title}</h2>
          <p className="text-sm text-graphite tnum">
            {layoutLabel[l.layout]}, {l.sqft} sq ft, {l.area}. Rent {formatINR(l.rent)} a month. Owner: {host.name}.
          </p>
        </div>
        {!open && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            Start verification
          </button>
        )}
      </div>

      {open && (
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold tnum">{count} of {CHECK_COUNT} checks passed</p>
            <button type="button" onClick={markAll} className="text-sm font-semibold text-seal hover:underline">
              Mark all as passed (demo)
            </button>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-wall" role="progressbar" aria-valuemin={0} aria-valuemax={CHECK_COUNT} aria-valuenow={count} aria-label="Checks passed">
            <div className="h-full bg-seal transition-all" style={{ width: `${(count / CHECK_COUNT) * 100}%` }} />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CHECKLIST.map((g) => (
              <fieldset key={g.group}>
                <legend className="mb-2 font-display text-base font-semibold">{g.group}</legend>
                <ul className="space-y-2">
                  {g.items.map((item) => {
                    const key = `${g.group}:${item}`;
                    return (
                      <li key={key}>
                        <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
                          <input type="checkbox" className="mt-1 h-4 w-4 accent-[#0E7C66]" checked={ticked.has(key)} onChange={() => toggle(key)} />
                          {item}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
          </div>

          <div className="mt-6 max-w-xs">
            <label htmlFor={`wifi-${l.id}`} className="label">Measured Wi-Fi, Mbps</label>
            <input id={`wifi-${l.id}`} inputMode="numeric" className="field" value={wifi} onChange={(e) => setWifi(e.target.value)} placeholder="For example 94" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-seal"
              disabled={count < CHECK_COUNT || !wifiOk}
              onClick={() => {
                updateListing(l.id, { status: "verified", verifiedOn: todayISO(), wifiMbps: wifiN });
                toast(`${l.title} is now verified and listed`);
              }}
            >
              Approve and publish
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                updateListing(l.id, { status: "changes" });
                toast("Sent back to the owner with a list of changes");
              }}
            >
              Send back to owner
            </button>
            {count === CHECK_COUNT && !wifiOk && <p className="text-sm text-alert">Enter the measured Wi-Fi speed to publish.</p>}
          </div>
        </div>
      )}
    </article>
  );
}

function Problems() {
  const { bookings, listings, updateBooking, toast } = useStore();
  const problems = bookings.filter((b) => b.status === "issue");

  if (problems.length === 0) {
    return <EmptyState title="No open problems" text="When a guest reports a mismatch on move-in day, it shows up here with who to call." />;
  }

  return (
    <div className="space-y-5">
      {problems.map((b) => {
        const l = listings.find((x) => x.id === b.listingId);
        const resolve = (resolution: string) => {
          updateBooking(b.id, { status: "resolved", issue: { note: b.issue?.note ?? "", at: b.issue?.at ?? nowISO(), resolution } });
          toast(`${b.id} resolved`);
        };
        return (
          <article key={b.id} className="panel p-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={b.status} />
              <span className="text-sm text-graphite tnum">{b.id}</span>
            </div>
            <h2 className="mt-2 text-xl leading-snug">{l?.title}</h2>
            <p className="mt-2 rounded-xl bg-alertsoft p-4 text-sm text-alert">
              <Icon.Alert size={16} className="mr-1.5 inline align-[-3px]" />
              “{b.issue?.note}”
            </p>
            <p className="mt-3 text-sm tnum">
              <span className="font-semibold">Call {b.guestName}</span> on {b.guestPhone}.
              {b.forSomeoneElse && <> Booked by {b.bookerName}, {b.bookerPhone}.</>}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => resolve(`First month refunded in full (${formatINR(b.paidNow)}).`)}>
                Refund first month
              </button>
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => resolve("Moved to another verified home at the same price.")}>
                Move to another home
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AllBookings() {
  const { bookings, listings } = useStore();
  if (bookings.length === 0) {
    return <EmptyState title="No bookings yet" text="Requests from guests appear here as soon as they pay." />;
  }
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line text-graphite">
          <tr>
            {["Booking", "Home", "Guest", "Dates", "Paid now", "Total", "Status"].map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line tnum">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-3">{b.id}</td>
              <td className="px-4 py-3">{listings.find((l) => l.id === b.listingId)?.title}</td>
              <td className="px-4 py-3">{b.guestName}</td>
              <td className="px-4 py-3">{formatDate(b.moveIn)} to {formatDate(addStay(b.moveIn, b.months))}</td>
              <td className="px-4 py-3">{formatINR(b.paidNow)}</td>
              <td className="px-4 py-3">{formatINR(b.total)}</td>
              <td className="px-4 py-3"><StatusPill status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
