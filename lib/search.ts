import { quote } from "./pricing";
import type { Layout, Listing, Segment } from "./types";

export type SortKey = "recommended" | "price" | "wifi" | "recent";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "price", label: "Lowest price" },
  { key: "wifi", label: "Fastest Wi-Fi" },
  { key: "recent", label: "Most recently verified" },
];

export const BUDGET_MIN = 30000;
export const BUDGET_MAX = 130000;

export interface Criteria {
  area?: string;
  segment?: Segment | "";
  sizes?: Layout[];
  months: number;
  budget?: number;
}

export function filterListings(listings: Listing[], c: Criteria): Listing[] {
  return listings.filter((l) => {
    if (l.status !== "verified") return false;
    if (c.area && l.area !== c.area) return false;
    if (c.segment && !l.segments.includes(c.segment)) return false;
    if (c.sizes && c.sizes.length && !c.sizes.includes(l.layout)) return false;
    if (l.minMonths > c.months) return false;
    if (c.budget !== undefined && quote(l.rent, c.months).perMonth > c.budget) return false;
    return true;
  });
}

export function sortListings(list: Listing[], key: SortKey, months: number): Listing[] {
  const out = [...list];
  switch (key) {
    case "price":
      return out.sort((a, b) => quote(a.rent, months).perMonth - quote(b.rent, months).perMonth);
    case "wifi":
      return out.sort((a, b) => b.wifiMbps - a.wifiMbps);
    case "recent":
      return out.sort((a, b) => (b.verifiedOn ?? "").localeCompare(a.verifiedOn ?? ""));
    default:
      return out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.stays - a.stays);
  }
}

export function parseSegment(v: string | null): Segment | "" {
  return v === "parents" || v === "work" || v === "treatment" ? v : "";
}

export function parseMonths(v: string | null, fallback = 1): number {
  const n = Number(v);
  return n === 0.5 || (Number.isInteger(n) && n >= 1 && n <= 6) ? n : fallback;
}
