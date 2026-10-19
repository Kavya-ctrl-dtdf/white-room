"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import FloorPlan from "@/components/FloorPlan";
import { Icon } from "@/components/Icons";
import { EmptyState, ListingStatusPill, PriceBreakdown, Rating, SegmentTags, VerifiedPill } from "@/components/ui";
import { CHECK_COUNT, hostById } from "@/lib/data";
import { STAY_OPTIONS, addDays, addStay, formatDate, formatINR, layoutLabel, stayLabel, todayISO } from "@/lib/format";
import { quote } from "@/lib/pricing";
import { parseMonths, parseSegment } from "@/lib/search";
import { useStore } from "@/lib/store";

const SAMPLE_CHECKS = [
  "Main door lock works",
  "Fire extinguisher present",
  "Beds and mattresses clean",
  "Geyser working",
  "Fridge working",
  "RO or safe drinking water",
  "Wi-Fi speed measured",
  "Ownership or lease proof seen",
];

export default function ListingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-page px-5 py-16 text-graphite">Loading home</div>}>
      <ListingDetail />
    </Suspense>
  );
}

function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { listings, toast } = useStore();
  const router = useRouter();
  const sp = useSearchParams();
  const listing = listings.find((l) => l.id === id);

  const segment = parseSegment(sp.get("for"));
  const [months, setMonths] = useState(parseMonths(sp.get("months")));
  const [move, setMove] = useState(sp.get("move") || "");
  const [who, setWho] = useState<"me" | "else">(segment === "parents" || segment === "treatment" ? "else" : "me");

  useEffect(() => {
    if (!sp.get("move")) setMove(addDays(todayISO(), 7));
  }, [sp]);

  useEffect(() => {
    if (listing && months < listing.minMonths) setMonths(listing.minMonths);
  }, [listing, months]);

  if (!listing) {
    return (
      <div className="mx-auto max-w-page px-5 py-16">
        <EmptyState title="We could not find that home" text="It may have been removed, or the demo data was reset.">
          <Link href="/stays" className="btn btn-primary">Find a stay</Link>
        </EmptyState>
      </div>
    );
  }

  const host = hostById(listing.hostId);
  const q = quote(listing.rent, months);
  const verified = listing.status === "verified";
  const moveOut = move ? addStay(move, months) : "";
  const back = `/stays?${new URLSearchParams({ ...(segment ? { for: segment } : {}), months: String(months) }).toString()}`;

  function request() {
    const p = new URLSearchParams({ months: String(months), who });
    if (move) p.set("move", move);
    router.push(`/book/${listing!.id}?${p.toString()}`);
  }

  const facts = [
    { icon: Icon.Wifi, label: "Wi-Fi", value: listing.wifiMbps ? `${listing.wifiMbps} Mbps${verified ? " measured" : " claimed"}` : "To be measured" },
    { icon: Icon.Lift, label: "Access", value: `${listing.floor === 0 ? "Ground floor" : `Floor ${listing.floor}`}, ${listing.lift ? "lift" : "no lift"}` },
    { icon: Icon.Broom, label: "Housekeeping", value: `${listing.housekeeping} visits a week` },
    { icon: Icon.Bolt, label: "Electricity", value: `${listing.electricityUnits} units a month included` },
    { icon: Icon.Area, label: "Size", value: `${layoutLabel[listing.layout]}, ${listing.sqft} sq ft` },
    { icon: Icon.Calendar, label: "Minimum stay", value: stayLabel(listing.minMonths) },
  ];

  return (
    <div className="mx-auto max-w-page px-5 py-8">
      <Link href={back} className="text-sm font-semibold text-graphite hover:text-ink">
        Back to results
      </Link>

      {!verified && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-ambersoft p-4 text-amber" role="status">
          <Icon.Alert size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">
            We have not visited this home yet, so it cannot be booked. It will open for booking once it passes all 30 checks.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {verified && listing.verifiedOn ? <VerifiedPill date={listing.verifiedOn} /> : <ListingStatusPill status={listing.status} />}
            <SegmentTags segments={listing.segments} />
          </div>
          <h1 className="mt-4 text-3xl leading-[1.08] md:text-5xl">{listing.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-graphite">
            <span className="inline-flex items-center gap-1.5"><Icon.Pin size={16} /> {listing.address}</span>
            <Rating rating={listing.rating} stays={listing.stays} />
          </p>

          <div className="drafting mt-8 rounded-[28px] border border-line p-6 md:p-10">
            <FloorPlan layout={listing.layout} variant={listing.variant} className="mx-auto w-full max-w-xl" title={`Floor plan of ${listing.title}`} />
          </div>
          <p className="mt-2 text-sm text-graphite">Plan drawn from our visit; not to scale.</p>

          <button
            type="button"
            onClick={() => toast("The walkthrough video is not part of this demo")}
            className="mt-6 flex w-full items-center gap-4 rounded-2xl bg-ink p-5 text-left text-white transition-colors hover:bg-[#2b3846]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink">
              <Icon.Play size={22} />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">Walkthrough video</span>
              <span className="text-sm text-white/70">Filmed during our visit, no editing</span>
            </span>
          </button>

          <p className="mt-8 max-w-2xl text-[17px] leading-relaxed">{listing.description}</p>

          <h2 className="mt-10 text-2xl">The home</h2>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-3 bg-white p-4">
                <f.icon size={20} className="mt-0.5 text-graphite" />
                <div>
                  <dt className="text-sm text-graphite">{f.label}</dt>
                  <dd className="font-medium tnum">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {listing.amenities.map((a) => (
              <span key={a} className="rounded-full bg-wall px-3 py-1.5 text-sm">{a}</span>
            ))}
          </div>

          <h2 className="mt-10 text-2xl">What we checked</h2>
          <div className="panel mt-4 p-5">
            {verified && listing.verifiedOn ? (
              <>
                <p className="font-semibold text-seal">
                  {CHECK_COUNT} of {CHECK_COUNT} passed on {formatDate(listing.verifiedOn)}
                </p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {SAMPLE_CHECKS.map((c) => (
                    <li key={c} className="flex items-center gap-2.5 text-[15px]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-seal text-white">
                        <Icon.Check size={13} />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-graphite">Plus {CHECK_COUNT - SAMPLE_CHECKS.length} more checks on safety, rooms, kitchen, connectivity and terms.</p>
              </>
            ) : (
              <p className="text-graphite">Not checked yet. Our visit covers {CHECK_COUNT} items across safety, rooms, kitchen, connectivity and terms.</p>
            )}
          </div>

          <h2 className="mt-10 text-2xl">Nearby</h2>
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
            {listing.nearby.map((n) => {
              const I = n.kind === "hospital" ? Icon.Hospital : n.kind === "metro" ? Icon.Train : Icon.Briefcase;
              return (
                <li key={n.name} className="flex items-center gap-3 p-4">
                  <I size={20} className="text-graphite" />
                  <span className="flex-1">{n.name}</span>
                  <span className="font-semibold tnum">{n.km} km</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex items-center gap-4 rounded-2xl bg-wall p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-lg font-semibold text-white">
              {host.name.charAt(0)}
            </span>
            <div>
              <p className="font-semibold">Managed by {host.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-graphite">
                <Icon.Clock size={15} /> Usually replies within {host.replyHours} hours. Hosting since {host.since}.
              </p>
            </div>
          </div>
        </div>

        <aside>
          <div className="panel sticky top-24 p-5 shadow-sm">
            <p className="font-display text-4xl font-semibold tracking-tight tnum">{formatINR(q.perMonth)}</p>
            <p className="text-sm text-graphite">a month, all in</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="b-move" className="label">Move in</label>
                <input id="b-move" type="date" className="field" min={todayISO()} value={move} onChange={(e) => setMove(e.target.value)} />
              </div>
              <div>
                <label htmlFor="b-months" className="label">How long</label>
                <select id="b-months" className="field" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                  {STAY_OPTIONS.filter((m) => m >= listing.minMonths).map((m) => (
                    <option key={m} value={m}>
                      {stayLabel(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {moveOut && <p className="mt-2 text-sm text-graphite">Move out on {formatDate(moveOut)}</p>}

            <div className="mt-5">
              <p className="label">Who is staying</p>
              <div className="grid grid-cols-2 gap-2">
                {([["me", "Me", Icon.User], ["else", "Someone else", Icon.Users]] as const).map(([k, label, I]) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={who === k}
                    onClick={() => setWho(k)}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium ${
                      who === k ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                    }`}
                  >
                    <I size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <PriceBreakdown rent={listing.rent} months={months} />
            </div>

            <button type="button" className="btn btn-primary mt-5 w-full" disabled={!verified || !move} onClick={request}>
              Request to book
            </button>
            <p className="mt-2 text-center text-sm text-graphite">
              {q.short ? "You pay once for the 15 days." : "You pay the first month now; the rest monthly."}
            </p>

            <div className="mt-5 flex gap-3 rounded-xl bg-sealsoft p-4 text-sm text-ink">
              <Icon.Shield size={20} className="mt-0.5 shrink-0 text-seal" />
              <p>
                <span className="font-semibold">Move-in protection.</span> If the home does not match this page, report it
                within 24 hours. We refund {q.short ? "your payment" : "your first month"} or move you to another verified home.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
