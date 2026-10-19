"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FloorPlan from "@/components/FloorPlan";
import { Icon } from "@/components/Icons";
import { ListingCard } from "@/components/ui";
import { AREAS, SEGMENTS } from "@/lib/data";
import { STAY_OPTIONS, addDays, formatINR, stayOptionLabel, todayISO } from "@/lib/format";
import { quote } from "@/lib/pricing";
import { filterListings } from "@/lib/search";
import { useStore } from "@/lib/store";
import type { Segment } from "@/lib/types";

const WHO = [
  { key: "me", label: "Me, for work", params: { for: "work" } },
  { key: "parents", label: "My parents", params: { for: "parents" } },
  { key: "treatment", label: "Someone in treatment", params: { for: "treatment" } },
  { key: "family", label: "My family", params: { for: "parents", size: "2bhk,3bhk" } },
] as const;

const SEGMENT_ICON: Record<Segment, typeof Icon.Users> = {
  parents: Icon.Users,
  work: Icon.Briefcase,
  treatment: Icon.Hospital,
};

export default function HomePage() {
  const { listings } = useStore();
  const router = useRouter();
  const [area, setArea] = useState("");
  const [who, setWho] = useState<(typeof WHO)[number]["key"]>("me");
  const [move, setMove] = useState("");
  const [months, setMonths] = useState(1);

  useEffect(() => setMove(addDays(todayISO(), 7)), []);

  const verified = useMemo(() => listings.filter((l) => l.status === "verified"), [listings]);
  const whoParams = WHO.find((w) => w.key === who)!.params as { for: Segment; size?: string };

  const matchCount = useMemo(
    () =>
      filterListings(listings, {
        area,
        segment: whoParams.for,
        sizes: whoParams.size ? (whoParams.size.split(",") as never) : [],
        months,
      }).length,
    [listings, area, whoParams, months],
  );

  const recent = useMemo(
    () => [...verified].sort((a, b) => (b.verifiedOn ?? "").localeCompare(a.verifiedOn ?? "")).slice(0, 4),
    [verified],
  );

  const itpl = listings.find((l) => l.id === "wr-201");
  const itplTotal = itpl ? quote(itpl.rent, 2).total : 0;
  const hotelTotal = 61 * 7600;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (area) p.set("area", area);
    p.set("for", whoParams.for);
    if (whoParams.size) p.set("size", whoParams.size);
    if (move) p.set("move", move);
    p.set("months", String(months));
    router.push(`/stays?${p.toString()}`);
  }

  return (
    <>
      <section className="mx-auto grid max-w-page items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div>
          <h1 className="text-[2.6rem] leading-[1.02] md:text-[4.1rem]">A furnished home for the months you need one.</h1>
          <p className="mt-5 max-w-xl text-[17px] text-graphite">
            Serviced apartments in Bengaluru for 15 days to six months. We visit every home before it is listed, price it by
            the month with nothing added later, and refund you if it does not match on move-in day.
          </p>

          <form onSubmit={submit} className="panel mt-8 p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="h-area" className="label">Area</label>
                <select id="h-area" className="field" value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="">Anywhere in Bengaluru</option>
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="h-who" className="label">Who is staying</label>
                <select id="h-who" className="field" value={who} onChange={(e) => setWho(e.target.value as typeof who)}>
                  {WHO.map((w) => (
                    <option key={w.key} value={w.key}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="h-move" className="label">Move in date</label>
                <input id="h-move" type="date" className="field" value={move} onChange={(e) => setMove(e.target.value)} />
              </div>
              <div>
                <label htmlFor="h-months" className="label">How long</label>
                <select id="h-months" className="field" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                  {STAY_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {stayOptionLabel(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-5 w-full sm:w-auto">
              Search {matchCount} verified {matchCount === 1 ? "home" : "homes"}
            </button>
          </form>
        </div>

        <div className="relative">
          <div className="drafting rounded-[28px] border border-line p-6 md:p-8">
            <FloorPlan layout="2bhk" animate title="Floor plan of a 2 BHK in Whitefield" className="w-full" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sealsoft px-3 py-1.5 text-sm font-semibold text-seal">
              <Icon.Shield size={16} /> 30 of 30 checks passed
            </span>
            <span className="text-sm text-graphite">2 BHK, Whitefield, visited 8 Oct 2026</span>
          </div>

          <Callout className="left-[-1.5rem] top-6" text="Bedrooms" detail="mattress, AC and wardrobe checked" />
          <Callout className="right-[-1.5rem] top-14" text="Kitchen" detail="stove, fridge and RO water working" />
          <Callout className="bottom-24 left-[-2rem]" text="Wi-Fi measured at 94 Mbps" />
        </div>
      </section>

      <section className="mx-auto max-w-page px-5 py-16">
        <h2 className="text-3xl md:text-4xl">How a stay works</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            ["Step 1", "Choose by the month", "One price includes rent, GST and every fee. Stay three months or more and the rent drops 8%."],
            ["Step 2", "See what we checked", "Every home passes 30 checks in person. The date of our visit is on the page, next to the floor plan."],
            ["Step 3", "Move in protected", "If the home does not match, report it within 24 hours. You get your first month back, or another home."],
          ].map(([step, title, text]) => (
            <div key={step} className="border-t-2 border-ink pt-4">
              <p className="text-sm font-medium text-graphite">{step}</p>
              <h3 className="mt-1 text-xl">{title}</h3>
              <p className="mt-2 text-graphite">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-page px-5 py-12">
        <h2 className="text-3xl md:text-4xl">Built around why you are here</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {(Object.keys(SEGMENTS) as Segment[]).map((s) => {
            const Ico = SEGMENT_ICON[s];
            const n = verified.filter((l) => l.segments.includes(s)).length;
            return (
              <Link
                key={s}
                href={`/stays?for=${s}`}
                className="group flex flex-col gap-3 py-6 transition-colors hover:bg-wall md:flex-row md:items-center md:gap-8 md:px-4"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wall text-ink group-hover:bg-white">
                  <Ico size={24} />
                </span>
                <span className="md:w-72">
                  <span className="block font-display text-xl font-semibold tracking-tight">{SEGMENTS[s].label}</span>
                </span>
                <span className="flex-1 text-graphite">{SEGMENTS[s].blurb}</span>
                <span className="text-sm font-semibold text-seal tnum">{n} verified homes</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="my-16 bg-ink text-white">
        <div className="mx-auto max-w-page px-5 py-14">
          <h2 className="text-3xl text-white md:text-4xl">Two months near ITPL, priced honestly</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/15 p-6">
              <p className="text-sm text-white/70">Business hotel, 61 nights at ₹7,600</p>
              <p className="mt-3 font-display text-4xl font-semibold tnum text-white/60 line-through">{formatINR(hotelTotal)}</p>
              <p className="mt-3 text-sm text-white/60">HVS Anarock, Q3 2025 average</p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-ink">
              <p className="text-sm text-graphite">{itpl ? itpl.title : "1 BHK near ITPL"}, 2 months, all in</p>
              <p className="mt-3 font-display text-4xl font-semibold tnum">{formatINR(itplTotal)}</p>
              <p className="mt-3 text-sm font-semibold text-seal tnum">You keep {formatINR(hotelTotal - itplTotal)}</p>
              <Link href="/stays/wr-201?months=2" className="btn btn-primary btn-sm mt-4">See this home</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-page px-5 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl md:text-4xl">Recently verified</h2>
          <Link href="/stays?sort=recent" className="text-sm font-semibold text-seal hover:underline">See all homes</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-page px-5">
        <div className="drafting rounded-[28px] border border-line px-6 py-12 md:px-12">
          <h2 className="max-w-xl text-3xl md:text-4xl">Own a serviced apartment?</h2>
          <p className="mt-3 max-w-xl text-graphite">
            Fill it with guests who stay 15 days to six months. We charge a 10% commission on rent, nothing else. Long stays
            mean fewer empty weeks, fewer turnovers and one payout a month.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/host/new" className="btn btn-primary">List a property</Link>
            <Link href="/host" className="btn btn-quiet">Owner dashboard</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Callout({ className, text, detail }: { className: string; text: string; detail?: string }) {
  return (
    <div
      className={`callout absolute hidden max-w-[210px] items-start gap-2 rounded-xl border border-line bg-white p-3 text-sm shadow-md lg:flex ${className}`}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-seal text-white">
        <Icon.Check size={13} />
      </span>
      <span>
        <span className="font-semibold">{text}</span>
        {detail && <span className="text-graphite">: {detail}</span>}
      </span>
    </div>
  );
}
