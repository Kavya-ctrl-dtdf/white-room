import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icons";
import FloorPlan from "./FloorPlan";
import { SEGMENTS } from "@/lib/data";
import { HOME_PHOTOS } from "@/lib/photos";
import { formatDate, formatINR, layoutLabel, stayLabel } from "@/lib/format";
import { quote } from "@/lib/pricing";
import type { BookingStatus, Listing, Segment } from "@/lib/types";

export function VerifiedPill({ date }: { date?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sealsoft px-2.5 py-1 text-xs font-semibold text-seal">
      <Icon.Shield size={14} />
      {date ? `Verified in person, ${formatDate(date)}` : "Verified"}
    </span>
  );
}

export function SegmentTags({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s) => (
        <span key={s} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-graphite">
          {SEGMENTS[s].label}
        </span>
      ))}
    </>
  );
}

export function Rating({ rating, stays }: { rating?: number; stays: number }) {
  if (!rating) return <span className="text-sm text-graphite">New, no stays yet</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-graphite">
      <Icon.Star size={14} className="text-amber" />
      <span className="font-semibold text-ink tnum">{rating.toFixed(1)}</span>
      <span className="tnum">{stays} stays</span>
    </span>
  );
}

const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  requested: { label: "Waiting for owner", cls: "bg-ambersoft text-amber" },
  confirmed: { label: "Confirmed", cls: "bg-sealsoft text-seal" },
  declined: { label: "Declined", cls: "bg-wall text-graphite" },
  cancelled: { label: "Cancelled", cls: "bg-wall text-graphite" },
  moved_in: { label: "Moved in", cls: "bg-sealsoft text-seal" },
  issue: { label: "Problem reported", cls: "bg-alertsoft text-alert" },
  resolved: { label: "Resolved", cls: "bg-sealsoft text-seal" },
};

export function StatusPill({ status }: { status: BookingStatus }) {
  const s = STATUS[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

export function ListingStatusPill({ status }: { status: Listing["status"] }) {
  if (status === "verified") return <VerifiedPill />;
  const pending = status === "pending";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        pending ? "bg-ambersoft text-amber" : "bg-alertsoft text-alert"
      }`}
    >
      {pending ? "Waiting for verification" : "Changes requested"}
    </span>
  );
}

export function PlanThumb({ listing, className = "" }: { listing: Listing; className?: string }) {
  return (
    <div className={`drafting flex items-center justify-center rounded-xl p-3 ${className}`}>
      <FloorPlan layout={listing.layout} variant={listing.variant} labels={false} className="h-full w-full" />
    </div>
  );
}

export function PriceBreakdown({ rent, months }: { rent: number; months: number }) {
  const q = quote(rent, months);
  return (
    <dl className="space-y-2 text-sm tnum">
      <Row label={q.short ? "Rent for 15 days" : "Rent"} value={formatINR(q.rent)} />
      {q.longStay && <Row label="Long-stay rate, 8% off" value={`−${formatINR(q.discount)}`} seal />}
      <Row label={`GST on stay, ${Math.round(q.gstRate * 100)}%`} value={formatINR(q.gst)} />
      <Row label="White Room fee, includes move-in protection" value={formatINR(q.fee)} />
      <Row label="GST on fee, 18%" value={formatINR(q.feeGst)} />
      <div className="flex items-baseline justify-between border-t border-line pt-3 font-semibold text-ink">
        <dt>{q.short ? "15 days, all in" : "Per month, all in"}</dt>
        <dd className="font-display text-lg">{formatINR(q.monthly)}</dd>
      </div>
      <div className="flex items-baseline justify-between text-graphite">
        <dt>{q.short ? "Paid once, nothing later" : `Total for ${stayLabel(months)}`}</dt>
        <dd className="font-semibold text-ink">{formatINR(q.total)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, value, seal }: { label: string; value: string; seal?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${seal ? "text-seal" : "text-graphite"}`}>
      <dt>{label}</dt>
      <dd className={seal ? "" : "text-ink"}>{value}</dd>
    </div>
  );
}

export function ListingCard({ listing, query = "" }: { listing: Listing; query?: string }) {
  const q = quote(listing.rent, 1);
  const photo = HOME_PHOTOS[listing.id];
  return (
    <Link
      href={`/stays/${listing.id}${query}`}
      className="panel group block overflow-hidden transition-colors hover:border-ink"
    >
      {photo ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-wall">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={`Sample interior photo for ${listing.title}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-graphite backdrop-blur">
            Sample photo
          </span>
          <div className="drafting absolute bottom-3 left-3 h-[72px] w-24 rounded-xl border border-line p-1.5 shadow-md">
            <FloorPlan layout={listing.layout} variant={listing.variant} labels={false} className="h-full w-full" />
          </div>
        </div>
      ) : (
        <PlanThumb listing={listing} className="aspect-[4/3] rounded-none" />
      )}
      <div className="p-4">
        {listing.verifiedOn ? <VerifiedPill date={listing.verifiedOn} /> : <ListingStatusPill status={listing.status} />}
        <h3 className="mt-3 text-lg leading-snug">{listing.title}</h3>
        <p className="mt-1 text-sm text-graphite">
          {layoutLabel[listing.layout]}, {listing.sqft} sq ft, {listing.area}
        </p>
        <p className="mt-3 text-sm text-graphite">
          <span className="font-display text-xl font-semibold text-ink tnum">{formatINR(q.monthly)}</span> a month, all in
        </p>
      </div>
    </Link>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="text-3xl md:text-4xl">{title}</h1>
      {children}
    </div>
  );
}

export function EmptyState({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="drafting rounded-2xl border border-line px-6 py-16 text-center">
      <h2 className="text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-graphite">{text}</p>
      {children && <div className="mt-6 flex justify-center gap-3">{children}</div>}
    </div>
  );
}

export function Field({
  label,
  error,
  children,
  htmlFor,
  hint,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  htmlFor: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-graphite">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-alert" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
