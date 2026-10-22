"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icons";
import { EmptyState, PlanThumb, Rating, SegmentTags, VerifiedPill } from "@/components/ui";
import { AREAS, SEGMENTS, relevantNearby } from "@/lib/data";
import { STAY_OPTIONS, addDays, formatDate, stayLabel, stayOptionLabel, formatINR, layoutLabel, todayISO } from "@/lib/format";
import { quote } from "@/lib/pricing";
import {
  BUDGET_MAX,
  BUDGET_MIN,
  SORTS,
  filterListings,
  parseMonths,
  parseSegment,
  sortListings,
  type SortKey,
} from "@/lib/search";
import { useStore } from "@/lib/store";
import type { Layout, Listing, Segment } from "@/lib/types";

const StaysMap = dynamic(() => import("@/components/StaysMap"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[320px] animate-pulse rounded-2xl bg-wall" />,
});

const LAYOUTS: Layout[] = ["studio", "1bhk", "2bhk", "3bhk"];

export default function StaysPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-page px-5 py-16 text-graphite">Loading homes</div>}>
      <Stays />
    </Suspense>
  );
}

function Stays() {
  const { listings } = useStore();
  const router = useRouter();
  const sp = useSearchParams();

  const area = sp.get("area") ?? "";
  const segment = parseSegment(sp.get("for"));
  const sizes = (sp.get("size") ?? "").split(",").filter((s): s is Layout => LAYOUTS.includes(s as Layout));
  const months = parseMonths(sp.get("months"));
  const move = sp.get("move") || addDays(todayISO(), 7);
  const sortParam = sp.get("sort");
  const sort: SortKey = SORTS.some((s) => s.key === sortParam) ? (sortParam as SortKey) : "recommended";
  const budgetParam = Number(sp.get("budget"));
  const urlBudget = budgetParam >= BUDGET_MIN && budgetParam <= BUDGET_MAX ? budgetParam : BUDGET_MAX;

  const [budget, setBudget] = useState(urlBudget);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const view = sp.get("view") === "map" ? "map" : "list";
  useEffect(() => setBudget(urlBudget), [urlBudget]);

  function update(patch: Record<string, string | null>) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    router.replace(qs ? `/stays?${qs}` : "/stays", { scroll: false });
  }

  const results = useMemo(
    () => sortListings(filterListings(listings, { area, segment, sizes, months, budget }), sort, months),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listings, area, segment, sizes.join(","), months, budget, sort],
  );

  const carry = `?${new URLSearchParams({ ...(segment ? { for: segment } : {}), move, months: String(months) }).toString()}`;
  const filtersActive = !!segment || sizes.length > 0 || budget < BUDGET_MAX;

  const filters = (
    <div className="space-y-7">
      <div>
        <p className="label">Who is staying</p>
        <div className="flex flex-wrap gap-2">
          {([["", "Anyone"], ["parents", "Parents"], ["work", "Work"], ["treatment", "Treatment"]] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={segment === k}
              className={`chip ${segment === k ? "chip-on" : ""}`}
              onClick={() => update({ for: k })}
            >
              {label}
            </button>
          ))}
        </div>
        {segment && <p className="mt-3 text-sm text-graphite">{SEGMENTS[segment as Segment].blurb}</p>}
      </div>
      <div>
        <p className="label">Home size</p>
        <div className="flex flex-wrap gap-2">
          {LAYOUTS.map((l) => {
            const on = sizes.includes(l);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                className={`chip ${on ? "chip-on" : ""}`}
                onClick={() => update({ size: (on ? sizes.filter((s) => s !== l) : [...sizes, l]).join(",") })}
              >
                {layoutLabel[l]}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label htmlFor="budget" className="label">
          Monthly budget, up to <span className="font-semibold text-ink tnum">{formatINR(budget)}</span>
        </label>
        <input
          id="budget"
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={5000}
          value={budget}
          onChange={(e) => {
            const v = Number(e.target.value);
            setBudget(v);
            update({ budget: v >= BUDGET_MAX ? null : String(v) });
          }}
          className="w-full accent-[#0E7C66]"
        />
        <div className="flex justify-between text-xs text-graphite tnum">
          <span>{formatINR(BUDGET_MIN)}</span>
          <span>{formatINR(BUDGET_MAX)}</span>
        </div>
      </div>
      <button
        type="button"
        className="text-sm font-semibold text-seal hover:underline disabled:opacity-40"
        disabled={!filtersActive}
        onClick={() => update({ for: null, size: null, budget: null })}
      >
        Clear filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-page px-5 py-8">
      <div className="panel grid gap-4 p-4 sm:grid-cols-3">
        <div>
          <label htmlFor="s-area" className="label">Area</label>
          <select id="s-area" className="field" value={area} onChange={(e) => update({ area: e.target.value })}>
            <option value="">Anywhere in Bengaluru</option>
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="s-move" className="label">Move in date</label>
          <input id="s-move" type="date" className="field" value={move} onChange={(e) => update({ move: e.target.value })} />
        </div>
        <div>
          <label htmlFor="s-months" className="label">How long</label>
          <select id="s-months" className="field" value={months} onChange={(e) => update({ months: e.target.value })}>
            {STAY_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {stayOptionLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <button
            type="button"
            className="btn btn-quiet w-full lg:hidden"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            Filters{filtersActive ? " (on)" : ""}
          </button>
          <div className={`${filtersOpen ? "block" : "hidden"} mt-4 lg:mt-0 lg:block`}>{filters}</div>
        </aside>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl">
                {results.length} verified {results.length === 1 ? "home" : "homes"} in {area || "Bengaluru"}
              </h1>
              <p className="mt-1 text-sm text-graphite">
                From {formatDate(move)}, for {stayLabel(months)}. Prices include GST and all fees.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-line p-0.5" role="group" aria-label="Results view">
                {(["list", "map"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    onClick={() => update({ view: v === "map" ? "map" : null })}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${view === v ? "bg-ink text-white" : "text-ink"}`}
                  >
                    {v === "list" ? "List" : "Map"}
                  </button>
                ))}
              </div>
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select id="sort" className="field w-auto" value={sort} onChange={(e) => update({ sort: e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {view === "map" ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-[340px_1fr]">
              <div className="order-2 space-y-3 xl:order-1 xl:max-h-[70vh] xl:overflow-y-auto xl:pr-1">
                {results.length === 0 ? (
                  <EmptyState title="No homes match yet" text="Try a different area, a longer stay or a higher budget.">
                    <button type="button" className="btn btn-primary" onClick={() => router.replace("/stays?view=map")}>
                      Clear filters
                    </button>
                  </EmptyState>
                ) : (
                  results.map((l) => (
                    <MapRow
                      key={l.id}
                      listing={l}
                      months={months}
                      carry={carry}
                      active={l.id === activeId}
                      onActive={setActiveId}
                    />
                  ))
                )}
              </div>
              <div className="order-1 h-[60vh] xl:order-2 xl:h-[70vh]">
                <StaysMap results={results} months={months} activeId={activeId} onActive={setActiveId} carry={carry} />
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {results.length === 0 ? (
                <EmptyState title="No homes match yet" text="Try a different area, a longer stay or a higher budget.">
                  <button type="button" className="btn btn-primary" onClick={() => router.replace("/stays")}>
                    Clear filters
                  </button>
                </EmptyState>
              ) : (
                results.map((l) => <ResultRow key={l.id} listing={l} segment={segment} months={months} carry={carry} />)
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MapRow({
  listing: l,
  months,
  carry,
  active,
  onActive,
}: {
  listing: Listing;
  months: number;
  carry: string;
  active: boolean;
  onActive: (id: string | null) => void;
}) {
  const q = quote(l.rent, months);
  return (
    <div
      onMouseEnter={() => onActive(l.id)}
      onFocus={() => onActive(l.id)}
      className={`panel flex gap-3 p-3 transition-colors ${active ? "border-seal bg-sealsoft/40 ring-1 ring-seal" : "hover:border-ink"}`}
    >
      <PlanThumb listing={l} className="h-20 w-24 shrink-0 !p-1.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-graphite">{layoutLabel[l.layout]}, {l.area}</p>
        <Link href={`/stays/${l.id}${carry}`} className="block truncate font-display text-base font-semibold leading-snug hover:underline">
          {l.title}
        </Link>
        <p className="mt-0.5 text-sm tnum">
          <span className="font-semibold">{formatINR(q.perMonth)}</span>
          <span className="text-graphite"> a month, all in</span>
        </p>
        <Rating rating={l.rating} stays={l.stays} />
      </div>
    </div>
  );
}

function ResultRow({
  listing: l,
  segment,
  months,
  carry,
}: {
  listing: Listing;
  segment: Segment | "";
  months: number;
  carry: string;
}) {
  const q = quote(l.rent, months);
  const near = relevantNearby(l, segment);
  const NearIcon = near?.kind === "hospital" ? Icon.Hospital : near?.kind === "metro" ? Icon.Train : Icon.Briefcase;
  return (
    <Link
      href={`/stays/${l.id}${carry}`}
      className="panel grid gap-4 p-4 transition-colors hover:border-ink sm:grid-cols-[200px_1fr] md:grid-cols-[200px_1fr_auto]"
    >
      <PlanThumb listing={l} className="aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[150px]" />
      <div className="min-w-0">
        <VerifiedPill />
        <p className="mt-2 text-sm text-graphite tnum">
          {layoutLabel[l.layout]}, {l.sqft} sq ft
        </p>
        <h2 className="mt-0.5 text-xl leading-snug">{l.title}</h2>
        <p className="mt-0.5 text-sm text-graphite">{l.area}</p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-graphite">
          <li className="inline-flex items-center gap-1.5 tnum">
            <Icon.Wifi size={16} /> {l.wifiMbps} Mbps measured
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Icon.Lift size={16} /> {l.floor === 0 ? "Ground floor" : `Floor ${l.floor}`}, {l.lift ? "lift" : "no lift"}
          </li>
          {near && (
            <li className="inline-flex items-center gap-1.5 tnum">
              <NearIcon size={16} /> {near.km} km to {near.name}
            </li>
          )}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <SegmentTags segments={l.segments} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-line pt-3 sm:col-span-2 md:col-span-1 md:flex-col md:items-end md:justify-between md:border-t-0 md:pt-0 md:text-right">
        <Rating rating={l.rating} stays={l.stays} />
        <div>
          <p className="font-display text-3xl font-semibold tracking-tight tnum">{formatINR(q.perMonth)}</p>
          <p className="text-sm text-graphite">a month, all in</p>
          <p className="mt-1 text-sm text-graphite tnum">
            {formatINR(q.total)} for {stayLabel(months)}
            {q.longStay && <span className="font-semibold text-seal">, long-stay rate</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
