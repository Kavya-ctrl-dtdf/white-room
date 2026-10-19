"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FloorPlan from "@/components/FloorPlan";
import { Field } from "@/components/ui";
import { AREAS, BASE_AMENITIES, HOSTS, OPTIONAL_AMENITIES, SEGMENTS } from "@/lib/data";
import { STAY_OPTIONS, formatINR, layoutLabel, stayLabel } from "@/lib/format";
import { ownerPayout, quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { Layout, Listing, Segment } from "@/lib/types";

const LAYOUTS: Layout[] = ["studio", "1bhk", "2bhk", "3bhk"];

export default function NewListingPage() {
  const { listings, addListing, toast } = useStore();
  const router = useRouter();

  const [hostId, setHostId] = useState("h1");
  const [title, setTitle] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [address, setAddress] = useState("");
  const [layout, setLayout] = useState<Layout>("1bhk");
  const [sqft, setSqft] = useState("600");
  const [floor, setFloor] = useState("1");
  const [lift, setLift] = useState(true);
  const [wifi, setWifi] = useState("");
  const [housekeeping, setHousekeeping] = useState("3");
  const [units, setUnits] = useState("150");
  const [rent, setRent] = useState("45000");
  const [minMonths, setMinMonths] = useState("1");
  const [segments, setSegments] = useState<Segment[]>(["work"]);
  const [extras, setExtras] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [tried, setTried] = useState(false);

  const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
  const floorN = num(floor);
  const rentN = num(rent);

  const errors: Record<string, string> = {};
  if (title.trim().length < 8) errors.title = "Give the home a title of at least 8 characters";
  if (address.trim().length < 5) errors.address = "Enter the street and locality";
  if (!(num(sqft) >= 200 && num(sqft) <= 5000)) errors.sqft = "Enter a size between 200 and 5,000 sq ft";
  if (!(Number.isInteger(floorN) && floorN >= 0 && floorN <= 60)) errors.floor = "Enter a floor from 0 to 60";
  if (wifi.trim() !== "" && !(num(wifi) > 0 && num(wifi) <= 1000)) errors.wifi = "Enter a speed in Mbps, or leave it blank";
  if (!(Number.isInteger(num(housekeeping)) && num(housekeeping) >= 0 && num(housekeeping) <= 7)) errors.housekeeping = "Enter 0 to 7 visits";
  if (!(num(units) >= 0 && num(units) <= 1000)) errors.units = "Enter 0 to 1,000 units";
  if (!(rentN >= 10000 && rentN <= 300000)) errors.rent = "Enter a monthly rent between ₹10,000 and ₹3,00,000";
  if (!STAY_OPTIONS.includes(num(minMonths))) errors.minMonths = "Choose 15 days or 1 to 6 months";
  if (segments.length === 0) errors.segments = "Pick at least one kind of guest";
  if (description.trim().length < 20) errors.description = "Describe the home in at least 20 characters";
  const show = (k: string) => (tried ? errors[k] : undefined);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length > 0) {
      document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const listing: Listing = {
      id: `wr-${800 + listings.filter((l) => /^wr-8\d\d$/.test(l.id)).length + 1}`,
      title: title.trim(),
      area,
      address: `${address.trim()}, ${area}`,
      layout,
      sqft: num(sqft),
      rent: rentN,
      electricityUnits: num(units),
      housekeeping: num(housekeeping),
      wifiMbps: wifi.trim() === "" ? 0 : num(wifi),
      floor: floorN,
      lift: floorN === 0 ? false : lift,
      segments,
      amenities: [...BASE_AMENITIES, ...extras],
      nearby: [],
      hostId,
      minMonths: num(minMonths),
      description: description.trim(),
      variant: (listings.length % 2) as 0 | 1,
      status: "pending",
      stays: 0,
    };
    addListing(listing);
    toast("Listing submitted. We will visit it and verify it");
    router.push(`/host?as=${hostId}`);
  }

  const previewRent = rentN >= 10000 ? rentN : 0;
  const payout = ownerPayout(previewRent, 2);

  return (
    <div className="mx-auto max-w-page px-5 py-10">
      <Link href="/host" className="text-sm font-semibold text-graphite hover:text-ink">Back to dashboard</Link>
      <h1 className="mt-4 text-3xl md:text-4xl">List a property</h1>
      <p className="mt-2 max-w-xl text-graphite">
        Tell us about the home. We visit it, run 30 checks, and publish it once it passes.
      </p>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Owner" htmlFor="owner">
              <select id="owner" className="field" value={hostId} onChange={(e) => setHostId(e.target.value)}>
                {HOSTS.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Area" htmlFor="area">
              <select id="area" className="field" value={area} onChange={(e) => setArea(e.target.value)}>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Title" htmlFor="title" error={show("title")} hint="For example: Bright 1 BHK five minutes from the metro">
                <input id="title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Street" htmlFor="street" error={show("address")}>
                <input id="street" className="field" value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
            </div>
          </div>

          <div>
            <p className="label">Layout</p>
            <div className="flex flex-wrap gap-2">
              {LAYOUTS.map((l) => (
                <button key={l} type="button" aria-pressed={layout === l} className={`chip ${layout === l ? "chip-on" : ""}`} onClick={() => setLayout(l)}>
                  {layoutLabel[l]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Size, sq ft" htmlFor="sqft" error={show("sqft")}>
              <input id="sqft" inputMode="numeric" className="field" value={sqft} onChange={(e) => setSqft(e.target.value)} />
            </Field>
            <Field label="Floor" htmlFor="floor" error={show("floor")}>
              <input
                id="floor"
                inputMode="numeric"
                className="field"
                value={floor}
                onChange={(e) => {
                  setFloor(e.target.value);
                  if (num(e.target.value) === 0) setLift(false);
                }}
              />
            </Field>
            <div className="flex items-end pb-2.5">
              <label className={`flex items-center gap-2 text-[15px] ${floorN === 0 ? "text-graphite" : ""}`}>
                <input type="checkbox" className="h-4 w-4 accent-[#0E7C66]" checked={floorN === 0 ? false : lift} disabled={floorN === 0} onChange={(e) => setLift(e.target.checked)} />
                Building has a lift
              </label>
            </div>
            <Field label="Wi-Fi, Mbps" htmlFor="wifi" error={show("wifi")} hint="We measure it on our visit">
              <input id="wifi" inputMode="numeric" className="field" placeholder="Optional" value={wifi} onChange={(e) => setWifi(e.target.value)} />
            </Field>
            <Field label="Housekeeping visits a week" htmlFor="hk" error={show("housekeeping")}>
              <input id="hk" inputMode="numeric" className="field" value={housekeeping} onChange={(e) => setHousekeeping(e.target.value)} />
            </Field>
            <Field label="Electricity units included a month" htmlFor="units" error={show("units")}>
              <input id="units" inputMode="numeric" className="field" value={units} onChange={(e) => setUnits(e.target.value)} />
            </Field>
            <Field label="Monthly rent, ₹" htmlFor="rent" error={show("rent")}>
              <input id="rent" inputMode="numeric" className="field" value={rent} onChange={(e) => setRent(e.target.value)} />
            </Field>
            <Field label="Minimum stay" htmlFor="min" error={show("minMonths")}>
              <select id="min" className="field" value={minMonths} onChange={(e) => setMinMonths(e.target.value)}>
                {STAY_OPTIONS.map((m) => (
                  <option key={m} value={m}>{stayLabel(m)}</option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset>
            <legend className="label">Good for</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {(Object.keys(SEGMENTS) as Segment[]).map((s) => (
                <label key={s} className="flex items-center gap-2 text-[15px]">
                  <input type="checkbox" className="h-4 w-4 accent-[#0E7C66]" checked={segments.includes(s)} onChange={() => setSegments(toggle(segments, s))} />
                  {SEGMENTS[s].label}
                </label>
              ))}
            </div>
            {show("segments") && <p className="mt-1 text-xs font-medium text-alert" role="alert">{errors.segments}</p>}
          </fieldset>

          <div>
            <p className="label">Extras, on top of air conditioning, washing machine, fridge, RO water, power backup and geyser</p>
            <div className="flex flex-wrap gap-2">
              {OPTIONAL_AMENITIES.map((a) => (
                <button key={a} type="button" aria-pressed={extras.includes(a)} className={`chip ${extras.includes(a) ? "chip-on" : ""}`} onClick={() => setExtras(toggle(extras, a))}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Field label="Description" htmlFor="desc" error={show("description")} hint="One or two plain sentences about what makes the home good for a long stay">
            <textarea id="desc" rows={4} className="field" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          <button type="submit" className="btn btn-primary">Submit for verification</button>
        </div>

        <aside>
          <div className="sticky top-24 space-y-5">
            <div className="drafting rounded-[28px] border border-line p-5">
              <FloorPlan layout={layout} variant={(listings.length % 2) as 0 | 1} className="w-full" />
            </div>
            <div className="panel p-5">
              <h2 className="text-lg">Two-month payout</h2>
              <dl className="mt-3 space-y-2 text-sm tnum">
                <div className="flex justify-between text-graphite"><dt>Rent for 2 months</dt><dd className="text-ink">{formatINR(payout.gross)}</dd></div>
                <div className="flex justify-between text-graphite"><dt>10% commission</dt><dd className="text-ink">−{formatINR(payout.commission)}</dd></div>
                <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>You receive</dt><dd className="font-display text-lg">{formatINR(payout.net)}</dd></div>
              </dl>
              {previewRent > 0 && (
                <p className="mt-4 text-sm text-graphite tnum">
                  Guests see {formatINR(quote(previewRent, 1).monthly)} a month, all in, or {formatINR(quote(previewRent, 3).monthly)} on a long stay.
                </p>
              )}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
