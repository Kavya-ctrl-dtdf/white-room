"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Icon } from "@/components/Icons";
import { EmptyState, Field, PlanThumb, PriceBreakdown } from "@/components/ui";
import { addDays, addStay, dayOfMonth, formatDate, formatINR, layoutLabel, ordinal, stayLabel, todayISO } from "@/lib/format";
import { quote } from "@/lib/pricing";
import { parseMonths } from "@/lib/search";
import { useStore } from "@/lib/store";
import type { Booking } from "@/lib/types";

const RELATIONS = ["Parents", "Family member", "Colleague", "Patient and caregiver", "Other"];
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_HOURS = 24;

const last10 = (v: string) => v.replace(/\D/g, "").slice(-10);

export default function BookPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-page px-5 py-16 text-graphite">Loading checkout</div>}>
      <Checkout />
    </Suspense>
  );
}

function Checkout() {
  const { id } = useParams<{ id: string }>();
  const { listings, bookings, addBooking } = useStore();
  const router = useRouter();
  const sp = useSearchParams();
  const listing = listings.find((l) => l.id === id);

  const months = parseMonths(sp.get("months"));
  const [move, setMove] = useState(sp.get("move") || "");
  useEffect(() => {
    if (!sp.get("move")) setMove(addDays(todayISO(), 7));
  }, [sp]);

  const [who, setWho] = useState<"me" | "else">(sp.get("who") === "else" ? "else" : "me");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [tried, setTried] = useState(false);
  const [paying, setPaying] = useState(false);

  if (!listing || listing.status !== "verified") {
    return (
      <div className="mx-auto max-w-page px-5 py-16">
        <EmptyState title="This home cannot be booked" text="It is either not verified yet or no longer listed.">
          <Link href="/stays" className="btn btn-primary">Find a stay</Link>
        </EmptyState>
      </div>
    );
  }

  const stayMonths = Math.max(months, listing.minMonths);
  const q = quote(listing.rent, stayMonths);
  const moveOut = move ? addStay(move, stayMonths) : "";

  const errors: Record<string, string> = {};
  if (name.trim().length < 2) errors.name = "Enter your full name";
  if (!PHONE_RE.test(last10(phone))) errors.phone = "Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9";
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email for the GST invoice";
  if (who === "else") {
    if (guestName.trim().length < 2) errors.guestName = "Enter the guest's name";
    if (!PHONE_RE.test(last10(guestPhone))) errors.guestPhone = "Enter the guest's 10-digit mobile number";
  }
  if (!move) errors.move = "Pick a move in date";
  const show = (k: string) => (tried ? errors[k] : undefined);

  function pay(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length > 0) {
      document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const bookingId = `WR-${2400 + bookings.length + 1}`;
    const booking: Booking = {
      id: bookingId,
      listingId: listing!.id,
      months: stayMonths,
      moveIn: move,
      forSomeoneElse: who === "else",
      bookerName: name.trim(),
      bookerPhone: last10(phone),
      guestName: who === "else" ? guestName.trim() : name.trim(),
      guestPhone: who === "else" ? last10(guestPhone) : last10(phone),
      relation: who === "else" ? relation : undefined,
      monthly: q.monthly,
      total: q.total,
      paidNow: q.monthly,
      method,
      status: "requested",
      createdAt: new Date().toISOString(),
    };
    setPaying(true);
    setTimeout(() => {
      addBooking(booking);
      router.push(`/trips?new=${bookingId}`);
    }, 1400);
  }

  return (
    <div className="mx-auto max-w-page px-5 py-8">
      <Link href={`/stays/${listing.id}`} className="text-sm font-semibold text-graphite hover:text-ink">
        Back to the home
      </Link>
      <h1 className="mt-4 text-3xl md:text-4xl">Request to book</h1>

      <form onSubmit={pay} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl">Who is staying</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                ["me", "Me", "I will be living here", Icon.User],
                ["else", "Someone else", "I am booking for them", Icon.Users],
              ] as const).map(([k, title, text, I]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={who === k}
                  onClick={() => setWho(k)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${who === k ? "border-ink bg-wall" : "border-line hover:border-ink"}`}
                >
                  <span className="flex items-center gap-2 font-semibold"><I size={18} /> {title}</span>
                  <span className="mt-1 block text-sm text-graphite">{text}</span>
                </button>
              ))}
            </div>
            {who === "else" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Guest's full name" htmlFor="g-name" error={show("guestName")}>
                  <input id="g-name" className="field" value={guestName} onChange={(e) => setGuestName(e.target.value)} autoComplete="off" />
                </Field>
                <Field label="Guest's mobile" htmlFor="g-phone" error={show("guestPhone")}>
                  <input id="g-phone" className="field" inputMode="tel" placeholder="98450 12345" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} autoComplete="off" />
                </Field>
                <Field label="Relation to you" htmlFor="g-rel">
                  <select id="g-rel" className="field" value={relation} onChange={(e) => setRelation(e.target.value)}>
                    {RELATIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="u-name" error={show("name")}>
                <input id="u-name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Mobile" htmlFor="u-phone" error={show("phone")}>
                <input id="u-phone" className="field" inputMode="tel" placeholder="98450 12345" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Email for the GST invoice" htmlFor="u-email" error={show("email")}>
                  <input id="u-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </Field>
              </div>
              <div>
                <Field label="Move in date" htmlFor="u-move" error={show("move")}>
                  <input id="u-move" type="date" className="field" min={todayISO()} value={move} onChange={(e) => setMove(e.target.value)} />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl">Payment</h2>
              <span className="rounded-full bg-ambersoft px-2.5 py-1 text-xs font-semibold text-amber">Test mode, no money moves</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {([
                ["upi", "UPI", "Pay from any UPI app"],
                ["card", "Card", "Debit or credit card"],
              ] as const).map(([k, title, text]) => (
                <label
                  key={k}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${method === k ? "border-ink bg-wall" : "border-line hover:border-ink"}`}
                >
                  <input type="radio" name="method" className="mt-1 accent-[#0E7C66]" checked={method === k} onChange={() => setMethod(k)} />
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-sm text-graphite">{text}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm text-graphite">
              The owner has {OWNER_HOURS} hours to accept. If they do not, your payment is refunded automatically.
            </p>
          </section>
        </div>

        <aside>
          <div className="panel sticky top-24 p-5">
            <PlanThumb listing={listing} className="h-40" />
            <h2 className="mt-4 text-lg leading-snug">{listing.title}</h2>
            <p className="text-sm text-graphite">{layoutLabel[listing.layout]}, {listing.area}</p>
            {move && (
              <p className="mt-3 flex items-center gap-2 text-sm text-graphite tnum">
                <Icon.Calendar size={16} /> {formatDate(move)} to {formatDate(moveOut)}, {stayLabel(stayMonths)}
              </p>
            )}
            <div className="mt-5 border-t border-line pt-5">
              <PriceBreakdown rent={listing.rent} months={stayMonths} />
            </div>
            <button type="submit" className="btn btn-seal mt-5 w-full" disabled={paying}>
              Pay {formatINR(q.monthly)} now
            </button>
            {stayMonths > 1 && move && (
              <p className="mt-2 text-center text-sm text-graphite tnum">
                Then {formatINR(q.monthly)} on the {ordinal(dayOfMonth(move))} of each month.
              </p>
            )}
          </div>
        </aside>
      </form>

      {paying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/95" role="status" aria-live="polite">
          <span className="spinner h-10 w-10 rounded-full border-[3px] border-line border-t-seal" />
          <p className="font-display text-xl font-semibold tnum">Confirming {formatINR(q.monthly)}</p>
        </div>
      )}
    </div>
  );
}
